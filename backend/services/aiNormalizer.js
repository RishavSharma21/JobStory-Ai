// services/aiNormalizer.js - Map AI (campus) results to Resume.aiAnalysis schema

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
  if (['strong candidate', 'very good', 'ready'].some(k => val.includes(k))) return 'Good';
  if (['decent', 'average', 'ok', 'fair'].some(k => val.includes(k))) return 'Fair';
  if (['needs work', 'needs improvement', 'poor', 'weak'].some(k => val.includes(k))) return 'Poor';
  // Fallback by score; default to Fair if score not usable
  if (typeof score === 'number') {
    const s = clamp(score, 0, 100);
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  }
  return 'Fair';
}

// Normalizes the campus placement JSON into the schema fields under aiAnalysis
function normalizeCampusAnalysis(ai) {
  const score = Number(ai?.campusReadinessScore?.score);
  const levelRaw = ai?.campusReadinessScore?.level;

  const strengths = [];
  if (Array.isArray(ai?.recruiterInsights?.technicalStrengths)) {
    strengths.push(...ai.recruiterInsights.technicalStrengths);
  }
  if (Array.isArray(ai?.recruiterInsights?.academicHighlights)) {
    strengths.push(...ai.recruiterInsights.academicHighlights);
  }

  const growthAreas = Array.isArray(ai?.recruiterInsights?.areasForImprovement)
    ? ai.recruiterInsights.areasForImprovement
    : [];

  const recommendations = Array.isArray(ai?.recruiterInsights?.placementAdvice)
    ? ai.recruiterInsights.placementAdvice
    : [];

  const skills = Array.isArray(ai?.skills) ? ai.skills : [];

  return {
    atsScore: {
      score: clamp(score, 0, 100),
      level: mapAtsLevel(levelRaw, score),
      explanation: ai?.campusReadinessScore?.explanation || ai?.summary || ''
    },
    recruiterInsights: {
      overview: ai?.recruiterInsights?.overview || ai?.summary || '',
      keyStrengths: strengths,
      redFlags: [],
      recommendations
    },
    strengths,
    growthAreas,
    jobMatching: {
      targetRole: ai?.companyMatching?.targetRole || '',
      matchPercentage: clamp(ai?.companyMatching?.suitability, 0, 100),
      matchingSkills: skills, // heuristic
      missingSkills: [],
      recommendations: ai?.companyMatching?.recommendations || ''
    },
    keywordAnalysis: {
      presentKeywords: skills,
      missingKeywords: [],
      keywordDensity: 0
    },
    overallSummary: ai?.summary || '',
    aiModel: ai?.aiModel || '',
    processedAt: ai?.processedAt ? new Date(ai.processedAt) : new Date(),
    processingTime: Number(ai?.processingTime) || undefined
  };
}

module.exports = { normalizeCampusAnalysis };
