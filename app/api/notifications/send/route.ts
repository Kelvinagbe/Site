// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    const messaging = getMessaging();

    const message = {
      token,
      notification: {
        title: title || 'New Notification',
        body: body || 'You have a new notification',
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: process.env.NEXT_PUBLIC_APP_URL || 'https://apexion-2.vercel.app',
        },
      },
    };

    const response = await messaging.send(message);
    
    console.log('Successfully sent message:', response);
    
    return NextResponse.json({
      success: true,
      messageId: response,
      message: 'Notification sent successfully',
    });

  } catch (error) {
    console.error('Error sending message:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}