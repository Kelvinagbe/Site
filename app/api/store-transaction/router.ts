// app/api/store-transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { userId, transactionId, transaction } = body;

    // Validate required fields
    if (!userId || !transactionId || !transaction) {
      console.error('Missing required fields:', { userId, transactionId, transaction });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    console.log('Storing transaction at path:', `users/${userId}/transactions/${transactionId}`);
    
    const transactionData = {
      ...transaction,
      createdAt: new Date().toISOString(),
      userId: userId // Ensure userId is included
    };
    
    console.log('Transaction data to store:', transactionData);

    // Store in Realtime Database
    const ref = adminDb.ref(`users/${userId}/transactions/${transactionId}`);
    await ref.set(transactionData);
    
    console.log('Transaction stored successfully');

    // Verify the data was written
    const snapshot = await ref.once('value');
    console.log('Verification - data exists:', snapshot.exists());
    console.log('Verification - data:', snapshot.val());

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction stored successfully',
      transactionId,
      path: `users/${userId}/transactions/${transactionId}`
    });

  } catch (error) {
    console.error('Store transaction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}