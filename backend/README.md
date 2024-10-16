# Guided Operations API

This project is a Flask-based API that demonstrates guided operations using AI. It allows users to upload PDF manuals, convert them to XML format, and then interact with an AI assistant to get information from these manuals.

## Features

- PDF to XML conversion
- AI-powered chat interface for querying manual contents
- RESTful API for frontend integration

## Prerequisites

- Python 3.7+
- Anthropic API key (for Claude AI)

## Project Structure

```
.
├── api.py              # Main Flask API implementation
├── run.py              # Script to run the Flask server
├── tools.py            # Utility functions for file operations
├── requirements.txt    # Python dependencies
├── README.md           # This file
├── context/
│   └── xml/            # Directory for storing converted XML files
└── assets/             # Directory for storing images and other assets
```

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/guided-operations-api.git
   cd guided-operations-api
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up your Anthropic API key as an environment variable:
   ```
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

1. Start the Flask API server:
   ```
   python run.py
   ```

2. The API will be available at `http://localhost:5000`

## API Endpoints

- `GET /`: Welcome message
- `POST /api/process_pdf`: Upload and process a PDF file
- `POST /api/chat`: Send a message to the AI assistant
- `GET /api/list_xml_files`: Get a list of available XML files

For detailed API documentation, refer to the `api.py` file.

## Frontend Integration

This API is designed to work with a separate frontend application. To integrate with a frontend:

1. Ensure your frontend application is making API calls to `http://localhost:5000` (or the appropriate host and port where the API is running).
2. Use the provided API endpoints to interact with the backend functionality.
3. Handle responses and errors appropriately in your frontend application.

If you encounter CORS issues, make sure your frontend's domain is allowed in the CORS configuration in `api.py`.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed correctly.
2. Check that the Anthropic API key is set correctly as an environment variable.
3. Verify that the `context/xml/` directory exists and is writable.
4. Check the console output for any error messages when running the API.

For any persistent issues, please open an issue on the GitHub repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
