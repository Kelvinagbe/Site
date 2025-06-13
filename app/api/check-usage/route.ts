// app/api/check-usage/route.ts

import { db } from '@/lib/firebase-admin'; // Your Firebase admin config

interface UserUsage {
  userId: string;
  generations: number;
  lastReset: number;
}

const GENERATION_LIMIT = 2; // 2 images per hour
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return Response.json({
        success: false,
        error: 'Valid userId is required'
      }, { status: 400 });
    }

    // Get user usage document from Firestore
    const userUsageRef = db.collection('userUsage').doc(userId);
    const userUsageDoc = await userUsageRef.get();

    const now = Date.now();
    let userUsage: UserUsage;

    if (!userUsageDoc.exists) {
      // First time user - create new usage record
      userUsage = {
        userId,
        generations: 0,
        lastReset: now
      };

      // Save to Firestore
      await userUsageRef.set(userUsage);
    } else {
      const data = userUsageDoc.data() as UserUsage;
      
      // Check if we need to reset the counter (more than 1 hour has passed)
      const timeSinceReset = now - data.lastReset;
      
      if (timeSinceReset >= RESET_INTERVAL) {
        // Reset the counter
        userUsage = {
          userId,
          generations: 0,
          lastReset: now
        };

        // Update in Firestore
        await userUsageRef.update({
          generations: 0,
          lastReset: now
        });
      } else {
        // Use existing data
        userUsage = data;
      }
    }

    // Calculate remaining time until reset
    const timeUntilReset = RESET_INTERVAL - (now - userUsage.lastReset);
    const remainingGenerations = Math.max(0, GENERATION_LIMIT - userUsage.generations);
    const canGenerate = userUsage.generations < GENERATION_LIMIT;

    return Response.json({
      success: true,
      usage: userUsage,
      canGenerate,
      remainingGenerations,
      timeUntilReset: Math.max(0, timeUntilReset),
      limit: GENERATION_LIMIT
    });

  } catch (error) {
    console.error('Error checking user usage:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to check usage. Please try again later.'
    }, { status: 500 });
  }
}