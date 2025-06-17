import { NextRequest, NextResponse } from 'next/server';

// Types
interface GenerateRequest {
  prompt: string;
  width: number;
  height: number;
}

interface HuggingFaceResponse {
  error?: string;
  [key: string]: any;
}

// Configuration - Multiple model options for reliability
const MODELS = [
  'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
  'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
  'https://api-inference.huggingface.co/models/prompthero/openjourney',
  'https://api-inference.huggingface.co/models/nitrosocke/Arcane-Diffusion'
];

let currentModelIndex = 0;
const HF_TOKEN = process.env.HF_API_TOKEN;

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// Rate limiting function
function checkRateLimit(clientIP: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= limit) {
    return false;
  }
  
  clientData.count++;
  return true;
}

// Input validation
function validateInput(data: any): { isValid: boolean; error?: string; validated?: GenerateRequest } {
  if (!data.prompt || typeof data.prompt !== 'string') {
    return { isValid: false, error: 'Prompt is required and must be a string' };
  }
  
  if (data.prompt.trim().length < 3) {
    return { isValid: false, error: 'Prompt must be at least 3 characters long' };
  }
  
  if (data.prompt.length > 500) {
    return { isValid: false, error: 'Prompt must be less than 500 characters' };
  }
  
  const width = parseInt(data.width);
  const height = parseInt(data.height);
  
  if (isNaN(width) || isNaN(height)) {
    return { isValid: false, error: 'Width and height must be valid numbers' };
  }
  
  if (width < 512 || width > 2048 || height < 512 || height > 2048) {
    return { isValid: false, error: 'Width and height must be between 512 and 2048 pixels' };
  }
  
  // Check for inappropriate content (basic filter)
  const inappropriateTerms = [
    'nude', 'nsfw', 'explicit', 'sexual', 'porn', 'naked', 'violence', 'gore', 'hate'
  ];
  
  const promptLower = data.prompt.toLowerCase();
  for (const term of inappropriateTerms) {
    if (promptLower.includes(term)) {
      return { isValid: false, error: 'Prompt contains inappropriate content' };
    }
  }
  
  return {
    isValid: true,
    validated: {
      prompt: data.prompt.trim(),
      width,
      height
    }
  };
}

// Enhanced prompt for better wallpaper generation
function enhancePrompt(originalPrompt: string, width: number, height: number): string {
  const aspectRatio = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
  const resolution = width >= 1920 ? 'high resolution, 4k quality' : 'high quality';
  
  return `${originalPrompt}, ${aspectRatio} wallpaper, ${resolution}, detailed, beautiful, professional photography, perfect composition, vibrant colors, masterpiece`;
}

// Generate image using Hugging Face API with fallback models
async function generateImage(prompt: string, width: number, height: number): Promise<ArrayBuffer> {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face API token not configured');
  }
  
  // Validate token format
  if (!HF_TOKEN.startsWith('hf_')) {
    throw new Error('Invalid Hugging Face API token format. Token should start with "hf_"');
  }
  
  const enhancedPrompt = enhancePrompt(prompt, width, height);
  
  // Try different models until one works
  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    const modelUrl = MODELS[(currentModelIndex + attempt) % MODELS.length];
    
    try {
      console.log(`Trying model: ${modelUrl}`);
      
      const payload = {
        inputs: enhancedPrompt,
      };
      
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Detailed logging for debugging
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('image')) {
          console.log('✅ Success! Got image from:', modelUrl);
          // Success! Update the current model index for next time
          currentModelIndex = (currentModelIndex + attempt) % MODELS.length;
          return await response.arrayBuffer();
        } else {
          console.log('❌ Expected image but got:', contentType);
        }
      }
      
      // Log error details
      const errorText = await response.text();
      console.log(`❌ Model ${modelUrl} failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // If this is a rate limit or auth issue, don't try other models
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or unauthorized API token. Please check your Hugging Face API token.');
      }
      
    } catch (error) {
      console.log(`❌ Model ${modelUrl} error:`, error);
      // Continue to next model unless it's a critical error
      if (error instanceof Error && (error.message.includes('token') || error.message.includes('429') || error.message.includes('401') || error.message.includes('403'))) {
        throw error;
      }
    }
  }
  
  // If all models failed, throw a comprehensive error
  throw new Error(`All AI models are currently unavailable. This could be due to: 1) Invalid API token 2) Hugging Face service issues 3) Network problems. Check your server console for detailed error logs.`);
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting
    if (!checkRateLimit(clientIP, 5, 60000)) { // 5 requests per minute
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const validation = validateInput(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { prompt, width, height } = validation.validated!;
    
    // Generate image
    const imageBuffer = await generateImage(prompt, width, height);
    
    // Return image
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Set appropriate status codes for different error types
      if (errorMessage.includes('loading') || errorMessage.includes('503')) {
        statusCode = 503;
      } else if (errorMessage.includes('Too many requests')) {
        statusCode = 429;
      } else if (errorMessage.includes('token not configured')) {
        statusCode = 500;
        errorMessage = 'Service configuration error';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}