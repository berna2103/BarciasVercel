// src/app/api/send/route.ts

import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
// Import Admin SDK instance and the admin object for FieldValue
import { db, admin } from '@/lib/firebase/admin'; 
// REMOVED: import { MessagingClient } from '@telesign/messaging'; 

// Initialize Resend. This automatically uses the RESEND_API_KEY environment variable.
const resend = new Resend(process.env.RESEND_API_KEY);

// --- NEW: Direct TeleSign Fetch Utility ---
/**
 * Sends an SMS message directly to the TeleSign API using fetch.
 * This is the recommended approach for serverless environments (Vercel).
 * @param phoneNumber The recipient phone number (E.164 format).
 * @param message The SMS body text.
 * @param messageType TeleSign message type (e.g., 'ARN' for alerts/notifications).
 */
async function sendTeleSignSMS(phoneNumber: string, message: string, messageType: "ARN" | "OTP" | "MKT" = "ARN") {
    
    // Check if required global Node APIs are available (they are in Next.js API routes)
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
        // 1. Create the Basic Auth Header (Base64 encoding of 'CUSTOMER_ID:API_KEY')
        const authString = Buffer.from(`${customerId}:${apiKey}`).toString('base64');
        
        // 2. Define the API endpoint and payload (Form URL Encoded)
        const apiUrl = 'https://rest-api.telesign.com/v1/messaging';
        
        const payload = new URLSearchParams();
        payload.append('phone_number', phoneNumber);
        payload.append('message', message);
        payload.append('message_type', messageType);
        // Note: TeleSign requires a `sender_id` (your verified sending number) or similar parameter, 
        // depending on your account setup. We use the recommended 'sender_id'.
        payload.append('sender_id', senderNumber); 


        // --- DIAGNOSTIC LOGGING ---
        console.log("--- TeleSign Diagnostics ---");
        console.log(`Sending to number (E.164): ${phoneNumber}`);
        console.log(`Authorization Header: Basic ${authString.substring(0, 10)}...[truncated]`);
        console.log("----------------------------");
        // --- END DIAGNOSTIC LOGGING ---

        // 3. Execute the fetch request
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
// --- END TeleSign Fetch Utility ---


// Define the POST handler function for the /api/send route
export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
      console.error("Missing required API key (Resend).");
      return NextResponse.json({ message: 'Email service misconfigured.' }, { status: 500 });
  }

  const notificationNumber = process.env.NOTIFICATION_PHONE_NUMBER;
  if (!notificationNumber) {
       console.warn('NOTIFICATION_PHONE_NUMBER is missing. SMS alerts will be skipped.');
  }

  try {
    const { Email, Name, PhoneNo, ServiceType, Description, BusinessName } = await request.json(); 

    if (!Email || !Name || !PhoneNo || !ServiceType || !Description || !BusinessName) { 
        return NextResponse.json({ message: 'Missing required form fields.' }, { status: 400 });
    }
    
    const cleanedPhoneNo = PhoneNo.replace(/\D/g, ''); 

    // 1. Prepare data payload
    const leadData = {
        name: Name,
        businessName: BusinessName,
        email: Email,
        phoneNo: cleanedPhoneNo, 
        serviceType: ServiceType,
        description: Description,
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

    // 3. Send the email using Resend 
    const { error } = await resend.emails.send({
      from: 'Contact Form <onboarding@barciastech.com>', 
      to: ['bernardojimenezz@gmail.com'], 
      subject: `New Lead: ${ServiceType} from ${Name} (${BusinessName})`, 
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">New Contact Form Submission (Lead ID: ${docId})</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${Name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Business Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${BusinessName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${Email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${PhoneNo}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ServiceType}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Description:</td><td style="padding: 8px;">${Description}</td></tr>
          </table>
        </div>
      `,
    });

    // 4. Send SMS Notification via direct TeleSign Fetch
    if (notificationNumber) {
        const smsText = `NEW LEAD (Chatbot Qualified)! 
Name: ${Name}
Service: ${ServiceType}
Phone: ${PhoneNo}
Email: ${Email}
Follow up ASAP!`;
        
        // Use the new fetch utility
        // The message type "ARN" (Alerts, Reminders, Notifications) is appropriate here.
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