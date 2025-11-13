// src/app/components/Chatbot/index.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { db } from '@/lib/firebase/firebase-client'; 
import { doc, onSnapshot } from 'firebase/firestore'; 
import { Icon } from '@iconify/react';

// --- Types & Constants ---
interface ChatMessage {
  id: string; 
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface LeadData {
    email: string;
    phone: string;
}

const CHATBOT_NAME = "Barcias Tech AI Specialist";
const CHATBOT_ID = "BOT_ID";

// FIX: Function to dynamically get the lead qualification trigger based on language
const getQualificationTrigger = (language: string): string => {
    // These must exactly match the non-phone-number part of the server-side trigger strings
    const ENGLISH_TRIGGER = "Please provide your contact information below to connect with a specialist right away:";
    const SPANISH_TRIGGER = "Porfavor entra tu information, un especialita se conectara contigo inmediatamente:";
    
    return language === 'es' ? SPANISH_TRIGGER : ENGLISH_TRIGGER;
};

// Global socket reference
let socket: Socket | null = null;


// --- Chatbot Component ---
const Chatbot: React.FC<{ lang: string }> = ({ lang }) => {
  // SSR Fix
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(''); 
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState<LeadData>({ email: '', phone: '' });
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Client-side initialization for localStorage (SSR Fix)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedId = localStorage.getItem('chat-user-id');
    let userId = storedId;
    if (!userId) {
        userId = `guest-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('chat-user-id', userId);
    }
    setCurrentUserId(userId);
    
    const storedName = localStorage.getItem('chat-user-name') || 'Guest';
    setUserName(storedName);

  }, []);

  // --- UX Fix: Name Change Handler ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserName(e.target.value);
  };
  
  // Persist name on blur, enforcing a default if empty (UX Fix)
  const handleNameBlur = () => {
      const finalName = userName.trim() || 'Guest';
      setUserName(finalName);
      localStorage.setItem('chat-user-name', finalName);
  }
  
  // --- Lead Form Handlers (Unchanged) ---
  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLeadFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitLead = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadFormData.email || !leadFormData.phone || !currentUserId) return;
      
      setLeadStatus('loading');
      
      const payload = {
          Name: userName,
          Email: leadFormData.email,
          PhoneNo: leadFormData.phone,
          BusinessName: 'Chat Lead', 
          ServiceType: 'Chat Qualified Lead',
          Description: 'Lead captured via Chatbot qualification form.',
          ChatSenderId: currentUserId, 
      };

      try {
          const res = await fetch('/api/send/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
          });

          if (res.ok) {
              setLeadStatus('success');
              
              setTimeout(() => {
                  setShowLeadForm(false); 
                  setLeadStatus('idle');   
              }, 3000); 

              socket?.emit('send-message', {
                  senderId: currentUserId,
                  senderName: userName,
                  text: "I've successfully submitted my contact details. Waiting for your specialist!",
                  lang: lang,
              });
          } else {
              setLeadStatus('error');
          }
      } catch (error) {
          console.error('Lead submission error:', error);
          setLeadStatus('error');
      }
  };

  // Function to establish Socket.IO connection
  const setupSocket = useCallback(() => {
    if (socket && socket.connected) return;

    // Use a clean slate socket connection
    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log("Socket Connected.");
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log("Socket Disconnected. Attempting to reconnect...");
    });

    // CRITICAL FIX: Add all received messages to the state
    socket.on('receive-message', (message: any) => {
        console.log("Received message from server:", message);
        
        // 1. Add the received message to the messages state
        setMessages(prevMessages => {
            const newMessage: ChatMessage = {
                id: Math.random().toString(36).substring(2, 9), // Use a random ID for client rendering key
                senderId: message.senderId,
                senderName: message.senderName,
                text: message.text,
                // Server sends Date.now() (number timestamp)
                timestamp: new Date(message.timestamp), 
            };
            return [...prevMessages, newMessage];
        });

        // 2. Check for Lead Trigger using the current language
        const currentTrigger = getQualificationTrigger(lang);
        if (message.senderId === CHATBOT_ID && message.text.includes(currentTrigger)) {
            setShowLeadForm(true);
        }
    });
  }, [lang]); // Dependency added to re-create callback if lang changes

  // Effect for fetching chat history (Single Document Read)
  useEffect(() => {
    if (!isChatOpen || !currentUserId || userName === '') return; 

    // Setup socket connection when chat opens
    setupSocket();

    const docRef = doc(db, 'chats', currentUserId);
    
    let unsubscribe: (() => void) | undefined; 

    // Listen to Firebase for history updates (only when chat is open)
    unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Use the proper type definition for Firestore array items
        const history: { senderId: string, senderName: string, text: string, timestamp: { toDate: () => Date } | string }[] = data.messages || [];
        
        const processedMessages: ChatMessage[] = history.map((msg, index) => ({
            id: index.toString(),
            senderId: msg.senderId, 
            senderName: msg.senderName,
            text: msg.text,
            // FIX: Ensure the new Date() constructor only receives a string or a Date object
            timestamp: (typeof msg.timestamp !== 'string' && msg.timestamp?.toDate) 
                        ? msg.timestamp.toDate() 
                        : new Date(msg.timestamp as string), 
        }));
        
        setMessages(processedMessages);
        
        // FIX: Check for Lead Trigger using the current language from the prop
        const currentTrigger = getQualificationTrigger(lang);
        const lastBotMessage = processedMessages.slice().reverse().find(m => m.senderId === CHATBOT_ID);
        if (lastBotMessage && lastBotMessage.text.includes(currentTrigger)) {
            setShowLeadForm(true);
        } else {
             setShowLeadForm(false);
             setLeadStatus('idle');
        }

      } else {
        // Initialize chat with a welcome message if no history exists
        if (messages.length === 0 || messages[0].senderId !== CHATBOT_ID) {
            setMessages([{ 
                id: 'init-bot', 
                senderId: CHATBOT_ID, 
                senderName: CHATBOT_NAME, 
                text: lang === 'es' ? `Hola ${userName || 'Invitado'}, ¿en qué puedo ayudarte hoy?` : `Hi ${userName || 'Guest'}, how can I help you get more qualified leads today?`, 
                timestamp: new Date() 
            }]);
        }
      }
    });

    return () => {
        if (unsubscribe) {
            unsubscribe(); 
        }
        if (socket) {
            socket.disconnect(); 
            socket = null;
        }
    };
  }, [isChatOpen, setupSocket, userName, currentUserId, lang]); 

  // Effect to scroll to the bottom of the chat window (Unchanged)
  useEffect(() => {
    if (isChatOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);


  // --- Message Sending Logic ---
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    
    const isNameInvalid = userName.trim() === '' || userName.trim() === 'Guest';
    if (!text || !socket || !connected || isNameInvalid || showLeadForm || !currentUserId) return; 

    const messagePayload = {
      senderId: currentUserId, 
      senderName: userName,
      text: text,
      lang: lang, // Pass the current language
    };

    // 1. Emit the message to the server
    socket.emit('send-message', messagePayload);
    setInput('');
    
    // NOTE: The message will appear in the UI when the server echoes it back 
    // via 'receive-message' (or when Firebase updates the history). 
  };

  // --- UI Rendering (Unchanged) ---
  if (!currentUserId) {
    return null;
  }

  const messageClass = (senderId: string) => 
    senderId === currentUserId 
      ? 'self-end bg-primary text-white rounded-br-none' 
      : 'self-start bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none';
      
  const isInputDisabled = !connected || userName.trim() === 'Guest' || leadStatus === 'loading'; 

  const getFormSubmitText = () => {
      if (leadStatus === 'loading') return lang === 'es' ? 'Enviando...' : 'Submitting...';
      return lang === 'es' ? 'Conectar Ahora' : 'Connect Me Now';
  }
  
  // FIX: Use the localized trigger text for the prompt
  const localizedTriggerText = getQualificationTrigger(lang).replace(':', '');

  return (
    <>
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 z-[99] p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Icon icon={isChatOpen ? 'lucide:x' : 'lucide:message-circle'} width={24} />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-full max-w-sm h-[450px] bg-white dark:bg-darklight rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 border border-gray-200 dark:border-gray-700">
          
          <div className="p-4 bg-primary text-white rounded-t-lg flex justify-between items-center">
            <h5 className="font-semibold capitalize">{lang === 'es' ? 'Chat en Vivo' : 'Live Chat'} with {CHATBOT_NAME}</h5>
            <span 
              className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} 
              title={connected ? 'Connected' : 'Connecting...'}
            />
          </div>

          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
                type="text"
                value={userName === 'Guest' ? '' : userName} 
                onChange={handleNameChange}
                onBlur={handleNameBlur} 
                placeholder={lang === 'es' ? 'Ingrese su nombre (Obligatorio)' : 'Enter your name (Required)'} 
                className="w-full text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary"
            />
            {(userName.trim() === 'Guest' || userName.trim() === '') && (
                <p className='text-xs text-red-500 mt-1'>{lang === 'es' ? 'Por favor, ingrese un nombre.' : 'Please enter a valid name.'}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 text-sm">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${msg.senderId === currentUserId ? 'items-end' : 'items-start'}`}
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

          {/* NEW UI: Lead Qualification Form */}
          {showLeadForm && leadStatus !== 'success' && (
              <form onSubmit={submitLead} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-darkmode">
                  <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {/* FIX: Use the localized trigger text for the form prompt */}
                      {localizedTriggerText}
                  </p>
                  <div className="flex flex-col gap-2 mb-2">
                      <input
                          type="email"
                          name="email"
                          value={leadFormData.email}
                          onChange={handleLeadFormChange}
                          placeholder={lang === 'es' ? 'Correo electrónico' : 'Email Address'}
                          required
                          className="p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          disabled={leadStatus === 'loading'}
                      />
                      <input
                          type="tel"
                          name="phone"
                          value={leadFormData.phone}
                          onChange={handleLeadFormChange}
                          placeholder={lang === 'es' ? 'Número de teléfono (123-456-7890)' : 'Phone Number (123-456-7890)'}
                          className="p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          disabled={leadStatus === 'loading'}
                      />
                  </div>
                  <button
                      type="submit"
                      disabled={leadStatus === 'loading' || !leadFormData.email || !leadFormData.phone}
                      className="w-full py-2 text-sm font-semibold bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                      {getFormSubmitText()}
                  </button>
                  {leadStatus === 'error' && (
                      <p className='text-xs text-red-500 mt-1 text-center'>{lang === 'es' ? 'Envío fallido. Por favor, utilice el formulario de contacto.' : 'Submission failed. Please try the contact form.'}</p>
                  )}
              </form>
          )}

          {leadStatus === 'success' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-800 text-green-800 dark:text-white text-center">
                  <p className='text-sm font-semibold'>{lang === 'es' ? '✅ ¡Éxito! Un especialista te contactará pronto.' : '✅ Success! A specialist will contact you shortly.'}</p>
              </div>
          )}

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
            {!showLeadForm && leadStatus !== 'success' ? (
                <>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={lang === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                      disabled={isInputDisabled} 
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isInputDisabled || input.trim() === ''}
                      className="p-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400"
                    >
                      <Icon icon="lucide:send" width={24} />
                    </button>
                </>
            ) : null}
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;