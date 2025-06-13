// app/api/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase-admin';

interface Transaction {
  id: string;
  prompt: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  imageUrl?: string;
  userId: string;
}

interface UserStats {
  totalGenerations: number;
  todayGenerations: number;
  weekGenerations: number;
  monthGenerations: number;
  lastActivity: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Fetching data for user:', userId);

    // Fetch user transactions from the correct path: users/{userId}/transactions
    const transactionsRef = database.ref(`users/${userId}/transactions`);

    const snapshot = await transactionsRef.once('value');
    const transactionsData = snapshot.val();

    const transactions: Transaction[] = [];

    if (transactionsData) {
      // Convert object to array and sort by timestamp
      Object.keys(transactionsData).forEach((key) => {
        const data = transactionsData[key];
        transactions.push({
          id: key,
          prompt: data.prompt || '',
          timestamp: data.timestamp || Date.now(),
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
          imageUrl: data.imageUrl || null,
          userId: data.userId || userId,
        });
      });

      // Sort by timestamp descending (most recent first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      // Limit to 100 most recent
      if (transactions.length > 100) {
        transactions.splice(100);
      }
    }

    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: UserStats = {
      totalGenerations: transactions.length,
      todayGenerations: transactions.filter(t => new Date(t.timestamp) >= today).length,
      weekGenerations: transactions.filter(t => new Date(t.timestamp) >= weekAgo).length,
      monthGenerations: transactions.filter(t => new Date(t.timestamp) >= monthAgo).length,
      lastActivity: transactions.length > 0 ? transactions[0].createdAt : ''
    };

    console.log(`Found ${transactions.length} transactions for user ${userId}`);

    // Return the data
    return NextResponse.json({
      success: true,
      transactions,
      stats
    });

  } catch (error: any) {
    console.error('API Error:', error);

    // Return more specific error messages for Realtime Database
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'UNKNOWN';

    switch (errorCode) {
      case 'PERMISSION_DENIED':
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied. Check Realtime Database security rules.',
            code: errorCode
          },
          { status: 403 }
        );

      case 'NETWORK_ERROR':
        return NextResponse.json(
          {
            success: false,
            error: 'Network error. Please check your connection.',
            code: errorCode
          },
          { status: 503 }
        );

      case 'DISCONNECTED':
        return NextResponse.json(
          {
            success: false,
            error: 'Database disconnected. Please try again.',
            code: errorCode
          },
          { status: 503 }
        );

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Database error: ${errorMessage}`,
            code: errorCode
          },
          { status: 500 }
        );
    }
  }
}

// Handle other HTTP methods with proper error responses
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'POST method not supported on this endpoint' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'PUT method not supported on this endpoint' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'DELETE method not supported on this endpoint' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'PATCH method not supported on this endpoint' },
    { status: 405 }
  );
}