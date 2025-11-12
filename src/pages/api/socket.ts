// pages/api/socket.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { GoogleGenAI } from '@google/genai'; 
// Import existing Firebase Admin SDK for database access
import { db, admin } from '@/lib/firebase/admin'; 
// Import Node.js HTTP Server type for correct typing
import { Server as HttpServer } from 'http'; 
import type { DefaultEventsMap } from 'socket.io'; 

// --- Configuration Constants ---
const SPECIALIST_PHONE = '(708) 314-0477'; // Your business phone number
const BOT_MODEL = "gemini-2.5-flash"; // Fast and capable model
const BOT_ID = 'BOT_ID';
const BOT_NAME = 'Barcias Tech AI Specialist';
const PROJECT_FOCUS = 'Local Service Lead Generation specializing in Plumbers, Electricians, and Landscapers in Chicago, IL and NW Indiana.';

// --- Initialize AI Client ---
// Assumes GEMINI_API_KEY is set in your .env.local file
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// --- Custom Type Definitions ---
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & { 
      io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    };
  };
};

// --- Core AI Response Generator ---
const generateAIResponse = async (userMessage: string) => {
  
  // 💡 PROMPT ENGINEERING: Guide the AI to act as a specialist and route critical requests
  const prompt = `
    You are the '${BOT_NAME}' for a company focused on generating 40+ qualified leads/jobs per month for local trade professionals (${PROJECT_FOCUS}).
    Your primary goal is to qualify the lead, answer service-related questions, and emphasize the 30-Day Guaranteed Lead Offer.

    Rules:
    1. **If the user asks to book, needs a quote, or requests a meeting:** Do NOT provide an answer. Instead, respond EXACTLY with the following phrase, inserting the phone number: "It sounds like you need a custom quote right away. Please call our lead specialist directly at ${SPECIALIST_PHONE} now, or use our contact form."
    2. **If the user asks about pricing, packages, or services:** Provide a helpful, concise answer based on the knowledge that our core offer is the "$2,000 Local Pro Lead Engine" which guarantees 40+ qualified jobs/month and includes a website, SEO, and branding.
    3. **General inquiries:** Be helpful and friendly, reinforcing our expertise in local trade lead generation.

    User Message: "${userMessage}"
  `;

  try {
    const result = await aiClient.models.generateContent({
        model: BOT_MODEL, 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            temperature: 0.3, 
        }
    });

    // 💡 FIX: Safely check if result.text exists before using it
    if (result.text) {
        return result.text.trim();
    } else {
        // Return a default response if the AI provides no text content
        console.warn('Gemini API returned an empty text result.');
        return "I'm sorry, I couldn't generate a text response for that query. Can you please rephrase?";
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Return a message informing the user about the connection error
    return "I'm sorry, I'm experiencing a technical difficulty connecting to the AI. Please try again or use the contact form.";
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

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('send-message', async (message) => {
        // --- 1. Persist and Broadcast User Message ---
        const userChatData = {
          senderId: message.senderId,
          senderName: message.senderName || 'Anonymous',
          text: message.text,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        try {
          await db.collection('chats').add(userChatData);
        } catch (error) {
          console.error('Error saving user message to Firestore:', error);
        }
        
        const userMessageWithTime = { ...message, timestamp: Date.now() };
        io.emit('receive-message', userMessageWithTime); 
        
        // --- 2. Generate and Broadcast AI Response ---
        const aiResponseText = await generateAIResponse(message.text); 
        
        const aiChatData = {
          senderId: BOT_ID,
          senderName: BOT_NAME,
          text: aiResponseText,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        try {
          // Persist the AI's response
          await db.collection('chats').add(aiChatData);
        } catch (error) {
          console.error('Error saving AI message to Firestore:', error);
        }
        
        // Broadcast the AI's response (using a delay to simulate typing)
        setTimeout(() => {
            const aiMessageWithTime = { ...aiChatData, timestamp: Date.now() };
            io.emit('receive-message', aiMessageWithTime); 
        }, 1500); // 1.5 second delay
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  res.end();
};

export default socketHandler;