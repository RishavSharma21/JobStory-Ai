// Script to list available Gemini models
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('\n=== Listing Available Gemini Models ===\n');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set');
    return;
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log('Fetching models...\n');
    
    const response = await fetch(url, { timeout: 10000 });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      return;
    }
    
    const json = await response.json();
    const models = json.models || [];
    
    console.log(`✅ Found ${models.length} models:\n`);
    
    // Filter for models that support generateContent
    const generateContentModels = models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    
    console.log('Models supporting generateContent:');
    console.log('=' .repeat(60));
    
    generateContentModels.forEach(model => {
      console.log(`\nModel: ${model.name}`);
      console.log(`  Display Name: ${model.displayName || 'N/A'}`);
      console.log(`  Description: ${model.description?.substring(0, 100) || 'N/A'}...`);
      console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\nRecommended models for your .env file:');
    console.log('=' .repeat(60));
    
    const recommended = generateContentModels
      .filter(m => m.name.includes('gemini'))
      .slice(0, 5);
    
    recommended.forEach(model => {
      const modelId = model.name.replace('models/', '');
      console.log(`GEMINI_MODEL=${modelId}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableModels().then(() => {
  console.log('\n=== Complete ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
