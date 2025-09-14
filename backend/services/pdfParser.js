// pdfParser.js - Simplified PDF Text Extractor for AI Resume Storyteller
const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Class to handle robust PDF text extraction and basic cleaning.
 */
class UniversalTextExtractor {
  /**
   * Create a UniversalTextExtractor.
   * @param {Object} options - Configuration options.
   * @param {number} [options.maxFileSize=10485760] - Maximum file size in bytes (default 10MB).
   * @param {number} [options.minTextLength=50] - Minimum acceptable text length.
   */
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.minTextLength = options.minTextLength || 50; // Minimum characters expected
    this.startTime = null;
    this.usedStrategies = [];
  }

  /**
   * Validate input file properties.
   * @param {Object} file - The Multer file object or similar.
   * @throws {Error} If validation fails.
   */
  validateInput(file) {
    if (!file) {
      throw new Error('No file provided');
    }
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }
    // Allow mimetype to be undefined (e.g., if not checked by Multer globally)
    // but if provided, it must be PDF.
    if (file.mimetype && file.mimetype !== 'application/pdf') {
      throw new Error('Invalid file type. Only PDF files are supported.');
    }
  }

  /**
   * Extract text using multiple pdf-parse strategies for robustness.
   * @param {Object} file - The Multer file object ({ buffer, path, mimetype, size }).
   * @returns {Promise<string>} The extracted raw text.
   * @throws {Error} If all strategies fail.
   */
  async extractTextWithStrategies(file) {
    // Determine buffer source
    const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);

    if (!buffer) {
        throw new Error('File buffer or path is required for text extraction.');
    }

    // Define multiple parsing strategies for robustness
    const strategies = [
      // Strategy 1: Modern rendering with text positioning (often best)
      {
        name: 'Modern Positioning',
        options: { useNewRendering: true, normalizeWhitespace: false, disableCombineTextItems: false }
      },
      // Strategy 2: Legacy compatible with normalization
      {
        name: 'Legacy Normalized',
        options: { useNewRendering: false, normalizeWhitespace: true, disableCombineTextItems: true }
      },
      // Strategy 3: Raw extraction for complex layouts
      {
        name: 'Raw Complex',
        options: { useNewRendering: true, normalizeWhitespace: false, disableCombineTextItems: true, preserveSpaces: true }
      },
      // Strategy 4: High compatibility mode
      {
        name: 'High Compatibility',
        options: { useNewRendering: false, normalizeWhitespace: false, disableCombineTextItems: false, ignoreErrors: true }
      }
    ];

    let extractedText = '';
    let successful = false;

    for (const strategy of strategies) {
      try {
        // console.log(`[PdfParser] Trying ${strategy.name} extraction...`); // Use console.log or your logger
        const result = await pdfParse(buffer, strategy.options);
        if (this.isValidText(result.text)) {
          extractedText = result.text;
          successful = true;
          this.usedStrategies.push(strategy.name);
          // console.log(`[PdfParser] ${strategy.name} extraction successful`);
          break; // Stop if successful
        } else {
          // console.log(`[PdfParser] ${strategy.name} produced insufficient text`);
        }
      } catch (error) {
        // console.log(`[PdfParser] ${strategy.name} failed: ${error.message}`);
        continue; // Try next strategy on failure
      }
    }

    if (!successful) {
      throw new Error('All extraction strategies failed. PDF may be corrupted or image-based.');
    }

    return extractedText;
  }

  /**
   * Validate extracted text quality (basic check).
   * @param {string} text - The extracted text.
   * @returns {boolean} True if text is considered valid.
   */
  isValidText(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmedText = text.trim();
    if (trimmedText.length < this.minTextLength) return false;

    // Check for reasonable character distribution
    const alphaCount = (trimmedText.match(/[a-zA-Z]/g) || []).length;
    const alphaRatio = alphaCount / trimmedText.length;
    return alphaRatio > 0.3; // At least 30% alphabetic characters
  }

  /**
   * Basic text cleaning and preprocessing to improve AI input quality.
   * @param {string} text - The raw extracted text.
   * @returns {string} The cleaned text.
   */
  preprocessText(text) {
    // console.log('[PdfParser] Preprocessing extracted text...');
    if (!text || typeof text !== 'string') return '';

    return text
      // Fix common encoding issues (add more if needed)
      .replace(/\u00A0/g, ' ')       // Non-breaking space
      .replace(/\u2013/g, '-')        // En dash
      .replace(/\u2019/g, "'")        // Right single quote
      .replace(/\u201C/g, '"')        // Left double quote
      .replace(/\u201D/g, '"')        // Right double quote
      .replace(/\u2026/g, '...')      // Ellipsis

      // Normalize line breaks and basic spacing
      .replace(/\r\n/g, '\n')         // Normalize Windows line endings
      .replace(/\r/g, '\n')           // Normalize Mac line endings
      .replace(/\f/g, '\n')           // Replace form feeds with newlines
      .replace(/\t/g, ' ')            // Replace tabs with spaces

      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')

      // Clean up spacing (this part is crucial for AI input)
      .replace(/[ ]{2,}/g, ' ')       // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n')     // Replace 3+ newlines with double newline (paragraph break)
      .replace(/^[ \t]+/gm, '')       // Remove leading whitespace from lines
      .replace(/[ \t]+$/gm, '')       // Remove trailing whitespace from lines

      // Optional: Remove common artifacts (you can adjust/remove these)
      .replace(/^Page \d+( of \d+)?$/gim, '') // Remove page numbers like "Page 1"
      .replace(/^\d+$/gm, '')                // Remove lines with only numbers (often page numbers)
      .replace(/^-+$/gm, '')                 // Remove lines with only dashes
      .replace(/\(Tip:.*?\)/gis, '')         // Remove "Tip:" sections

      .trim(); // Final trim
  }

  /**
   * Main function to extract and clean text from a PDF file.
   * @param {Object} file - The Multer file object ({ buffer, path, mimetype, size }).
   * @returns {Promise<Object>} An object containing rawText, cleanedText, and metadata.
   */
  async extractTextFromFile(file) {
    this.startTime = Date.now();
    this.usedStrategies = [];

    // 1. Validate input
    this.validateInput(file);

    // 2. Extract raw text using robust strategies
    const rawText = await this.extractTextWithStrategies(file);

    // 3. Clean and preprocess the text
    const cleanedText = this.preprocessText(rawText);

    const processingTime = Date.now() - this.startTime;

    // Return both raw and cleaned text for flexibility, along with metadata
    return {
      rawText: rawText,
      cleanedText: cleanedText, // This is probably what you want to send to AI
      metadata: {
        usedStrategies: this.usedStrategies,
        processingTime: processingTime,
        textLength: cleanedText.length
      }
    };
  }
}

/**
 * Convenience function for direct usage.
 * Extracts and cleans text from a PDF file.
 * @param {Object} file - The Multer file object.
 * @returns {Promise<Object>} The extraction result object.
 */
async function extractTextFromFile(file) {
  const extractor = new UniversalTextExtractor();
  return await extractor.extractTextFromFile(file);
}

// Export functions for easy usage
module.exports = {
  UniversalTextExtractor, // Export the class itself if needed for instantiation with options
  extractTextFromFile     // Export the main convenience function
};
