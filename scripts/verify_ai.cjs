
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API Key from arguments to avoid hardcoding
const API_KEY = process.argv[2];
if (!API_KEY) {
    console.error("Please provide API Key as argument");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function verifyKey() {
    try {
        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("AI Response:", response.text());
        return true;
    } catch (e) {
        console.error("AI Error:", e.message);
        return false;
    }
}

verifyKey();
