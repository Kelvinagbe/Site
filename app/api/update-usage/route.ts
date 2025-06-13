// app/api/update-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

interface UserUsage {
  userId: string;
  generations: number;
  lastReset: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Validate userId format (basic validation)
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID format' 
      }, { status: 400 });
    }

    const usageRef = db.collection('userUsage').doc(userId);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Get current usage data
    const usageDoc = await usageRef.get();
    
    if (!usageDoc.exists) {
      // Create initial usage record only once
      const initialUsage: UserUsage = {
        userId,
        generations: 1, // First generation
        lastReset: currentTime,
      };
      await usageRef.set(initialUsage);
      
      return NextResponse.json({
        success: true,
        usage: initialUsage,
        message: 'Usage created and updated successfully'
      });
    }

    const currentUsage = usageDoc.data() as UserUsage;
    
    // Check if we need to reset the counter (more than 1 hour passed)
    const timeSinceReset = currentTime - currentUsage.lastReset;
    
    let updatedUsage: UserUsage;
    
    if (timeSinceReset >= oneHour) {
      // Reset counter and set to 1 (this generation)
      updatedUsage = {
        userId,
        generations: 1,
        lastReset: currentTime,
      };
    } else {
      // Just increment the existing count
      updatedUsage = {
        ...currentUsage,
        generations: currentUsage.generations + 1,
      };
    }

    // Update only the fields that changed
    await usageRef.update({
      generations: updatedUsage.generations,
      lastReset: updatedUsage.lastReset,
    });

    // Return updated usage data
    return NextResponse.json({
      success: true,
      usage: updatedUsage,
      message: 'Usage updated successfully'
    });

  } catch (error) {
    console.error('Error updating usage:', error);
    
    // Return appropriate error message
    let errorMessage = 'Failed to update usage';
    if (error instanceof Error) {
      // Don't expose sensitive error details to client
      if (error.message.includes('permission') || error.message.includes('auth')) {
        errorMessage = 'Database access denied';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error, please try again';
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}