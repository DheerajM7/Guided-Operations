# Guided Operations Test

This project is a React application with a Flask backend for processing PDFs and interacting with an AI model.

## Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- pip (Python package installer)

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd guided-operations-test
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Set up the Python virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r backend/requirements.txt
   ```

4. Create a `.env` file in the root directory and add your environment variables:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

## Running the Application

You can start both the frontend and backend simultaneously using:

```
npm run start-all
```

This will start:
- The React frontend on http://localhost:3000
- The Node.js server on http://localhost:3001
- The Flask backend on http://localhost:5000

## Development

- To run only the React frontend: `npm start`
- To run only the Node.js server: `npm run server`
- To run only the Flask backend: 
  ```
  cd backend
  python backend.py
  ```

## Features

- Upload and process PDF files
- Interact with an AI model to ask questions about the processed PDF content
- Real-time chat interface

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
