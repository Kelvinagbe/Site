export { adminDb };

// app/api/store-transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, transactionId, transaction } = await request.json();

    // Validate required fields
    if (!userId || !transactionId || !transaction) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Store in Realtime Database
    await adminDb.ref(`users/${userId}/transactions/${transactionId}`).set({
      ...transaction,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction stored successfully' 
    });

  } catch (error) {
    console.error('Store transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to store transaction' }, 
      { status: 500 }
    );
  }
}
