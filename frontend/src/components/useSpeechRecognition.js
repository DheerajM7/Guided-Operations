import { useState, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false); // Mic listening state
  const [transcript, setTranscript] = useState(''); // The transcribed text
  const [recognition, setRecognition] = useState(null); // The SpeechRecognition instance

  useEffect(() => {
    // Check if the browser supports the SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      setIsListening(false); // Stop listening after the speech is transcribed
    };

    recognitionInstance.onend = () => {
      setIsListening(false); // Reset listening state when recognition ends
    };

    setRecognition(recognitionInstance); // Store the instance for later use
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    } else {
      console.error('SpeechRecognition is not initialized.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    } else {
      console.error('SpeechRecognition is not initialized.');
    }
  };

  return { isListening, transcript, startListening, stopListening };
};

export default useSpeechRecognition;
