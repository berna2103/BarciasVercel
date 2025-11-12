// src/app/api/send/route.ts

import { Resend } from 'resend';
import { NextResponse, NextRequest } from 'next/server';
// Import Admin SDK instance and the admin object for FieldValue
import { db, admin } from '@/lib/firebase/admin'; 

// Initialize Resend. This automatically uses the RESEND_API_KEY environment variable.
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the POST handler function for the /api/send route
export async function POST(request: NextRequest) {
  // Check for the API Key first
  if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set.");
      return NextResponse.json({ message: 'Email service misconfigured: Missing API Key.' }, { status: 500 });
  }

  try {
    // Safely parse the request body and include the new field
    const { Email, Name, PhoneNo, ServiceType, Description, BusinessName } = await request.json(); 

    // Update validation to include BusinessName
    if (!Email || !Name || !PhoneNo || !ServiceType || !Description || !BusinessName) { 
        return NextResponse.json({ message: 'Missing required form fields.' }, { status: 400 });
    }
    
    // 1. Prepare data payload
    const leadData = {
        name: Name,
        businessName: BusinessName, // <--- NEW FIELD
        email: Email,
        phoneNo: PhoneNo.replace(/\D/g, ''), 
        serviceType: ServiceType,
        description: Description,
        // Use serverTimestamp for reliable server-side logging
        timestamp: admin.firestore.FieldValue.serverTimestamp(), 
    };
    
    // 2. Save data to Firestore using the Admin SDK
    try {
        const docRef = await db.collection('leads').add(leadData);
        console.log('Document written with ID: ', docRef.id);
    } catch (firestoreError) {
        // Log the failure but continue with the email send (non-fatal)
        console.error('Error adding document to Firestore (non-fatal):', firestoreError);
    }

    // 3. Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@barciastech.com>', 
      to: ['bernardojimenezz@gmail.com'], 
      subject: `New Lead: ${ServiceType} from ${Name} (${BusinessName})`, // Update subject
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
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

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ message: 'Failed to send email via Resend.', error }, { status: 400 });
    }

    // If successful
    return NextResponse.json({ message: 'Email sent successfully!', data }, { status: 200 });
    
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal server error processing the request.' }, { status: 500 });
  }
}