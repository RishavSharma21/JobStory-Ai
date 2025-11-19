// Quick test script to verify Gemini API connectivity
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  console.log('\n=== Testing Gemini API ===');
  console.log(`API Key: ${apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : 'NOT SET'}`);
  console.log(`Model: ${model}\n`);
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
    return;
  }
  
  try {
    const cleanModel = model.replace(/^models\//, '');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
    
    console.log(`Testing endpoint: ${endpoint.substring(0, 80)}...\n`);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: 'Say "Hello, I am working!" in JSON format with a "message" field.'
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50,
        response_mime_type: 'application/json'
      }
    };
    
    console.log('Sending test request...');
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`Response received in ${responseTime}ms`);
    console.log(`Status: ${response.status} ${response.statusText}\n`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:');
      console.error(errorText.substring(0, 500));
      return;
    }
    
    const json = await response.json();
    const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('✅ Success! API is working correctly.');
    console.log('\nAPI Response:');
    console.log(JSON.stringify(json, null, 2));
    
    if (responseText) {
      console.log('\nExtracted Text:');
      console.log(responseText);
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(responseText);
        console.log('\n✅ Response is valid JSON:');
        console.log(parsed);
      } catch (e) {
        console.log('\n⚠️ Response is not valid JSON (this is OK for some prompts)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

// Run the test
testGeminiAPI().then(() => {
  console.log('\n=== Test Complete ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
