// services/aiNormalizer.js - Map AI results to Resume.aiAnalysis schema

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(num) ? num : 0));
}

function mapAtsLevel(rawLevel, score) {
  if (!rawLevel && typeof score === 'number') {
    const s = clamp(score, 0, 100);
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  }

  const val = String(rawLevel || '').toLowerCase();
  if (['excellent', 'top tier', 'top-tier', 'outstanding'].some(k => val.includes(k))) return 'Excellent';
  if (['strong candidate', 'very good', 'ready', 'good'].some(k => val.includes(k))) return 'Good';
  if (['decent', 'average', 'ok', 'fair'].some(k => val.includes(k))) return 'Fair';
  if (['needs work', 'needs improvement', 'poor', 'weak'].some(k => val.includes(k))) return 'Poor';
  if (typeof score === 'number') {
    const s = clamp(score, 0, 100);
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  }
  return 'Fair';
}

// Normalizes the NEW 5-feature AI response into the schema fields
function normalizeCampusAnalysis(ai) {
  const score = Number(ai?.atsScore?.score) || 0;
  const levelRaw = ai?.atsScore?.level || '';

  // Extract from the new simplified structure
  const grammarSpelling = Array.isArray(ai?.grammarSpelling) ? ai.grammarSpelling : [];
  const quickFixes = Array.isArray(ai?.quickFixes) ? ai.quickFixes : [];
  const skillsPresent = Array.isArray(ai?.skillKeywordGaps?.skills_present) ? ai.skillKeywordGaps.skills_present : [];
  const missingSkills = Array.isArray(ai?.skillKeywordGaps?.critical_missing) ? ai.skillKeywordGaps.critical_missing : [];

  // Extract ATS improvement data
  const atsImprovement = ai?.atsImprovement || {};
  const missingKeywords = Array.isArray(atsImprovement.missingKeywords) ? atsImprovement.missingKeywords : [];
  const atsQuickFixes = Array.isArray(atsImprovement.quickFixes) ? atsImprovement.quickFixes : [];
  const formatWarnings = Array.isArray(atsImprovement.formatWarnings) ? atsImprovement.formatWarnings : [];
  const estimatedImprovement = atsImprovement.estimatedImprovement || {
    currentScore: score,
    potentialScore: Math.min(score + 12, 100),
    impact: 'Medium'
  };

  return {
    overallScore: clamp(score, 0, 100),
    sectionScores: ai?.sectionScores || {},
    atsScore: {
      score: clamp(score, 0, 100),
      level: mapAtsLevel(levelRaw, score),
      explanation: ai?.atsScore?.explanation || ai?.summary || ''
    },
    // Include the original atsAnalysis for frontend compatibility
    atsAnalysis: {
      keywordMatchScore: clamp(Number(ai?.atsAnalysis?.keywordMatchScore) || 0, 0, 100),
      presentKeywords: Array.isArray(ai?.atsAnalysis?.presentKeywords) ? ai.atsAnalysis.presentKeywords : skillsPresent,
      missingKeywords: Array.isArray(ai?.atsAnalysis?.missingKeywords) ? ai.atsAnalysis.missingKeywords : missingSkills,
    },
    readabilityScore: {
      score: clamp(Number(ai?.readabilityScore?.score) || 0, 0, 100),
      level: ai?.readabilityScore?.level || 'Moderate',
      explanation: ai?.readabilityScore?.explanation || ''
    },
    formatScore: {
      score: clamp(Number(ai?.formatScore?.score) || 0, 0, 100),
      level: ai?.formatScore?.level || 'Fair',
      explanation: ai?.formatScore?.explanation || ''
    },
    atsImprovement: {
      missingKeywords: missingKeywords,
      quickFixes: atsQuickFixes,
      formatWarnings: formatWarnings,
      estimatedImprovement: {
        currentScore: clamp(estimatedImprovement.currentScore || score, 0, 100),
        potentialScore: clamp(estimatedImprovement.potentialScore || Math.min(score + 12, 100), 0, 100),
        impact: estimatedImprovement.impact || 'Medium'
      }
    },
    grammarSpelling: grammarSpelling,
    strengths: quickFixes.slice(0, 3),
    growthAreas: quickFixes,
    jobMatching: {
      targetRole: '',
      matchPercentage: clamp(score, 0, 100),
      matchingSkills: skillsPresent,
      missingSkills: missingSkills,
      recommendations: missingSkills.join(', ')
    },
    keywordAnalysis: {
      presentKeywords: skillsPresent,
      missingKeywords: missingSkills,
      keywordDensity: 0
    },
    overallSummary: ai?.summary || `ATS Score: ${score}/100. ${quickFixes.length} improvements recommended.`,
    aiModel: ai?.aiModel || '',
    processedAt: ai?.processedAt ? new Date(ai.processedAt) : new Date(),
    processingTime: Number(ai?.processingTime) || undefined
  };
}

module.exports = { normalizeCampusAnalysis };
