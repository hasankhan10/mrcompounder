import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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

// Maximum number of history messages to pass to the model (prevents token inflation)
const MAX_HISTORY_MESSAGES = 20;

// Zod schema — validates each chat message in the history array
const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string().min(1).max(4000),
});

// Zod schema — validates the full request body
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
  history: z.array(chatMessageSchema).max(MAX_HISTORY_MESSAGES).optional(),
});

export async function POST(req: Request) {
  try {
    // 1. API Key Guard — fail fast before any processing
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // 2. Validate request body
    let body: z.infer<typeof chatRequestSchema>;
    try {
      const json = await req.json();
      const parsed = chatRequestSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }
      body = parsed.data;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // 3. Initialize model inside the handler so it always uses the live API key
    //    and works correctly in serverless/edge cold-start environments.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // 4. Cap history to the last N messages to prevent prompt injection & token inflation
    const safeHistory = (body.history ?? []).slice(-MAX_HISTORY_MESSAGES);

    // 5. Construct chat with system prompt baked in as the first exchange
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
        ...safeHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(body.message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Gemini API Error:', message);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
