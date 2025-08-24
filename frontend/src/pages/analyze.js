import React from "react";

const Analyze = ({ resume, jobRole }) => {
  return (
    <div className="analyze-page">
      <h1>Analyze Resume</h1>
      <p><strong>Job Role:</strong> {jobRole || "Not provided"}</p>
      <p><strong>Resume:</strong> {resume ? "Uploaded ✅" : "Not uploaded"}</p>
    </div>
  );
};

export default Analyze;
