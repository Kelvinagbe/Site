// app/api/generate-wallpaper/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Use environment variable instead of hardcoded token
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

interface GenerateRequest {
  prompt: string;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API token is configured
    if (!HF_API_TOKEN) {
      console.error('HF_API_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { prompt, width, height } = body;

    if (!prompt || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Enhance the prompt for better wallpaper generation
    const enhancedPrompt = `${prompt}, wallpaper, high resolution, detailed, professional photography, masterpiece, best quality, ultra-detailed`;

    // Calculate appropriate dimensions for the model
    // Most models work better with specific aspect ratios
    const maxDimension = 1024;
    let modelWidth = width;
    let modelHeight = height;

    // Scale down if dimensions are too large
    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      modelWidth = Math.round(width * scale);
      modelHeight = Math.round(height * scale);
    }

    // Ensure dimensions are divisible by 8 (required by most diffusion models)
    modelWidth = Math.round(modelWidth / 8) * 8;
    modelHeight = Math.round(modelHeight / 8) * 8;

    const requestBody = {
      inputs: enhancedPrompt,
      parameters: {
        width: modelWidth,
        height: modelHeight,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy, extra limbs, watermark, text, signature"
      }
    };

    console.log('Generating image with:', {
      prompt: enhancedPrompt,
      dimensions: `${modelWidth}x${modelHeight}`,
      originalDimensions: `${width}x${height}`
    });

    const response = await fetch(HF_MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Model is currently loading. Please try again in a few moments.' },
          { status: 503 }
        );
      } else if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API token' },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { error: `Failed to generate image: ${errorText}` },
          { status: response.status }
        );
      }
    }

    const imageBuffer = await response.arrayBuffer();
    
    // If we need to resize the image back to original dimensions
    let finalImageBuffer = imageBuffer;
    
    if (modelWidth !== width || modelHeight !== height) {
      // For production, you might want to use a proper image processing library
      // like sharp to resize the image to exact user dimensions
      console.log(`Note: Image generated at ${modelWidth}x${modelHeight}, user requested ${width}x${height}`);
    }

    return new NextResponse(finalImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating wallpaper:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}