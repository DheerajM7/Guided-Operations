import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.js';
import ChatInterface from './components/ChatInterface.js';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  // Manages sidebar state
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);  // Tracks if first message was sent
  const [selectedManual, setSelectedManual] = useState('');  // Tracks the selected XML manual

  // Toggles the sidebar open/close state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Callback function for when the first message is sent
  const handleFirstMessageSent = () => {
    setIsFirstMessageSent(true);
  };

  // Callback function to handle manual selection from Sidebar
  const handleManualSelect = (manual) => {
    setSelectedManual(manual);  // Update the selected manual
    console.log("Selected manual:", manual);  // For debugging purposes
  };

  return (
    <div className="App">
      {/* Sidebar component with manual selection handler */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onManualSelect={handleManualSelect}  // Pass manual select handler to Sidebar
      />

      <div className={`main-content ${isSidebarOpen ? 'blur-background' : ''}`}>
        <h1 className="chat-heading">Guided Operations</h1>

        {!isFirstMessageSent && (
          <div className="welcome-message-container">
            <div className="welcome-message">
              <div className="welcome-message-front">
                <span className="highlighted-word">Welcome to Guided Operations!</span>
                <p>
                  Speak the solution into existence. Elevate your workflow with guided operations where intelligent, real-time assistance transforms challenges into streamlined success.
                </p>
              </div>
              <div className="welcome-message-back">
              <span className="highlighted-word-back">Step into the future of operational excellence!</span>
                <p> Watch as complex tasks transform into effortless workflows through intelligent, real-time support. Every solution is just a conversation away.</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat interface with selected manual passed as a prop */}
        <ChatInterface
          onFirstMessageSent={handleFirstMessageSent}
          selectedManual={selectedManual}  // Pass the selected manual to ChatInterface
        />
      </div>
    </div>
  );
}

export default App;
