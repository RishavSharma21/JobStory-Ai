// Quick Gemini API Test
require('dotenv').config();
const fetch = require('node-fetch');

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

console.log('='.repeat(60));
console.log('GEMINI API STATUS CHECK');
console.log('='.repeat(60));
console.log('API Key:', apiKey ? `Configured (${apiKey.substring(0, 15)}...)` : 'NOT CONFIGURED');
console.log('Model:', model);
console.log('');

if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

const testPrompt = 'Say "API Working" if you can read this.';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

console.log('Testing API connection...\n');

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: testPrompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 50
    }
  })
})
.then(async response => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ API ERROR:', response.status, response.statusText);
    console.error('Error Details:', JSON.stringify(data, null, 2));
    
    if (data.error?.code === 429) {
      console.error('\n⚠️  QUOTA EXCEEDED - You have hit the rate limit or quota for this API key');
      console.error('Solutions:');
      console.error('  1. Wait for quota to reset (usually 1 minute for rate limit)');
      console.error('  2. Check your quota at: https://aistudio.google.com/app/apikey');
      console.error('  3. Get a new API key if monthly quota exceeded');
    } else if (data.error?.code === 400) {
      console.error('\n⚠️  INVALID REQUEST - Model name or request format is incorrect');
      console.error('  Current model:', model);
      console.error('  Try: gemini-2.0-flash-exp or gemini-1.5-flash');
    } else if (data.error?.code === 403) {
      console.error('\n⚠️  PERMISSION DENIED - API key is invalid or doesn\'t have access');
      console.error('  1. Check API key is correct in .env file');
      console.error('  2. Generate new key at: https://aistudio.google.com/app/apikey');
    }
  } else {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ API IS WORKING!');
    console.log('Response:', text);
    console.log('\nYour Gemini API is properly configured and has available quota.');
  }
  
  console.log('\n' + '='.repeat(60));
})
.catch(err => {
  console.error('❌ NETWORK ERROR:', err.message);
  console.error('Unable to reach Gemini API. Check your internet connection.');
  console.log('\n' + '='.repeat(60));
});
