// test-parser.js - Quick test for text parsing
const fs = require('fs');
const path = require('path');

// Test if libraries are working
async function testParsing() {
  try {
    console.log('Testing PDF parsing...');
    
    // Try to import pdf-parse
    const pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse loaded successfully');
    
    // Try to import mammoth
    const mammoth = require('mammoth');
    console.log('✅ mammoth loaded successfully');
    
    console.log('🎉 Text parsing libraries are working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testParsing();