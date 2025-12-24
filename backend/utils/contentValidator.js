// backend/utils/contentValidator.js
// Validates resume and job description content

/**
 * Validates if the extracted text appears to be a valid resume
 * @param {string} extractedText - The text extracted from PDF
 * @returns {Object} - { isValid: boolean, confidence: number, reason: string }
 */
function validateResume(extractedText) {
    // Layer 1: Basic checks
    if (!extractedText || typeof extractedText !== 'string') {
        return {
            isValid: false,
            confidence: 0,
            reason: 'No text content provided'
        };
    }

    const text = extractedText.toLowerCase().trim();
    const wordCount = text.split(/\s+/).length;

    // Minimum length check (resumes should have at least 100 words)
    if (wordCount < 100) {
        return {
            isValid: false,
            confidence: 0,
            reason: 'Content too short. A resume typically contains at least 100 words.'
        };
    }

    // Layer 2: Keyword-based validation
    const resumeKeywords = {
        // Essential resume sections
        sections: ['experience', 'education', 'skill', 'project', 'work', 'summary', 'objective'],
        // Educational terms
        education: ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma', 'graduate', 'gpa', 'cgpa'],
        // Contact information
        contact: ['email', 'phone', 'linkedin', 'github', 'portfolio', 'contact'],
        // Work-related
        work: ['company', 'intern', 'employ', 'position', 'role', 'responsibility', 'achieve'],
        // Technical skills
        technical: ['programming', 'software', 'developer', 'engineer', 'technology', 'framework', 'language']
    };

    let matchCounts = {
        sections: 0,
        education: 0,
        contact: 0,
        work: 0,
        technical: 0
    };

    // Check for keyword matches in each category
    Object.keys(resumeKeywords).forEach(category => {
        resumeKeywords[category].forEach(keyword => {
            if (text.includes(keyword)) {
                matchCounts[category]++;
            }
        });
    });

    // Calculate confidence score
    const sectionMatches = matchCounts.sections;
    const educationMatches = matchCounts.education;
    const contactMatches = matchCounts.contact;
    const workMatches = matchCounts.work;
    const technicalMatches = matchCounts.technical;

    // Resume validation criteria:
    // 1. Must have at least 2 section keywords (experience, education, skills, etc.)
    // 2. Must have at least 1 education OR work keyword
    // 3. Should have contact information

    const hasRequiredSections = sectionMatches >= 2;
    const hasEducationOrWork = (educationMatches + workMatches) >= 1;
    const hasContactInfo = contactMatches >= 1;

    // Calculate confidence percentage
    let confidence = 0;
    if (hasRequiredSections) confidence += 40;
    if (hasEducationOrWork) confidence += 30;
    if (hasContactInfo) confidence += 20;
    if (technicalMatches > 0) confidence += 10;

    const isValid = hasRequiredSections && hasEducationOrWork;

    if (!isValid) {
        let reasons = [];
        if (!hasRequiredSections) {
            reasons.push('Missing typical resume sections (Experience, Education, Skills, etc.)');
        }
        if (!hasEducationOrWork) {
            reasons.push('No educational background or work experience found');
        }
        if (!hasContactInfo) {
            reasons.push('No contact information detected');
        }

        return {
            isValid: false,
            confidence: confidence,
            reason: `This doesn't appear to be a resume. ${reasons.join('. ')}.`
        };
    }

    return {
        isValid: true,
        confidence: confidence,
        reason: 'Valid resume content detected'
    };
}

/**
 * Validates if the text appears to be a valid job description
 * @param {string} jdText - The job description text
 * @returns {Object} - { isValid: boolean, confidence: number, reason: string }
 */
function validateJobDescription(jdText) {
    // Skip validation if no JD provided (it's optional)
    if (!jdText || !jdText.trim()) {
        return {
            isValid: true, // Empty JD is valid (optional field)
            confidence: 0,
            reason: 'No job description provided (optional)',
            isEmpty: true
        };
    }

    const text = jdText.toLowerCase().trim();
    const wordCount = text.split(/\s+/).length;

    // Minimum length check (JD should have at least 50 words)
    if (wordCount < 50) {
        return {
            isValid: false,
            confidence: 0,
            reason: 'Job description too short. Please provide a detailed job description (minimum 50 words).',
            isEmpty: false
        };
    }

    // Job description keywords
    const jdKeywords = {
        // Job posting terms
        posting: ['position', 'role', 'job', 'vacancy', 'opening', 'hiring', 'career', 'opportunity'],
        // Requirements
        requirements: ['requirement', 'qualification', 'must have', 'should have', 'mandatory', 'essential', 'preferred'],
        // Responsibilities
        responsibilities: ['responsibility', 'duties', 'tasks', 'accountable', 'responsible for'],
        // Skills
        skills: ['skill', 'experience', 'knowledge', 'proficiency', 'expertise', 'ability'],
        // Work-related
        work: ['work', 'working', 'team', 'collaborate', 'develop', 'manage', 'lead']
    };

    let matchCounts = {
        posting: 0,
        requirements: 0,
        responsibilities: 0,
        skills: 0,
        work: 0
    };

    // Check for keyword matches
    Object.keys(jdKeywords).forEach(category => {
        jdKeywords[category].forEach(keyword => {
            if (text.includes(keyword)) {
                matchCounts[category]++;
            }
        });
    });

    // JD validation criteria
    const hasPosting = matchCounts.posting >= 1;
    const hasRequirements = matchCounts.requirements >= 1;
    const hasResponsibilities = matchCounts.responsibilities >= 1;
    const hasSkills = matchCounts.skills >= 1;

    // Calculate confidence
    let confidence = 0;
    if (hasPosting) confidence += 25;
    if (hasRequirements) confidence += 25;
    if (hasResponsibilities) confidence += 25;
    if (hasSkills) confidence += 25;

    // At least 2 categories should match
    const categoriesMatched = [hasPosting, hasRequirements, hasResponsibilities, hasSkills].filter(Boolean).length;
    const isValid = categoriesMatched >= 2;

    if (!isValid) {
        return {
            isValid: false,
            confidence: confidence,
            reason: 'This doesn\'t appear to be a valid job description. Please include job requirements, responsibilities, or required skills.',
            isEmpty: false
        };
    }

    return {
        isValid: true,
        confidence: confidence,
        reason: 'Valid job description detected',
        isEmpty: false
    };
}

module.exports = {
    validateResume,
    validateJobDescription
};
