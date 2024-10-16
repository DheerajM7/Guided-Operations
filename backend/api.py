from flask import Flask, request, jsonify
from flask import make_response
from flask_cors import CORS
import os
import base64
from anthropic import Anthropic, AnthropicBedrock
from tools import read_file_contents, create_streamlit_chart, read_file_contents_tool, create_streamlit_chart_tool
from telemetry_generator import generate_telemetry_data
import fitz
from PIL import Image
import io
import redis
from dotenv import load_dotenv
load_dotenv()

r = redis.Redis(host='localhost', port=6379, db=0)

app = Flask(__name__)

# Enable CORS for all routes, all methods, and all headers from http://localhost:3000
CORS(app)

# Anthropic client setup
anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
aws_client = AnthropicBedrock(
    # Authenticate by either providing the keys below or use the default AWS credential providers, such as
    # using ~/.aws/credentials or the "AWS_SECRET_ACCESS_KEY" and "AWS_ACCESS_KEY_ID" environment variables.
    aws_access_key=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    # Temporary credentials can be used with aws_session_token.
    # Read more at https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html.
    aws_session_token=os.getenv('AWS_SESSION_KEY'),
    # aws_region changes the aws region to which the request is made. By default, we read AWS_REGION,
    # and if that's not present, we default to us-east-1. Note that we do not read ~/.aws/config for the region.
    aws_region="us-west-2",
)
direct_client = Anthropic(api_key=anthropic_api_key)
SUB_AGENT_GENERATOR_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0'
MAIN_MODEL = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
DIRECT_LLM = 'claude-3-5-sonnet-20240620'

def pdf_to_base64_pngs(pdf_file, quality=75, max_size=(1024, 1024)):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    base64_encoded_pngs = []

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)

        image_data = io.BytesIO()
        image.save(image_data, format='PNG', optimize=True, quality=quality)
        image_data.seek(0)
        base64_encoded = base64.b64encode(image_data.getvalue()).decode('utf-8')
        base64_encoded_pngs.append(base64_encoded)

    doc.close()
    return base64_encoded_pngs

def generate_haiku_prompt(prompt):
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }
    ]

    response = aws_client.messages.create(
        model=MAIN_MODEL,
        max_tokens=10240,
        messages=messages
    )

    return response.content[0].text

def extract_info(base64_encoded_pngs, haiku_prompt, previous_response, start_page, end_page, total_pages, is_first_batch, is_last_batch):
    context = f"""
    You are processing a batch of images from a PDF manual. 
    This batch contains pages {start_page} to {end_page} out of {total_pages} total pages.
    {'This is the first batch of images.' if is_first_batch else ''}
    {'This is the last batch of images.' if is_last_batch else ''}
    
    Your task is to convert the content of these images into XML format. Follow these rules:
    1. If this is the first batch, start with the <manual> opening tag.
    2. Do not close the </manual> tag unless this is the last batch.
    3. Encapsulate each page's content within <page> tags, including the page number as an attribute.
    4. Describe images in detail, enclosing descriptions within <image> tags.
    5. Preserve all procedural steps and content structure.
    6. Do not use placeholders or abbreviations; include all information in full detail.
    
    If applicable, here is the content of the previous response to continue from: {previous_response}
    
    Proceed with the XML generation for this batch of images.
    """

    messages = [
        {
            "role": "user",
            "content": [
                *[{"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": png}} for png in base64_encoded_pngs],
                {"type": "text", "text": f'{haiku_prompt}\n\n{context}'}
            ]
        }
    ]

    response = aws_client.messages.create(
        model=MAIN_MODEL,
        max_tokens=8192,
        messages=messages
    )

    return response.content[0].text

def process_pdf(base64_encoded_pngs):
    previous_response = ''
    full_response = []
    haiku_prompt = generate_haiku_prompt("Generate a specific prompt for an LLM sub-agent...")

    batch_size = max(1, min(2, len(base64_encoded_pngs)))
    total_pages = len(base64_encoded_pngs)

    for i in range(0, total_pages, batch_size):
        batch = base64_encoded_pngs[i:i+batch_size]
        start_page = i + 1
        end_page = min(i + batch_size, total_pages)
        is_first_batch = (i == 0)
        is_last_batch = (end_page == total_pages)

        response = extract_info(
            batch, 
            haiku_prompt, 
            previous_response, 
            start_page, 
            end_page, 
            total_pages, 
            is_first_batch, 
            is_last_batch
        )
        
        previous_response = response
        full_response.append(previous_response)

        if is_last_batch:
            break

    full_xml_content = ''.join(full_response)
    
    # Cache the XML content in Redis
    redis_key = "xml_document"  # Customize the Redis key as needed
    r.set(redis_key, full_xml_content)
    print(f"XML content stored in Redis with key: {redis_key}")

    return full_xml_content




def extract_xml(unformatted_text):
    start_tag = '<manual>'
    end_tag = '</manual>'

    start_index = unformatted_text.find(start_tag)
    end_index = unformatted_text.rfind(end_tag) + len(end_tag)

    if start_index != -1 and end_index != -1:
        return unformatted_text[start_index:end_index]
    else:
        return ""

from telemetry_generator import generate_telemetry_data  # Import your telemetry generator

def chat_with_claude(prompt, xml_content=None):
    # If xml_content is not provided, it's a general query
    if xml_content:
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"<manual>{xml_content}</manual>",
                    },
                    {
                        "type": "text",
                        "text": prompt
                    },
                ]
            }
        ]
    else:
        # General query, no manual is referenced
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]

    try:
        # If the prompt is related to telemetry, generate telemetry data
        if "telemetry" in prompt.lower():
            telemetry_data = generate_telemetry_data()  # Generate telemetry data
            response_text = "Here's the telemetry data you requested. You can see it in the chart below."
            return {"text": response_text, "telemetry": telemetry_data}

        # Otherwise, use the Claude model for a general AI response
        response = aws_client.messages.create(
            model=MAIN_MODEL,
            max_tokens=4096,
            messages=messages,
            system="Respond to general queries unless provided with specific XML content from a manual.",
        )

        # Return the AI response text
        return {"text": response.content[0].text}
    except Exception as e:
        print(f"Error querying Claude model: {e}")
        return {"text": "There was an error querying the AI model."}





@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Guided Operations API"}), 200

@app.route('/api/process_pdf', methods=['POST'])
def api_process_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and file.filename.endswith('.pdf'):
        try:
            # Process the PDF and convert to XML
            base64_pngs = pdf_to_base64_pngs(file)
            full_response = process_pdf(base64_pngs)
            xml_content = extract_xml(full_response)

            # Construct the path to save the XML
            file_name = f"context/xml/{file.filename.split('.')[0]}.xml"
            print(f"Saving XML file to {file_name}")  # Log the path

            # Write the XML content to the file
            with open(file_name, 'w') as f:
                f.write(xml_content)

            return jsonify({"message": "PDF processed successfully", "file_name": file_name}), 200
        except Exception as e:
            print(f"Error processing PDF: {e}")  # Log error
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400


@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_input = data.get('user_input')
    selected_xml = data.get('selected_xml')
    
    if not user_input:
        return jsonify({"error": "No user input provided"}), 400

    try:
        # If no manual (XML) is selected, return general AI responses
        if not selected_xml:
            # Send the user input to Claude for a general response
            response = chat_with_claude(user_input)
        else:
            # Manual is selected, proceed with referencing the XML document
            xml_path = os.path.join('context', 'xml', selected_xml)
            if not os.path.exists(xml_path):
                return jsonify({"error": f"XML file {selected_xml} not found at {xml_path}"}), 404

            # Open and read the XML file contents
            with open(xml_path, 'r') as f:
                xml_content = f.read()

            # Pass the XML content to the AI model for reference
            response = chat_with_claude(user_input, xml_content)

        return jsonify({"response": response}), 200

    except Exception as e:
        print(f"Error in /api/chat: {e}")  # Log error details
        return jsonify({"error": str(e)}), 500






@app.route('/api/list_xml_files', methods=['GET'])
def api_list_xml_files():
    try:
        xml_files = [f for f in os.listdir('context/xml') if f.endswith('.xml')]
        return jsonify({"xml_files": xml_files}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)



#Telemetry API
@app.route('/api/telemetry', methods=['GET'])
def api_telemetry():
    try:
        # Call the function to generate telemetry data
        telemetry_data = generate_telemetry_data()
        return jsonify(telemetry_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
