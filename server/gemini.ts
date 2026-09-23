import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client according to AI Studio guidelines
const apiKey = process.env.GEMINI_API_KEY || '';

export const hasGeminiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 5);

export const ai = hasGeminiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

