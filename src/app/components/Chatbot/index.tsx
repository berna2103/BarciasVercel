// src/app/components/Chatbot/index.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
// Import existing client-side Firebase utilities
import { db } from '@/lib/firebase/firebase-client'; 
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { Icon } from '@iconify/react';

// --- Types & Constants ---
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

// Generate or retrieve a persistent user ID and set a default name
const CURRENT_USER_ID = localStorage.getItem('chat-user-id') || `guest-${Math.random().toString(36).substring(2, 9)}`;
localStorage.setItem('chat-user-id', CURRENT_USER_ID);

const CHATBOT_NAME = "Barcias Tech Bot";
const CHATBOT_ID = "BOT_ID";

// Global socket reference (to ensure single instance)
let socket: Socket | null = null;

// --- Chatbot Component ---

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('chat-user-name') || 'Guest');
  
  // Update user name and persist to local storage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value.trim() || 'Guest';
      setUserName(newName);
      localStorage.setItem('chat-user-name', newName);
  };

  // Function to establish Socket.IO connection
  const setupSocket = useCallback(() => {
    if (socket && socket.connected) return;

    // Connect to the custom API route
    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket Connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket Disconnected');
    });

    // Handle incoming messages broadcasted from the server
    socket.on('receive-message', (message: any) => {
      const newMessage: ChatMessage = {
        id: message.id || Date.now().toString(),
        senderId: message.senderId,
        senderName: message.senderName,
        text: message.text,
        timestamp: new Date(message.timestamp || Date.now()),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  // Effect for fetching chat history and managing socket connection
  useEffect(() => {
    if (!isChatOpen) return;

    // 1. Setup Socket.IO
    setupSocket();

    // 2. Setup Firestore listener for chat history
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'asc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        liveMessages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), 
        });
      });
      
      setMessages(liveMessages);
      
      // Send an initial welcome message from the bot if the chat is empty
      if (liveMessages.length === 0) {
        setMessages([{ 
            id: 'init-bot', 
            senderId: CHATBOT_ID, 
            senderName: CHATBOT_NAME, 
            text: `Hi ${userName}, how can I help you get more qualified leads today?`, 
            timestamp: new Date() 
        }]);
      }
    });

    // Cleanup function
    return () => {
        unsubscribe();
        if (socket) {
            socket.disconnect(); 
            socket = null;
        }
    };
  }, [isChatOpen, setupSocket, userName]);

  // Effect to scroll to the bottom of the chat window
  useEffect(() => {
    if (isChatOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);


  // --- Message Sending Logic ---
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    
    // Check connection and input validity
    if (!text || !socket || !connected || userName.trim() === 'Guest') return;

    const messagePayload = {
      senderId: CURRENT_USER_ID,
      senderName: userName,
      text: text,
    };

    // Emit the message to the Socket.IO server
    socket.emit('send-message', messagePayload);
    setInput('');

    // OPTIONAL: Client-side bot response simulation (for faster feedback)
    if (messagePayload.senderId === CURRENT_USER_ID) {
        setTimeout(() => {
            const botReply: ChatMessage = {
                id: Date.now().toString(),
                senderId: CHATBOT_ID,
                senderName: CHATBOT_NAME,
                text: `I've sent your message. A specialist will follow up shortly. For immediate booking, please use the contact form.`,
                timestamp: new Date(),
            };
            setMessages((prevMessages) => [...prevMessages, botReply]);
        }, 1500);
    }
  };

  // --- UI Rendering ---

  const messageClass = (senderId: string) => 
    senderId === CURRENT_USER_ID 
      ? 'self-end bg-primary text-white rounded-br-none' 
      : 'self-start bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none';

  return (
    <>
      {/* Chat Bubble Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 z-[99] p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Icon icon={isChatOpen ? 'lucide:x' : 'lucide:message-circle'} width={24} />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-full max-w-sm h-[450px] bg-white dark:bg-darklight rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 border border-gray-200 dark:border-gray-700">
          
          {/* Header */}
          <div className="p-4 bg-primary text-white rounded-t-lg flex justify-between items-center">
            <h5 className="font-semibold capitalize">Live Chat with {CHATBOT_NAME}</h5>
            <span 
              className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} 
              title={connected ? 'Connected' : 'Connecting...'}
            />
          </div>

          {/* User Input Name Field */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
                type="text"
                value={userName}
                onChange={handleNameChange}
                placeholder="Enter your name (Required)"
                className="w-full text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary"
            />
            {userName.trim() === 'Guest' && (
                <p className='text-xs text-red-500 mt-1'>Please enter a name other than "Guest" to chat.</p>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 text-sm">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.senderId === CURRENT_USER_ID ? 'items-end' : 'items-start'}`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {msg.senderName} - {msg.timestamp.toLocaleTimeString()}
                </div>
                <div
                  className={`p-3 rounded-xl shadow ${messageClass(msg.senderId)}`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={!connected || userName.trim() === 'Guest'}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!connected || input.trim() === '' || userName.trim() === 'Guest'}
              className="p-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400"
            >
              <Icon icon="lucide:send" width={24} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;