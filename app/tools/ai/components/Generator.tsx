// app/api/generate-wallpaper/route.ts (App Router)

import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  width: number;
  height: number;
}

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const HF_TOKEN = process.env.HF_API_TOKEN; // Add this to your .env.local

// Rate limiting (optional - you can implement more sophisticated rate limiting)
const rateLimitMap = new Map();

const rateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 requests per minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const userLimit = rateLimitMap.get(ip);
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + windowMs;
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
};

const enhancePrompt = (prompt: string, width: number, height: number): string => {
  // Enhance the prompt for better wallpaper generation
  const basePrompt = prompt.trim();
  const aspectRatio = width > height ? "landscape" : width < height ? "portrait" : "square";
  
  return `${basePrompt}, ${aspectRatio} wallpaper, 4k resolution, high quality, detailed, vibrant colors, professional photography style, cinematic lighting, masterpiece`;
};

const generateImageWithHuggingFace = async (prompt: string, width: number, height: number): Promise<ArrayBuffer> => {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face API token not configured');
  }

  const enhancedPrompt = enhancePrompt(prompt, width, height);
  
  const payload = {
    inputs: enhancedPrompt,
    parameters: {
      width: Math.min(width, 1024), // SDXL max recommended width
      height: Math.min(height, 1024), // SDXL max recommended height
      num_inference_steps: 20,
      guidance_scale: 7.5,
      negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy, extra limbs, text, watermark, signature, username, low resolution, pixelated, grainy, artifacts, jpeg artifacts, compression artifacts, poorly drawn, amateur, sketch, draft, unfinished, error, glitch, noise, oversaturated"
    },
    options: {
      wait_for_model: true,
      use_cache: false
    }
  };

  console.log('Sending request to Hugging Face with prompt:', enhancedPrompt);

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Hugging Face API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });

    // Handle specific errors
    if (response.status === 503) {
      throw new Error('AI model is currently loading. Please wait 30 seconds and try again.');
    } else if (response.status === 401) {
      throw new Error('Invalid API token. Please check your Hugging Face configuration.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (errorText.includes('estimated_time')) {
      throw new Error('Model is loading. Please try again in a few moments.');
    }

    throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    // Sometimes HF returns JSON with error or estimated time
    const jsonResponse = await response.json();
    console.log('HF JSON Response:', jsonResponse);
    
    if (jsonResponse.error) {
      throw new Error(jsonResponse.error);
    } else if (jsonResponse.estimated_time) {
      throw new Error(`Model is loading. Estimated time: ${jsonResponse.estimated_time} seconds. Please try again.`);
    }
    
    throw new Error('Unexpected JSON response from API');
  }

  // Should be image data
  const arrayBuffer = await response.arrayBuffer();
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Received empty response from API');
  }

  return arrayBuffer;
};

// App Router handler
export async function POST(request: NextRequest) {
  try {
    const { prompt, width = 1024, height = 1024 }: GenerateRequest = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    if (prompt.length > 500) {
      return NextResponse.json({ error: 'Prompt too long. Maximum 500 characters.' }, { status: 400 });
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(clientIP)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
    }

    console.log('Generating image with prompt:', prompt);

    const imageBuffer = await generateImageWithHuggingFace(prompt, width, height);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}