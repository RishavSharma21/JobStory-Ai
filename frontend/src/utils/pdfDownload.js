// Comprehensive PDF Report Generator
export const generateCompleteReport = (analysisData, jobRole, resumeName, achievements) => {
  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Complete Resume Analysis Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 50px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        
        /* Header */
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 30px; }
        .header h1 { color: #1f2937; font-size: 32px; margin-bottom: 10px; }
        .header .subtitle { color: #6b7280; font-size: 16px; }
        
        /* Meta Info */
        .meta-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .meta-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .meta-label { font-weight: 600; color: #4b5563; }
        .meta-value { color: #1f2937; }
        
        /* Score Section */
        .score-section { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 40px; text-align: center; box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
        .score-number { font-size: 64px; font-weight: bold; margin-bottom: 10px; line-height: 1; }
        .score-level { font-size: 24px; font-weight: 600; margin-bottom: 15px; opacity: 0.95; }
        .score-explanation { font-size: 16px; opacity: 0.9; line-height: 1.8; max-width: 700px; margin: 0 auto; }
        
        /* Section Headers */
        h2 { color: #1f2937; font-size: 24px; margin: 40px 0 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px; }
        h3 { color: #374151; font-size: 18px; margin: 25px 0 15px; }
        
        /* Lists */
        ul { margin: 15px 0; padding-left: 0; list-style: none; }
        li { margin: 12px 0; padding-left: 30px; position: relative; line-height: 1.7; }
        li:before { content: '→'; position: absolute; left: 10px; color: #3b82f6; font-weight: bold; }
        
        /* Item Boxes */
        .item-box { padding: 16px 20px; margin: 12px 0; border-radius: 8px; border-left: 4px solid; }
        .error-item { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
        .warning-item { background: #fffbeb; border-color: #f59e0b; color: #92400e; }
        .success-item { background: #f0fdf4; border-color: #22c55e; color: #166534; }
        .info-item { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
        
        /* ATS Improvement Section */
        .boost-section { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6; }
        .boost-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .current-score { font-size: 36px; font-weight: bold; color: #f59e0b; }
        .target-score { font-size: 36px; font-weight: bold; color: #22c55e; }
        .boost-badge { background: #22c55e; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; }
        
        /* Before/After Boxes */
        .before-after { margin: 15px 0; }
        .before-box { background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
        .after-box { background: #f0fdf4; border: 2px solid #22c55e; padding: 15px; border-radius: 8px; }
        .box-label { font-weight: 700; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .before-box .box-label { color: #ef4444; }
        .after-box .box-label { color: #22c55e; }
        .box-content { font-family: 'Courier New', monospace; line-height: 1.6; }
        
        /* Skills Grid */
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .skill-card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .skill-card h4 { color: #1f2937; margin-bottom: 12px; font-size: 16px; }
        .skill-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; margin: 4px; font-size: 13px; }
        
        /* Stats */
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0; }
        .stat-box { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
        .stat-number { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
        .stat-label { color: #6b7280; font-size: 14px; }
        
        /* Footer */
        .footer { margin-top: 60px; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 13px; text-align: center; }
        .footer p { margin: 8px 0; }
        
        /* Print Styles */
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; padding: 30px; }
          h2 { page-break-after: avoid; }
          .item-box { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>📋 Complete Resume Analysis Report</h1>
          <div class="subtitle">Comprehensive AI-Powered Resume Review</div>
        </div>

        <!-- Meta Information -->
        <div class="meta-box">
          <div class="meta-row">
            <span class="meta-label">🎯 Target Position:</span>
            <span class="meta-value">${jobRole || 'Software Developer'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">📄 Resume File:</span>
            <span class="meta-value">${resumeName}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">📅 Analysis Date:</span>
            <span class="meta-value">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">🕒 Generated At:</span>
            <span class="meta-value">${new Date().toLocaleTimeString('en-US')}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">🤖 AI Model:</span>
            <span class="meta-value">Gemini Flash AI (Google)</span>
          </div>
        </div>

        <!-- ATS Score Section -->
        <div class="score-section">
          <div class="score-number">${analysisData?.atsScore?.score || 0}<span style="font-size: 32px; opacity: 0.8;">/100</span></div>
          <div class="score-level">${analysisData?.atsScore?.level || 'N/A'}</div>
          <div class="score-explanation">${analysisData?.atsScore?.explanation || 'Your resume has been analyzed for ATS compatibility and recruiter readability.'}</div>
        </div>

        <!-- Statistics Overview -->
        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-number">${analysisData?.mistakes?.length || 0}</div>
            <div class="stat-label">Issues Found</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${achievements?.length || 0}</div>
            <div class="stat-label">Improvements</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${(analysisData?.atsImprovement?.estimatedImprovement?.potentialScore || 0) - (analysisData?.atsImprovement?.estimatedImprovement?.currentScore || 0)}+</div>
            <div class="stat-label">Potential Boost</div>
          </div>
        </div>

        ${analysisData?.atsImprovement?.estimatedImprovement ? `
          <div class="boost-section">
            <h2 style="border: none; margin-top: 0;">💡 ATS Score Improvement Plan</h2>
            <div class="boost-header">
              <div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Current Score</div>
                <div class="current-score">${analysisData.atsImprovement.estimatedImprovement.currentScore}%</div>
              </div>
              <div style="font-size: 48px; color: #3b82f6;">→</div>
              <div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Target Score</div>
                <div class="target-score">${analysisData.atsImprovement.estimatedImprovement.potentialScore}%</div>
              </div>
              <div class="boost-badge">
                +${analysisData.atsImprovement.estimatedImprovement.potentialScore - analysisData.atsImprovement.estimatedImprovement.currentScore}% Boost
              </div>
            </div>
          </div>
        ` : ''}

        ${analysisData?.atsImprovement?.quickFixes && analysisData.atsImprovement.quickFixes.length > 0 ? `
          <h2>✨ Copy-Paste These Improvements</h2>
          ${analysisData.atsImprovement.quickFixes.map((fix, idx) => {
            const parts = fix.split('→');
            const hasBefore = parts.length === 2;
            const location = hasBefore ? parts[0].split(':')[0].trim() : fix.split(':')[0].trim();
            const beforeText = hasBefore ? parts[0].split(':').slice(1).join(':').trim().replace(/[\"']/g, '') : '';
            const afterText = hasBefore ? parts[1].trim().replace(/[\"']/g, '') : fix.split(':').slice(1).join(':').trim();
            
            return `
              <div class="item-box info-item" style="margin: 25px 0;">
                <strong style="color: #1e40af; font-size: 15px;">📍 ${location}</strong>
                ${hasBefore ? `
                  <div class="before-after">
                    <div class="before-box">
                      <div class="box-label">❌ Remove This:</div>
                      <div class="box-content">${beforeText}</div>
                    </div>
                    <div class="after-box">
                      <div class="box-label">✅ Add This Instead:</div>
                      <div class="box-content">${afterText}</div>
                    </div>
                  </div>
                ` : `
                  <div class="after-box" style="margin-top: 12px;">
                    <div class="box-label">✅ Add This:</div>
                    <div class="box-content">${afterText}</div>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        ` : ''}

        ${analysisData?.atsImprovement?.missingKeywords && analysisData.atsImprovement.missingKeywords.length > 0 ? `
          <h2>🔑 Add These Keywords</h2>
          <div class="item-box warning-item">
            <div style="font-size: 14px; margin-bottom: 12px; font-weight: 600;">Copy to your Skills section:</div>
            <div class="box-content" style="background: white; padding: 15px; border-radius: 6px;">
              ${analysisData.atsImprovement.missingKeywords.join(' • ')}
            </div>
          </div>
        ` : ''}

        ${analysisData?.mistakes && analysisData.mistakes.length > 0 ? `
          <h2>✍️ Grammar & Spelling Issues</h2>
          ${analysisData.mistakes.map(m => `
            <div class="item-box error-item">
              <strong>${m.type}:</strong> ${m.text}
            </div>
          `).join('')}
        ` : ''}

        ${achievements && achievements.length > 0 ? `
          <h2>🔧 Quick Fixes</h2>
          <ul>
            ${achievements.map(fix => `<li>${fix}</li>`).join('')}
          </ul>
        ` : ''}

        <h2>🚀 Next Steps</h2>
        <div class="item-box success-item">
          <ol style="margin: 15px 0; padding-left: 25px; list-style: decimal;">
            <li style="margin: 10px 0;">Implement all copy-paste improvements</li>
            <li style="margin: 10px 0;">Add missing keywords to Skills section</li>
            <li style="margin: 10px 0;">Fix grammar and spelling errors</li>
            <li style="margin: 10px 0;">Re-analyze to track improvement</li>
          </ol>
        </div>

        <div class="footer">
          <p><strong>JobStory AI - Complete Resume Analysis</strong></p>
          <p>© ${new Date().getFullYear()} JobStory AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([reportHTML], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resumeName.replace(/\.[^/.]+$/, '')}_Complete_Analysis_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
