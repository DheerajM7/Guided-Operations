README.md
md
Copy code
# Guided Operations AI Assistant

This project is an AI-powered assistant that allows users to input queries via text or voice (speech-to-text). It allows users to upload PDF manuals, convert them to XML format, and then interact with an AI assistant to get information from these manuals and visualize telemetry data when applicable. Users can interact through a frontend React application and communicate with a Flask backend.

## Features

- **PDF to XML conversion**: Users can type queries in the input box.
- **AI-powered chat interface for querying manual contents**: Users can input & speak queries using the microphone, which will be converted to text and submitted automatically.
- **Dynamic chart generation based on telemetry data**: The assistant generates dynamic charts based on the telemetry data
- **Token usage tracking**: Keeps track of token usage

## Prerequisites

Before running this project, ensure that you have the following installed:

- **Node.js** (v14 or later) and **npm** (v6 or later)
- **Python** (v3.8 or later)
- **pip** (v20 or later)
- **Redis** (Ensure Redis is installed and running locally on `localhost:6379`)

## Backend Setup (Flask)

The backend is built using Flask and communicates with AI models to process user input and return responses.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>

2. Create and Activate a Virtual Environment
bash
Copy code
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

3. Install Python Dependencies
bash
Copy code
pip install -r requirements.txt

4. Create a .env File
Create a .env file in the root directory of the backend with the following content. Add your own API keys for the necessary services:

makefile
Copy code
ANTHROPIC_API_KEY=<your_anthropic_api_key>
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
AWS_SESSION_KEY=<your_aws_session_token>
OPENAI_API_KEY=<your_openai_api_key>

5. Start Redis Server
Ensure Redis is installed and running on localhost:6379. You can start Redis with the following command:

bash
Copy code
# Start Redis server
redis-server
6. Start the Flask Backend
After Redis is running, you can start the Flask server:

bash
Copy code
python api.py
The Flask server will be running at http://localhost:5000.



Frontend Setup (React)
The frontend is built using React and provides the user interface for interacting with the AI assistant.

1. Navigate to the Frontend Directory
bash
Copy code
cd frontend
2. Install Node.js Dependencies
bash
Copy code
npm install
3. Create a .env File
Create a .env file in the frontend directory with the following content:

arduino
Copy code
REACT_APP_BACKEND_URL=http://localhost:5000
This ensures that the frontend communicates with the Flask backend running on localhost:5000.

4. Start the React Frontend
bash
Copy code
npm start
The frontend will be running at http://localhost:3000.

Usage
Open the frontend in your browser at http://localhost:3000.
Type a query or click the microphone icon to use voice input.
AI responses will be displayed in the chat interface, and telemetry data will be shown when applicable.
Available Scripts
In the project directory, you can run:

npm start
Runs the React app in development mode.
Open http://localhost:3000 to view it in the browser.

python api.py
Runs the Flask backend.
Open http://localhost:5000 to access the backend.

Requirements
Backend Dependencies (from requirements.txt)
Flask
Flask-CORS
python-dotenv
anthropic
redis
fitz (PyMuPDF)
Pillow
base64
boto3 (for AWS connections)
Frontend Dependencies
These will be automatically installed when you run npm install in the frontend directory.

React
Material UI
React Markdown
Chart.js
React-Chartjs-2
Troubleshooting
Redis is not running: Make sure Redis is installed and running locally on localhost:6379. You can download Redis from here.
Missing environment variables: Ensure you have added the correct API keys in the .env file for both the backend and frontend.
Port conflicts: If another service is running on port 3000 (for frontend) or port 5000 (for backend), stop the conflicting service or modify the ports in the configuration.
License
This project is licensed under the MIT License - see the LICENSE file for details.

markdown
Copy code

---

### Explanation of the Sections:

1. **Prerequisites**: Lists the software and tools needed before running the application.
2. **Backend Setup**: Describes the steps for setting up and running the Flask backend.
3. **Frontend Setup**: Describes the steps for setting up and running the React frontend.
4. **Usage**: Brief instructions on how to run the project after setup.
5. **Scripts**: Commands for starting the backend and frontend.
6. **Dependencies**: Lists the required Python and JavaScript dependencies.
7. **Troubleshooting**: Covers common issues like Redis not running or port conflicts.
8. **License**: Mentions the license for the project.
