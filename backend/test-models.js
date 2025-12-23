require('dotenv').config();
const fetch = require('node-fetch');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing API Key:', apiKey ? 'Present' : 'Missing');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', data.error);
        } else {
            console.log('Available Models:');
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log('No models list returned', data);
            }
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

listModels();