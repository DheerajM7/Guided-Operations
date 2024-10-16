import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import 'chart.js/auto';
import micIcon from '../assets/icons/mic.png';
import sendIcon from '../assets/icons/send.png';
import '../styles/ChatInterface.css';
import TelemetryChart from './TelemetryChart.js';  // Import the telemetry chart component
import useSpeechRecognition from './useSpeechRecognition.js';  // Import the custom hook for mic functionality

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const QuickSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [
    { main: 'How do I start', description: '[specific task]?' },
    { main: 'Can you guide me through', description: '[process]?' },
    { main: 'How do I fix', description: '[issue/error]?' }
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2, flexWrap: 'wrap' }}>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.main}
          variant="contained"
          onClick={() => onSuggestionClick(suggestion.main)}
          sx={{
            mx: 1,
            my: 1,
            color: '#FFFFFF',
            backgroundColor: '#284F7D',
            borderRadius: '10px',
            padding: '5px 60px',
            textTransform: 'none',
            boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)',
            '&:hover': {
              backgroundColor: '#3A7BC8',
            }
          }}
        >
         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '21px', fontWeight: 600, fontFamily: 'Urbanist' }}>
              {suggestion.main}
            </Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 400, opacity: 0.8, fontFamily: 'Urbanist' }}>
              {suggestion.description}
            </Typography>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

const ChatInterface = ({ onFirstMessageSent, selectedManual }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [telemetryData, setTelemetryData] = useState(null); // State to store telemetry data
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use the custom speech recognition hook
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  // Update inputMessage when the transcript changes
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript); // Set the inputMessage to the transcribed text
      handleSendMessage(); // Automatically send the query once the transcript is received
    }
  }, [transcript]);

  // Handle pressing "Enter" key to send the message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevents newline (default behavior of Enter key)
      handleSendMessage();  // Call the function to send the message
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      if (!isFirstMessageSent) {
        setIsFirstMessageSent(true);
        onFirstMessageSent();
      }

      setLoading(true);
      setErrorMessage(''); // Clear previous error message

      try {
        let apiResponse;
        if (selectedManual) {
          // If a manual is selected, use the manual in the backend request
          apiResponse = await fetchManualResponse(inputMessage, selectedManual);
        } else {
          // General AI response if no manual is selected
          apiResponse = await getClaudeResponse(inputMessage);
        }

        // Extract the actual response from the API
        const { response } = apiResponse;

        // Check if the response contains telemetry data
        if (response.telemetry) {
          setTelemetryData(response.telemetry); // Set telemetry data for the chart
          setAiResponse(''); // Clear AI response when telemetry data is present
        } else {
          setAiResponse(response.text); // Set AI text response
          setTelemetryData(null);  // Clear telemetry data if not present in response
        }

      } catch (error) {
        console.error('Error fetching AI response:', error);
        setErrorMessage('Error fetching AI response. Please try again later.');
      } finally {
        setInputMessage('');
        setLoading(false);
      }
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const fetchManualResponse = async (message, manual) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: message,
          selected_xml: manual,
          model: 'claude-v1',
          max_tokens_to_sample: 300,
        }),
      });

      if (!response.ok) {
        throw new Error('Error in fetching response from server.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
  };

  const getClaudeResponse = async (message) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: message,
          model: 'claude-v1',
          max_tokens_to_sample: 300,
        }),
      });

      if (!response.ok) {
        throw new Error('Error in fetching response from server.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
  };

  return (
    <div className={`chat-interface ${isFirstMessageSent ? 'chat-interface-active' : ''}`}>
      {!isFirstMessageSent && <p className="question">What can I help you with?</p>}

      <div className={`message-input ${isFirstMessageSent ? 'message-input-bottom' : ''}`}>
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter your prompt here..."
            onKeyDown={handleKeyPress}  // Add the event listener for the Enter key
          />
          <img
            src={micIcon}
            alt="Microphone"
            className="mic-icon"
            onClick={handleMicClick}
            style={{ opacity: isListening ? 1 : 0.5 }}
            aria-label={isListening ? "Listening..." : "Activate voice input"}
          />
          <img
            src={sendIcon}
            alt="Send"
            className="send-icon"
            onClick={handleSendMessage}
            aria-label="Send message"
            style={{ opacity: inputMessage.trim() === '' ? 0.5 : 1 }}
          />
        </div>
      </div>

      {!isFirstMessageSent && <QuickSuggestions onSuggestionClick={(suggestion) => setInputMessage(suggestion)} />}

      {loading && (
        <div className="loading">
          <p>Generating...</p>
        </div>
      )}

      {/* Only show AI response if telemetry data is not present */}
      {aiResponse && !telemetryData && (
        <div className={`ai-response ${!loading ? 'active' : ''}`}>
          <ReactMarkdown>{aiResponse}</ReactMarkdown>
        </div>
      )}

      {/* Render telemetry chart if telemetry data is present */}
      {telemetryData && <TelemetryChart telemetryData={telemetryData} />}

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
