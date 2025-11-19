// Test which Gemini models work without 503 errors
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Models to test (from the list-models output)
const modelsToTest = [
  'gemini-2.0-flash-exp',
  'gemini-flash-latest', 
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest'
];

async function testModel(modelName) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{ parts: [{ text: 'Return JSON: {"status": "working"}' }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50,
        response_mime_type: 'application/json'
      }
    };
    
    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      timeout: 8000
    });
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const json = await response.json();
      const hasContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      return {
        model: modelName,
        status: '✅ WORKING',
        responseTime: `${responseTime}ms`,
        hasContent: !!hasContent
      };
    } else {
      const error = await response.text();
      const errorMsg = JSON.parse(error).error.message.substring(0, 50);
      return {
        model: modelName,
        status: `❌ ${response.status}`,
        responseTime: `${responseTime}ms`,
        error: errorMsg
      };
    }
  } catch (error) {
    return {
      model: modelName,
      status: '❌ ERROR',
      error: error.message.substring(0, 50)
    };
  }
}

async function testAllModels() {
  console.log('\n=== Testing Gemini Models for Availability ===\n');
  console.log('Model'.padEnd(35), 'Status'.padEnd(15), 'Response Time', 'Notes');
  console.log('='.repeat(80));
  
  for (const model of modelsToTest) {
    const result = await testModel(model);
    const notes = result.error || (result.hasContent ? 'Has content' : '');
    console.log(
      result.model.padEnd(35),
      result.status.padEnd(15),
      (result.responseTime || 'N/A').padEnd(13),
      notes
    );
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('='.repeat(80));
  console.log('\n✅ Recommended: Use the first working model in your .env file\n');
}

testAllModels().catch(console.error);
