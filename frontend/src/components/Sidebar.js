import React, { useEffect, useRef, useState } from 'react';
import '../styles/Sidebar.css';
import burgerIcon from '../assets/icons/burger.png';
import settingIcon from '../assets/icons/settings.png';
import uploadIcon from '../assets/icons/upload.png';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Sidebar({ isOpen, toggleSidebar, onManualSelect }) {
  const sidebarRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [manuals, setManuals] = useState([]);
  const [selectedManual, setSelectedManual] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a PDF file.');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${backendUrl}/api/process_pdf`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('File uploaded and processed successfully!');
        fetchManuals();
      } else {
        setUploadStatus('Failed to process the file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchManuals = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/list_xml_files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setManuals(data.xml_files);
    } catch (error) {
      console.error('Error fetching manuals:', error);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const handleManualChange = (e) => {
    const selected = e.target.value;
    setSelectedManual(selected);
    onManualSelect(selected);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <img src={burgerIcon} alt="Toggle Sidebar" className="burger-icon" />
      </div>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <img src={settingIcon} alt="Setting Sidebar" className="setting-icon" />
      </div>
      <div className="sidebar-content">
        {isOpen && (
          <>
            <h2 className="sidebar-heading">Upload PDF</h2>
            <div className="dropdown-wrapper">
              <div className="dropdown-header" onClick={toggleDropdown}>
                <span>Instructions</span>
                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-content">
                  <p>Upload a PDF file to convert to XML format. Once uploaded, you can chat with Claude to get information from the PDF.</p>
                </div>
              )}
            </div>
            <div className="upload-section">
              <p className="upload-label">Choose a PDF file</p>
              <label className="file-upload-area">
                <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                <div className="file-upload-placeholder">
                  <p>Browse files</p>
                  <p>Drag and drop file here</p>
                  <img src={uploadIcon} alt="Upload Icon" className="upload-icon" />
                  <p>Limit 200MB per file. PDF only</p>
                </div>
              </label>
              {selectedFile && (
                <>
                  <p className="file-name">Selected File: {selectedFile.name}</p>
                  <button onClick={handleFileUpload} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </>
              )}
              {isUploading && (
                <div className="loader">
                  <div className="spinner"></div>
                  <p>Uploading PDF...</p>
                </div>
              )}
              {uploadStatus && (
                <p className={`upload-status ${uploadStatus.includes('success') ? 'success' : 'error'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>

            <div className="manual-select-section">
              <p className="manual-select-label">Select Manual to Reference</p>
              <select
                value={selectedManual}
                onChange={handleManualChange}
                className={`manual-select ${selectedManual === "" ? "placeholder" : ""}`}
              >
                <option value="" disabled hidden>
                  Select a manual
                </option>
                {manuals.map((manual, index) => (
                  <option key={index} value={manual}>
                    {manual}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
