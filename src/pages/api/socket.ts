// pages/api/socket.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { GoogleGenAI } from '@google/genai'; 
import { db, admin } from '@/lib/firebase/admin'; 
import { Server as HttpServer } from 'http'; 
import type { DefaultEventsMap } from 'socket.io'; 
import { doc, getDoc } from 'firebase/firestore'; // Used for type reference consistency

// --- Configuration Constants ---
const SPECIALIST_PHONE = '(708) 314-0477'; 
const LEAD_QUALIFICATION_TRIGGER = "Please provide your contact information below to connect with a specialist right away:"; 
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
    timestamp: string;
    // 💡 NEW: Include lang in the stored message type
    lang?: string; 
}


// --- Core AI Response Generator (Update signature to accept language) ---
const generateAIResponse = async (history: StoredMessage[], lang: string) => { 
    
  // 💡 NEW INSTRUCTION: Tell the model to respond in the target language
  const languageInstruction = lang === 'es' 
    ? "Responde SIEMPRE en español. Mantén el tono profesional y conciso."
    : "Always respond in English. Maintain a professional and concise tone.";

  const systemInstruction = `
    ${languageInstruction}

    You are '${BOT_NAME}', an AI assistant for a digital marketing company that helps local service businesses (e.g., plumbers, roofers, landscapers) generate 40+ qualified leads per month through the '${PROJECT_FOCUS}' program.

    ### Persona and Goals:
    1. **Persona:** Conversational, confident, professional, and results-focused.
    2. **Primary Goal:** Qualify the user (type of business, location) and promote the "$2,000 Local Pro Lead Engine" backed by the 30-Day Guaranteed Lead Offer.

    ### Rules:
    1. **Buying Intent (Route to Specialist):** If the user asks to book a call, get a quote, request next steps, or shows clear buying intent, respond ONLY with the exact message: 
       "${LEAD_QUALIFICATION_TRIGGER} or call us at ${SPECIALIST_PHONE}."
    2. **Pricing/Package:** If asked about pricing or packages, explain that the core offer is the "$2,000 Local Pro Lead Engine"—a complete system including custom website, SEO, branding, designed to deliver 40+ qualified leads per month, backed by our 30-Day Guarantee. Be concise.
    3. **General Qs:** Keep answers concise, friendly, and always tie back to results and the 30-Day Guaranteed Lead Offer.
    4. **Avoid Repetition:** Do not repeat qualifying questions or requests for information (like the email) that the user has already provided in the conversation history. Use the history provided below to maintain context.
  `;
  
  // Convert chat history into the Gemini Contents format
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
            temperature: 0.5, 
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

    // 💡 MODIFIED: Expect the 'lang' property in the message payload
    socket.on('send-message', async (message: StoredMessage & { lang: string }) => {
      const { lang } = message; 
      const CONVERSATION_PATH = `chats/${message.senderId}`;

      // --- 1. Fetch Current Conversation History (Using Admin SDK) ---
      const docRef = db.collection('chats').doc(message.senderId); 
      const docSnap = await docRef.get();
      
      const data = docSnap.data();
      const existingHistory: StoredMessage[] = docSnap.exists && data && Array.isArray(data.messages)
          ? data.messages as StoredMessage[]
          : [];
      
      const currentUserMessage: StoredMessage = {
          senderId: message.senderId,
          senderName: message.senderName || 'Anonymous',
          text: message.text,
          timestamp: new Date().toISOString(),
          lang: lang, // 💡 NEW: Store language used in this message
      };
      
      const fullHistory = [...existingHistory, currentUserMessage];


      // --- 2. Persist User Message (Atomic Update) ---
      try {
        await db.doc(CONVERSATION_PATH).set({
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            senderId: message.senderId,
            senderName: message.senderName || 'Anonymous',
            messages: fullHistory, 
        }, { merge: true });
      } catch (error) {
        console.error('Error saving user message to Firestore:', error);
      }
      
      const userMessageWithTime = { ...message, timestamp: Date.now() };
      io.emit('receive-message', userMessageWithTime); 
      
      // --- 3. Generate and Broadcast AI Response ---
      // 💡 FIX: Pass the language code to the AI generator
      const aiResponseText = await generateAIResponse(fullHistory, lang); 
      
      const aiMessagePayload: StoredMessage = {
        senderId: BOT_ID,
        senderName: BOT_NAME,
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        lang: lang,
      };

      // --- 4. Persist AI Message (Atomic Update) ---
      const finalHistory = [...fullHistory, aiMessagePayload];
      try {
        await db.doc(CONVERSATION_PATH).update({
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            messages: finalHistory, 
        });
      } catch (error) {
        console.error('Error saving AI message to Firestore:', error);
      }
      
      // Broadcast the AI's response
      setTimeout(() => {
          const aiMessageWithTime = { 
              senderId: BOT_ID, 
              senderName: BOT_NAME, 
              text: aiResponseText, 
              timestamp: Date.now() 
          };
          io.emit('receive-message', aiMessageWithTime); 
      }, 1500); 
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  res.end();
};

export default socketHandler;