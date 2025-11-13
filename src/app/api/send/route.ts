// src/app/api/send/route.ts

import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
// Import Admin SDK instance and the admin object for FieldValue
import { db, admin } from '@/lib/firebase/admin'; 
import { Buffer } from 'buffer'; 

// Initialize Resend. This automatically uses the RESEND_API_KEY environment variable.
const resend = new Resend(process.env.RESEND_API_KEY);

// --- TeleSign Direct Fetch Utility (Vercel Compatible) ---
async function sendTeleSignSMS(phoneNumber: string, message: string, messageType: "ARN" | "OTP" | "MKT" = "ARN") {
    
    if (typeof Buffer === 'undefined' || typeof URLSearchParams === 'undefined') {
        console.error("TeleSign Error: Missing required Node.js APIs (Buffer, URLSearchParams).");
        return;
    }

    const customerId = process.env.TELESIGN_CUSTOMER_ID;
    const apiKey = process.env.TELESIGN_API_KEY;
    const senderNumber = process.env.TELESIGN_SENDER_NUMBER;

    if (!customerId || !apiKey || !senderNumber) {
        console.error("TeleSign Error: Customer ID, API Key, or SENDER_NUMBER environment variables are missing.");
        return;
    }

    try {
        const authString = Buffer.from(`${customerId}:${apiKey}`).toString('base64');
        const apiUrl = 'https://rest-api.telesign.com/v1/messaging';
        
        const payload = new URLSearchParams();
        payload.append('phone_number', phoneNumber);
        payload.append('message', message);
        payload.append('message_type', messageType);
        payload.append('sender_id', senderNumber); 

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload.toString(),
        });
        
        const responseData = await response.json();

        if (!response.ok) {
            console.error(`TeleSign API failed (${response.status}):`, responseData);
        } else {
            console.log('TeleSign SMS sent successfully:', responseData);
        }
    } catch (error) {
        console.error('TeleSign SMS network/system error:', error);
    }
}
// --- END TeleSign Direct Fetch Utility ---


// --- Function to Fetch and Format Transcript (Admin SDK) ---
async function fetchTranscript(chatId: string): Promise<string> {
    if (!chatId) return "No chat ID provided.";

    try {
        const chatDocRef = db.collection('chats').doc(chatId);
        const docSnap = await chatDocRef.get();

        if (docSnap.exists) {
            const data = docSnap.data(); // This can be undefined
            
            // 💡 FIX: Safely check if data is defined and messages is an array
            const history: { senderName: string; text: string; timestamp: string; lang: string }[] = 
                (data && Array.isArray(data.messages)) ? data.messages : [];

            if (history.length === 0) return "Chat transcript is empty.";

            // Format the transcript for readability in HTML <pre> tag
            return history.map(msg => {
                const date = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `[${date}] ${msg.senderName}: ${msg.text}`;
            }).join('\n');
        }
        return "Chat transcript document not found in Firestore.";
    } catch (e) {
        console.error("Error fetching chat transcript:", e);
        return "Error fetching chat transcript due to server error.";
    }
}
// --- END Transcript Fetch Utility ---


// Define the POST handler function for the /api/send route
export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set.");
      return NextResponse.json({ message: 'Email service misconfigured: Missing API Key.' }, { status: 500 });
  }

  const notificationNumber = process.env.NOTIFICATION_PHONE_NUMBER;

  try {
    const { Email, Name, PhoneNo, ServiceType, Description, BusinessName, ChatSenderId } = await request.json(); 

    // Validation
    if (!Email || !Name || !PhoneNo || !ServiceType || !Description || !BusinessName) { 
        return NextResponse.json({ message: 'Missing required form fields.' }, { status: 400 });
    }
    
    const cleanedPhoneNo = PhoneNo.replace(/\D/g, ''); 

    // --- Fetch the Transcript (if ID is provided) ---
    let transcript = '';
    if (ChatSenderId) {
        transcript = await fetchTranscript(ChatSenderId);
    }

    // 1. Prepare data payload (for Firestore save)
    const leadData = {
        name: Name,
        businessName: BusinessName,
        email: Email,
        phoneNo: cleanedPhoneNo, 
        serviceType: ServiceType,
        description: Description,
        chatSenderId: ChatSenderId, // Save the ID for reference
        timestamp: admin.firestore.FieldValue.serverTimestamp(), 
    };
    
    // 2. Save data to Firestore 
    let docId = 'N/A';
    try {
        const docRef = await db.collection('leads').add(leadData);
        docId = docRef.id;
        console.log('Document written with ID: ', docId);
    } catch (firestoreError) {
        console.error('Error adding document to Firestore (non-fatal):', firestoreError);
    }

    // 3. Send the email using Resend (to site owner)
    const { error } = await resend.emails.send({
      from: 'Contact Form <onboarding@barciastech.com>', 
      to: ['bernardojimenezz@gmail.com'], 
      subject: `🔥 NEW CHAT LEAD (${ServiceType}) from ${BusinessName || Name}`, 
      
      // IMPROVED HTML BODY: Includes chat transcript
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #CC0000; font-weight: bold;">NEW QUALIFIED LEAD (Chatbot Submission)</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${Name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Business:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${BusinessName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ServiceType}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${PhoneNo}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${Email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Description:</td><td style="padding: 8px;">${Description}</td></tr>
          </table>
          
          <h3 style="margin-top: 25px; color: #333;">Full Chat Transcript:</h3>
          <pre style="background-color: #f8f8f8; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-family: monospace; font-size: 13px; border: 1px solid #ddd;">${transcript}</pre>
        </div>
      `,
    });

    // 4. Send SMS Notification via direct TeleSign Fetch
    if (notificationNumber) {
        const smsText = `🔥 CHAT LEAD: ${Name} from ${BusinessName || ServiceType} converted! Phone: ${PhoneNo}. Check Resend email for transcript.`;
        await sendTeleSignSMS(notificationNumber, smsText, "ARN");
    } 

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ message: 'Failed to send lead email.', error }, { status: 400 });
    }

    // If successful
    return NextResponse.json({ message: 'Email and SMS sent successfully!', data: { leadId: docId } }, { status: 200 });
    
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal server error processing the request.' }, { status: 500 });
  }
}