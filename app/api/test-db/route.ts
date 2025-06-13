// app/api/test-db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    const testData = {
      timestamp: Date.now(),
      message: 'Database connection test',
      iso: new Date().toISOString()
    };
    
    // Write test data
    await adminDb.ref('_test/connection').set(testData);
    console.log('Test data written successfully');
    
    // Read it back
    const snapshot = await adminDb.ref('_test/connection').once('value');
    const readData = snapshot.val();
    
    console.log('Test data read back:', readData);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      testData: readData
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}