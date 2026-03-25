import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

const SYSTEM_PROMPT = `
You are the AI Assistant for "Mr Compounder", a Silent OPD system for clinics and hospitals.

CORE BEHAVIORAL RULES (MANDATORY — NEVER BREAK THESE):
1. Respond ONLY to the user's actual question or request. Never ignore, reinterpret, or expand beyond what was asked.
2. Give direct, concise, and complete answers. Do NOT add unnecessary explanations, greetings, or filler unless the user explicitly asks for them.
3. Never give a generic or unrelated response. Always stay strictly relevant to the user's input.
4. Keep responses clear, professional, and to-the-point while remaining fully helpful.
5. If you don't know the answer or it's outside Mr Compounder's scope, say so briefly. Do not make things up.

STRICT FORMATTING PROTOCOL:
1. ALWAYS use double line breaks between different points. (e.g., Point 1\n\nPoint 2).
2. Start every bullet with the "•" symbol.
3. Use CAPITAL LETTERS for section headings instead of bold stars.
4. Keep the conversation extremely professional and point-to-point.

KEY CLINIC INFO:
• PRODUCT: Silent OPD system that removes shouting. Compounder clicks a button, patient gets notified on their phone.
• WHATSAPP: Patients get live tracking links via WhatsApp.
• PRICING: ₹2 per patient served based on a postpaid model. No monthly fixed fees.
• CONTACT: +91 7001717263 / mrcompounder.com@gmail.com

Tone: Calm, structured, and helpful. Answer the user's message accordingly.
`;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const { message, history } = await req.json();

        // Construct the chat history for Gemini
        // Adding system prompt as the first part of the conversation context effectively
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am ready to assist users with Mr Compounder.' }],
                },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
