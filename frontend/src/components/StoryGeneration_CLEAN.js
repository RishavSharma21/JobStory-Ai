import React, { useMemo, useRef, useState } from 'react';
import { MdSecurity, MdSpellcheck, MdFormatListBulleted, MdReportProblem, MdBuild, MdDownload, MdRefresh, MdDescription, MdAutoAwesome, MdPerson, MdCode, MdEditNote, MdGrammar, MdLightbulb } from 'react-icons/md';
import './StoryGeneration.css';

// Priority Issues Section (Clean version for sidebar)
const PriorityIssuesSection = ({ mistakeIssues, redFlags, scrollTo, mistakesRef, grammarRef }) => {
  return (
    <aside className="right-rail">
      <div className="rail-card">
        <div className="rail-title">Priority Issues</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {mistakeIssues.length > 0 && (
            <div style={{background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => scrollTo(mistakesRef, true)}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                <MdEditNote style={{color: '#fca5a5', fontSize: '1.4rem', flexShrink: 0}} />
                <div>
                  <div style={{fontSize: '0.7rem', fontWeight: '800', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'}}>Spelling</div>
                  <div style={{fontSize: '1rem', color: '#cbd5e1', fontWeight: '500'}}>{mistakeIssues.length} issue{mistakeIssues.length > 1 ? 's' : ''} found</div>
                </div>
              </div>
            </div>
          )}
          {mistakeIssues.length > 0 && (
            <div style={{background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => scrollTo(mistakesRef, true)}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                <MdGrammar style={{color: '#fbbf24', fontSize: '1.4rem', flexShrink: 0}} />
                <div>
                  <div style={{fontSize: '0.7rem', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'}}>Grammar</div>
                  <div style={{fontSize: '1rem', color: '#cbd5e1', fontWeight: '500'}}>{mistakeIssues.length} issue{mistakeIssues.length > 1 ? 's' : ''} found</div>
                </div>
              </div>
            </div>
          )}
          {redFlags.length > 0 && (
            <div style={{background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0.04) 100%)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => scrollTo(grammarRef, true)}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                <MdLightbulb style={{color: '#d8b4fe', fontSize: '1.4rem', flexShrink: 0}} />
                <div>
                  <div style={{fontSize: '0.7rem', fontWeight: '800', color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'}}>Recruiter Insights</div>
                  <div style={{fontSize: '1rem', color: '#cbd5e1', fontWeight: '500'}}>{redFlags.length} suggestion{redFlags.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default PriorityIssuesSection;
