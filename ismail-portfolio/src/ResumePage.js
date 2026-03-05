// ResumePage.js
import React from 'react';

const ResumePage = () => {
  return (
    <div className="resume-page">
      <div className="resume-header">
        <h1>My Resume</h1>
        <a 
          href="/resume/ismail-resume.pdf" 
          download="MD-Ismail-Hosen-Resume.pdf"
          className="download-btn"
        >
          <i className="fas fa-download"></i> Download PDF
        </a>
      </div>
      <div className="pdf-viewer">
        <iframe
          src="/resume/ismail-resume.pdf"
          title="Resume"
          width="100%"
          height="800px"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};

export default ResumePage;