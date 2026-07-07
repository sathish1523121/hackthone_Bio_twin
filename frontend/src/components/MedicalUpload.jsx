import React, { useState, useRef } from 'react';

export default function MedicalUpload({ userId, token, profile, onUploadSuccess, onStartGeneration }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endswith?.('.pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Unsupported file type. Only PDF reports are supported.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    uploadFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = (fileToUpload) => {
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress interval
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reports/upload`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    .then(async (res) => {
      clearInterval(interval);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload failed");
      }
      return res.json();
    })
    .then((data) => {
      setProgress(100);
      setUploading(false);
      setUploadedData(data);
      onUploadSuccess(data);
    })
    .catch((err) => {
      clearInterval(interval);
      setUploading(false);
      setProgress(0);
      setError(err.message || "Failed to parse medical document. Make sure it is a valid PDF.");
      setFile(null);
    });
  };

  const handleGenerate = async () => {
    if (!uploadedData) return;
    onStartGeneration(uploadedData);
  };

  return (
    <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.6rem' }}>Health Document Upload</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>
        Upload your medical reports so your AI twin can understand your health better.
      </p>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!file && (
        <div 
          className={`upload-zone ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            accept=".pdf"
          />
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
          <h4 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Drag & drop your medical reports here</h4>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '15px' }}>
            Supports Blood Reports, Health Checkups, Lab Reports (PDF only)
          </p>
          <button type="button" className="btn btn-secondary" style={{ pointerEvents: 'none' }}>
            Choose File
          </button>
        </div>
      )}

      {/* Uploading Progress */}
      {file && uploading && (
        <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500 }}>Uploading: {file.name}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', transition: 'width 0.2s' }}></div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', textAlign: 'center' }}>
            Analyzing layout and reading PDF content...
          </p>
        </div>
      )}

      {/* Upload Completed */}
      {file && !uploading && uploadedData && (
        <div className="animate-fade-in-up" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--accent-emerald)', marginBottom: '12px' }}>✅</div>
          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '5px' }}>{file.name}</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Your reports are ready for AI analysis.
          </p>
          
          <button 
            type="button" 
            className="btn btn-primary animate-pulse-glow" 
            onClick={handleGenerate}
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Generate My BioTwin Report
          </button>
        </div>
      )}
    </div>
  );
}
