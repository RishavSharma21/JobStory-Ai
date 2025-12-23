// Comprehensive Report Generator (HTML Format)
// Downloads a beautiful, printable HTML file that can be saved as PDF
export const generateCompleteReport = (analysisData, jobRole, resumeName, achievements) => {
  // Safety checks
  const safeResumeName = resumeName || 'Resume';
  const safeJobRole = jobRole || 'Target Role';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const score = analysisData?.atsScore?.score || 0;
  const jdScore = analysisData?.jdScore || 0; // Receive JD Score

  // Theme Variables
  const colors = {
    primary: '#10b981', // Emerald
    bg: '#fffdf5', // Cream
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
  };

  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Analysis Report - ${safeResumeName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: ${colors.primary};
          --bg-app: ${colors.bg};
          --bg-surface: ${colors.surface};
          --text-main: ${colors.text};
          --text-muted: ${colors.textMuted};
          --border: ${colors.border};
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          line-height: 1.6; 
          color: var(--text-main); 
          background: var(--bg-app); 
          padding: 40px; 
          -webkit-print-color-adjust: exact;
        }

        .container { 
          max-width: 900px; 
          margin: 0 auto; 
          background: var(--bg-surface); 
          padding: 60px; 
          border-radius: 24px; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.05); 
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        
        /* Header */
        .header { 
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px; 
          padding-bottom: 30px; 
          border-bottom: 2px solid var(--border); 
        }
        
        .brand { font-size: 24px; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; }
        .report-title { font-size: 32px; font-weight: 700; color: var(--text-main); margin-top: 10px; }
        .meta-info { text-align: right; color: var(--text-muted); font-size: 14px; }
        
        /* Scores Row */
        .scores-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 50px;
        }

        /* Hero Score Card */
        .hero { 
          display: flex; 
          align-items: center; 
          gap: 24px; 
          background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); 
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 30px; 
          border-radius: 20px; 
        }
        
        .score-circle {
          position: relative;
          width: 100px;  /* FIXED WIDTH for perfect circle */
          height: 100px; /* FIXED HEIGHT for perfect circle */
          min-width: 100px; /* Prevent squashing */
          min-height: 100px;
          flex-shrink: 0;   /* STOP FLEX SQUASHING */
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 8px solid var(--primary);
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
          background: white;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
        }

        .jd-circle {
           border-color: #f59e0b; /* Amber for JD */
           color: #f59e0b;
           box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
        }
        
        .hero-content h2 { margin-bottom: 5px; font-size: 18px; font-weight: 700; }
        .hero-text { color: var(--text-muted); font-size: 14px; line-height: 1.4; }

        /* Sections */
        h3 { 
          font-size: 18px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          color: var(--text-muted); 
          margin: 40px 0 20px; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          font-weight: 600;
        }
        
        h3::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* Generic Card */
        .card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .card h4 { margin-bottom: 8px; color: var(--text-main); }
        .card p { color: var(--text-muted); font-size: 14px; }

        /* Grid */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        /* Badges */
        .badge { 
          display: inline-block; 
          padding: 4px 12px; 
          border-radius: 100px; 
          font-size: 12px; 
          font-weight: 600; 
          text-transform: uppercase; 
        }
        .badge-issue { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

        /* Lists */
        ul.clean-list { list-style: none; }
        ul.clean-list li { 
          padding: 12px 16px; 
          border-bottom: 1px solid var(--border); 
          font-size: 14px; 
          display: flex; 
          justify-content: space-between;
        }
        ul.clean-list li:last-child { border-bottom: none; }

        .highlight-red { color: #ef4444; font-weight: 500; }
        .highlight-green { color: #10b981; font-weight: 500; }

        /* Footer */
        .footer { 
          margin-top: 60px; 
          text-align: center; 
          color: var(--text-muted); 
          font-size: 12px; 
          border-top: 1px solid var(--border);
          padding-top: 30px;
        }

        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; border: none; padding: 0; }
          .hero, .card { -webkit-print-color-adjust: exact; }
          /* Ensure grid works in print */
          .scores-row, .grid-2 { display: flex; gap: 20px; } 
          .scores-row > div, .grid-2 > div { flex: 1; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- HEADER -->
        <div class="header">
          <div>
            <div class="brand">JobStory AI</div>
            <div class="report-title">Resume Analysis</div>
          </div>
          <div class="meta-info">
            <p><strong>Candidate:</strong> ${safeResumeName}</p>
            <p><strong>Target Role:</strong> ${safeJobRole}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
          </div>
        </div>

        <!-- SCORES ROW -->
        <div class="scores-row">
            <!-- ATS SCORE -->
            <div class="hero">
              <div class="score-circle">
                ${score}
              </div>
              <div class="hero-content">
                <h2>ATS Match Score</h2>
                <p class="hero-text">Technical compatibility score based on formatting and readability.</p>
              </div>
            </div>

            <!-- JD SCORE -->
            <div class="hero" style="background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-color: rgba(245, 158, 11, 0.2);">
              <div class="score-circle jd-circle">
                ${jdScore}
              </div>
              <div class="hero-content">
                <h2>JD Match Score</h2>
                <p class="hero-text">Relevance score based on keyword matching with the job description.</p>
              </div>
            </div>
        </div>

        <!-- BREAKDOWN GRID -->
        <h3>Detailed Breakdown</h3>
        <div class="grid-2">
           <div class="card">
             <h4>Category Scores</h4>
             <ul class="clean-list">
               <li><span>Education</span> <span class="${(analysisData?.atsScore?.breakdown?.education || 0) > 7 ? 'highlight-green' : 'highlight-red'}">${analysisData?.atsScore?.breakdown?.education || 0}/10</span></li>
               <li><span>Skills</span> <span class="${(analysisData?.atsScore?.breakdown?.skills || 0) > 7 ? 'highlight-green' : 'highlight-red'}">${analysisData?.atsScore?.breakdown?.skills || 0}/10</span></li>
               <li><span>Experience</span> <span class="${(analysisData?.atsScore?.breakdown?.experience || 0) > 7 ? 'highlight-green' : 'highlight-red'}">${analysisData?.atsScore?.breakdown?.experience || 0}/10</span></li>
               <li><span>Formatting</span> <span class="${(analysisData?.atsScore?.breakdown?.formatting || 0) > 7 ? 'highlight-green' : 'highlight-red'}">${analysisData?.atsScore?.breakdown?.formatting || 0}/10</span></li>
             </ul>
           </div>
           
           <div class="card">
             <h4>Recruiter Impression</h4>
             <p>"${analysisData?.recruiterInsights?.verdict || 'No verdict available.'}"</p>
             <div style="margin-top: 15px;">
                ${(analysisData?.recruiterInsights?.keyStrengths || []).slice(0, 2).map((s) =>
    `<span style="display:block; margin-bottom:4px; font-size:13px;">✅ ${typeof s === 'string' ? s : s.text}</span>`
  ).join('')}
                ${(analysisData?.recruiterInsights?.concerningAreas || []).slice(0, 2).map((s) =>
    `<span style="display:block; margin-bottom:4px; font-size:13px; color:#ef4444;">⚠️ ${typeof s === 'string' ? s : s.text}</span>`
  ).join('')}
             </div>
           </div>
        </div>

        <!-- CRITICAL ISSUES -->
        ${(analysisData?.mistakes && analysisData.mistakes.length > 0) ? `
          <h3>Critical Issues to Fix</h3>
          ${analysisData.mistakes.map(m => `
            <div class="card" style="border-left: 4px solid #ef4444;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                 <h4 style="color:#ef4444; margin:0;">${m.type}</h4>
                 <span class="badge badge-issue">Fix Priority</span>
              </div>
              <p>${m.text}</p>
            </div>
          `).join('')}
        ` : ''}

        <!-- MISSING KEYWORDS -->
        ${(analysisData?.atsImprovement?.missingKeywords && analysisData.atsImprovement.missingKeywords.length > 0) ? `
           <h3>Missing Keywords</h3>
           <div class="card">
             <p style="margin-bottom:12px;">Add these keywords to your resume to pass ATS filters for <strong>${safeJobRole}</strong>:</p>
             <div style="display:flex; flex-wrap:wrap; gap:8px;">
               ${analysisData.atsImprovement.missingKeywords.map(k =>
    `<span style="background:#f1f5f9; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:500;">${k}</span>`
  ).join('')}
             </div>
           </div>
        ` : ''}

        <!-- QUICK FIXES -->
        ${(achievements && achievements.length > 0) ? `
          <h3>Action Plan</h3>
          <div class="card">
            <ul class="clean-list">
              ${achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          Generated by JobStory AI • Professional Resume Intelligence
        </div>

      </div>
    </body>
    </html>
  `;

  // Create blob and download (Crash-proof)
  try {
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Safe formatting for filename
    const safeFilename = safeResumeName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFilename}_analysis_report.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Download failed inside utils:", e);
    // Fallback?
    alert("Could not initiate download. Please check browser permissions.");
  }
};
