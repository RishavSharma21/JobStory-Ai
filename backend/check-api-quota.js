// Check Gemini API Usage and Quota
require('dotenv').config();
const fetch = require('node-fetch');

const apiKey = process.env.GEMINI_API_KEY;

console.log('\n' + '='.repeat(70));
console.log('               GEMINI API USAGE & QUOTA CHECK');
console.log('='.repeat(70));

if (!apiKey) {
  console.error('\n❌ ERROR: GEMINI_API_KEY not found in .env file\n');
  process.exit(1);
}

console.log('\n📊 API Key:', apiKey.substring(0, 20) + '...');
console.log('\n🔍 Checking quota and usage...\n');

// Test API call to check if it's working
const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello' }] }],
    generationConfig: { maxOutputTokens: 10 }
  })
})
.then(async response => {
  const data = await response.json();
  
  console.log('Status Code:', response.status, response.statusText);
  console.log('');
  
  if (response.ok) {
    console.log('✅ API Status: ACTIVE');
    console.log('✅ Quota Status: AVAILABLE');
    console.log('');
    console.log('📈 RATE LIMITS (Free Tier):');
    console.log('   • Requests per minute (RPM): 15');
    console.log('   • Tokens per minute (TPM): 1,000,000');
    console.log('   • Requests per day (RPD): 1,500');
    console.log('');
    console.log('💡 NOTE: Google AI Studio does not provide real-time usage metrics via API.');
    console.log('   To check exact usage, visit: https://aistudio.google.com/app/apikey');
    console.log('');
    console.log('🔥 USAGE TIPS:');
    console.log('   • Each resume analysis uses ~5,000-10,000 tokens');
    console.log('   • With 1M tokens/min, you can analyze ~100-200 resumes per minute');
    console.log('   • Daily limit: ~1,500 requests = ~1,500 resume analyses per day');
    
  } else {
    console.log('❌ API Status: ERROR');
    console.log('');
    
    if (data.error) {
      console.log('Error Code:', data.error.code);
      console.log('Error Message:', data.error.message);
      console.log('');
      
      if (data.error.code === 429) {
        console.log('⚠️  QUOTA/RATE LIMIT EXCEEDED');
        console.log('');
        console.log('Possible reasons:');
        console.log('   1. Too many requests in short time (>15 per minute)');
        console.log('   2. Too many tokens used (>1M per minute)');
        console.log('   3. Daily quota exhausted (>1,500 requests)');
        console.log('');
        console.log('Solutions:');
        console.log('   • Wait 1-5 minutes and try again');
        console.log('   • Check usage at: https://aistudio.google.com/app/apikey');
        console.log('   • Generate new API key if monthly limit hit');
        
      } else if (data.error.code === 403) {
        console.log('⚠️  ACCESS DENIED');
        console.log('');
        console.log('Your API key may be:');
        console.log('   • Invalid or expired');
        console.log('   • Restricted to certain IPs/domains');
        console.log('   • Disabled in Google AI Studio');
        console.log('');
        console.log('Generate new key at: https://aistudio.google.com/app/apikey');
        
      } else if (data.error.code === 400) {
        console.log('⚠️  INVALID REQUEST');
        console.log('Model or request format issue');
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('For detailed usage statistics, visit:');
  console.log('🔗 https://aistudio.google.com/app/apikey');
  console.log('='.repeat(70) + '\n');
  
})
.catch(err => {
  console.error('❌ NETWORK ERROR:', err.message);
  console.error('\nUnable to reach Gemini API. Check internet connection.');
  console.log('\n' + '='.repeat(70) + '\n');
});
