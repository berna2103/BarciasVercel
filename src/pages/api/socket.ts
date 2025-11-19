// pages/api/socket.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { GoogleGenAI } from '@google/genai';
import { db, admin } from '@/lib/firebase/admin'; 
import { Server as HttpServer } from 'http'; 
import type { DefaultEventsMap } from 'socket.io'; 

// ⚠️ VERCEL STABILITY WARNING: ⚠️
// Running a persistent Socket.IO server within a Next.js API route 
// on Vercel (a serverless environment) is inherently unstable. 
// Connections will frequently drop due to function timeouts/recycles. 
// For production stability, move Socket.IO to a dedicated, persistent server.

// --- Configuration Constants ---
const SPECIALIST_PHONE = '(708) 314-0477'; 
const BOT_MODEL = "gemini-2.5-flash"; 
const BOT_ID = 'BOT_ID';
const BOT_NAME = 'Barcias Tech AI Specialist';
const PROJECT_FOCUS = 'Local Service Lead Generation specializing in Plumbers, Electricians, and Landscapers in Chicago, IL and NW Indiana.';

// --- Initialize AI Client ---
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// --- Custom Type Definitions ---
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & { 
      io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    };
  };
};

interface StoredMessage {
    senderId: string;
    senderName: string;
    text: string;
    // Must be 'any' to handle fetched Timestamps, ISO strings, or Date.now()
    timestamp: any; 
    lang: string; 
}


// --- Core AI Response Generator ---
const generateAIResponse = async (history: StoredMessage[], lang: string) => { 

  const LEAD_QUALIFICATION_TRIGGER = lang === 'es' ? "Porfavor entra tu información, un especialista se conectará contigo inmediatamente:" :
    "Please provide your contact information below to connect with a specialist right away:";
    
  const languageInstruction = lang === 'es' 
    ? "Responde OBLIGATORIAMENTE SIEMPRE en español. Mantén el tono profesional, conciso y orientado a la conversión." // Reinforced Spanish instruction
    : "Always respond in English. Maintain a professional and concise tone, focusing on value and ROI.";

  const systemInstruction = `
    ${languageInstruction}

    You are '${BOT_NAME}', an AI specialist for Barcias Tech. We build owned, permanent digital assets for local service businesses (e.g., plumbers, roofers, landscapers) in Chicago and NW Indiana to generate 40+ qualified leads per month.

    ### Persona and Goals:
    1. **Persona:** Expert Advisor, highly confident, professional, and obsessed with measurable results (ROI).
    2. **Primary Goal:** Qualify the user (type of business, location) and promote the core offer as a ONE-TIME ASSET INVESTMENT.
    3. **Secondary Goal:** Highlight the Cost-of-Inaction: paying monthly lead services vs. owning an asset.
    4. **Third Goal:** Book calls or collect contact info.

    ### Core Knowledge (Use to answer questions about the offer):
    * **The Offer:** The "$2,000 Local Pro Lead Engine" is a complete, one-time investment for a high-speed, mobile-first website, Local SEO setup, and a full branding kit (logo, uniforms). The estimated value is $4,500.
    * **Value/ROI:** The $2,000 investment replaces expensive, recurring monthly lead costs ($800-$2,500/mo) and is designed to pay for itself immediately by delivering high-profit, exclusive calls.
    * **Guarantees:** The offer includes a 30-Day Performance Guarantee (guaranteed inbound qualified lead in 30 days or we waive fees) and a 14-Day Go-Live Timeline Guarantee.
    * **Ownership:** The client owns 100% of the domain, website, and code. This is a permanent, scalable business asset, not a rental service.
    * **Lead Quality:** Leads are *exclusive* and *inbound* (customers call your business directly), unlike shared leads from competitor platforms.
    * **Ongoing Fees:** The $2,000 is the *one-time* launch fee. After the first free year, a small annual fee ($150-$200) covers hosting and maintenance.

    ### Rules:
    1. **Analyze History First:** ALWAYS analyze the full conversation history provided below before formulating your response to avoid repeating questions and ensure context.
    2. **Buying Intent (Route to Specialist):** If the user asks to book a call, get a quote, request next steps, or shows clear buying intent, respond ONLY with the exact message: 
       "${LEAD_QUALIFICATION_TRIGGER} or call us at ${SPECIALIST_PHONE}." (Do not add any other text.)
    3. **Pricing/Package:** If asked about pricing or packages, state clearly it is a **one-time investment** of **$2,000** for the permanent digital asset and briefly mention the 30-Day Guarantee.
    4. **General Qs:** Keep answers brief and always end with a question to continue qualifying the lead (e.g., "What kind of local trade business do you run?" or "Are you currently paying for leads?").
    5. **Language Consistency:** Adhere strictly to the requested language.
  `;
  
  const geminiContents = history.map(msg => ({
    role: msg.senderId === BOT_ID ? "model" : "user",
    parts: [{ text: msg.text }],
  }));
  
  try {
    const result = await aiClient.models.generateContent({
        model: BOT_MODEL, 
        contents: geminiContents,
        config: {
            systemInstruction: systemInstruction, 
            temperature: 0.6, 
        }
    });

    if (result.text) {
        return result.text.trim();
    } else {
        console.warn('Gemini API returned an empty text result.');
        return lang === 'es' 
            ? "Lo siento, no pude generar una respuesta para esa consulta. ¿Puedes reformular?" 
            : "I'm sorry, I couldn't generate a text response for that query. Can you please rephrase?";
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    return lang === 'es' 
        ? "Lo siento, estoy experimentando una dificultad técnica."
        : "I'm sorry, I'm experiencing a technical difficulty.";
  }
};


const socketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Initialize Socket.IO server only if it hasn't been initialized for this process
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    const io = new Server(res.socket.server as any, { 
      path: '/api/socket', 
      addTrailingSlash: false,
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    res.socket.server.io = io;
  }

  const io = res.socket.server.io; 

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('send-message', async (message: StoredMessage & { lang: string }) => {
        
        console.log(`SERVER RECEIVED MESSAGE from ${message.senderId}: ${message.text.substring(0, 50)}...`); 
        
        const { lang } = message; 
        // FIX: Ensure lang is definitively 'es' or defaults to 'en'
        const responseLang = (lang && lang.toLowerCase() === 'es') ? 'es' : 'en'; 

        const CONVERSATION_PATH = `chats/${message.senderId}`;
        const docRef = db.collection('chats').doc(message.senderId); 

        // --- 1. Fetch Current Conversation History ---
        const docSnap = await docRef.get();
        const rawHistory: any[] = docSnap.exists && docSnap.data() && Array.isArray(docSnap.data()?.messages)
            ? docSnap.data()!.messages
            : [];
        
        // Sanitize existing history for Gemini (converting Firestore Timestamps to strings)
        const existingHistory: StoredMessage[] = rawHistory.map((msg: any) => ({
            senderId: msg.senderId || BOT_ID,
            senderName: msg.senderName || BOT_NAME,
            text: msg.text || '',
            // Convert Firestore Timestamp object to ISO string for the AI model
            timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate().toISOString() : new Date().toISOString(), 
            lang: msg.lang || 'en', 
        })); 
        
        // --- 2. Construct Messages for DB and AI ---
        const dbTimestamp = new Date().toISOString(); 
        
        const currentUserMessageForDB = {
            senderId: message.senderId,
            senderName: message.senderName || 'Anonymous',
            text: message.text,
            timestamp: dbTimestamp, 
            lang: responseLang, // Use the determined language
        };
        
        // Use the cleaned message for AI history
        const currentUserMessageForAI = { ...currentUserMessageForDB, timestamp: dbTimestamp };
        const fullHistoryForAI = [...existingHistory, currentUserMessageForAI];


        // --- 3. Persist User Message & Broadcast (Atomic Update) ---
        try {
            await docRef.set({
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                senderId: message.senderId,
                senderName: message.senderName || 'Anonymous',
                messages: admin.firestore.FieldValue.arrayUnion(currentUserMessageForDB), 
            }, { merge: true });
            
            // Broadcast the user's message immediately with client-friendly data
            const userMessageForClient = {
                senderId: message.senderId,
                senderName: message.senderName || 'Anonymous',
                text: message.text,
                timestamp: Date.now() // Use client-friendly timestamp
            };
            io.emit('receive-message', userMessageForClient); 

        } catch (error) {
            console.error('Error saving user message to Firestore:', error);
        }
        
        // --- 4. Generate AI Response ---
        // Pass the determined language for the AI instruction
        const aiResponseText = await generateAIResponse(fullHistoryForAI, responseLang); 
        
        // FIX: Use a clean ISO string for the timestamp when saving to the array in Firestore
        const aiMessagePayloadForDB = {
            senderId: BOT_ID,
            senderName: BOT_NAME,
            text: aiResponseText,
            timestamp: new Date().toISOString(), // Clean ISO string
            lang: responseLang, // Use the determined language
        };

        // --- 5. Persist AI Message & Broadcast (Atomic Update) ---
        try {
            await docRef.update({
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                messages: admin.firestore.FieldValue.arrayUnion(aiMessagePayloadForDB), 
            });
            
            // Broadcast the AI's response immediately
            const aiMessageWithTime = { 
                senderId: BOT_ID, 
                senderName: BOT_NAME, 
                text: aiResponseText, 
                timestamp: Date.now() // Use client-friendly time for broadcasting
            };
            io.emit('receive-message', aiMessageWithTime); 
            
        } catch (error) {
            console.error('Error saving AI message to Firestore:', error);
        }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  res.end();
};

export default socketHandler;