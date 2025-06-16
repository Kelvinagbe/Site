// app/api/generate-wallpaper/route.ts
import { NextRequest, NextResponse } from 'next/server';

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

interface GenerateRequest {
  prompt: string;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Missing required parameters: prompt, width, and height are required' },
        { status: 400 }
      );
    }

    // Validate dimensions
    if (width < 64 || height < 64 || width > 2048 || height > 2048) {
      return NextResponse.json(
        { error: 'Invalid dimensions. Width and height must be between 64 and 2048 pixels' },
        { status: 400 }
      );
    }

    const enhancedPrompt = `${prompt}, wallpaper, high resolution, detailed, professional photography, masterpiece, best quality, ultra-detailed`;

    // Calculate model dimensions
    const maxDimension = 1024;
    let modelWidth = Math.min(width, maxDimension);
    let modelHeight = Math.min(height, maxDimension);

    // Maintain aspect ratio if scaling down
    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      modelWidth = Math.round(width * scale);
      modelHeight = Math.round(height * scale);
    }

    // Ensure dimensions are divisible by 8
    modelWidth = Math.round(modelWidth / 8) * 8;
    modelHeight = Math.round(modelHeight / 8) * 8;

    // Ensure minimum dimensions
    modelWidth = Math.max(modelWidth, 512);
    modelHeight = Math.max(modelHeight, 512);

    const requestBody = {
      inputs: enhancedPrompt,
      parameters: {
        width: modelWidth,
        height: modelHeight,
        num_inference_steps: 20, // Reduced for faster generation
        guidance_scale: 7.5,
        negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy, extra limbs, watermark, text, signature"
      }
    };

    console.log('Making request to Hugging Face API:', {
      prompt: enhancedPrompt,
      dimensions: `${modelWidth}x${modelHeight}`,
      originalDimensions: `${width}x${height}`
    });

    const response = await fetch(HF_MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'wallpaper-generator/1.0'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // Handle specific error cases
      if (response.status === 503) {
        return NextResponse.json(
          { 
            error: 'Model is currently loading. Please try again in 30-60 seconds.',
            retryAfter: 60
          },
          { status: 503 }
        );
      } else if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or missing API token' },
          { status: 401 }
        );
      } else if (response.status === 400) {
        return NextResponse.json(
          { error: `Bad request: ${errorText}` },
          { status: 400 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: `Failed to generate image: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    // Check if response is actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      const responseText = await response.text();
      console.error('Unexpected response type:', contentType, responseText);
      return NextResponse.json(
        { error: 'Received invalid response from image generation service' },
        { status: 500 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Received empty image data' },
        { status: 500 }
      );
    }

    console.log('Successfully generated image:', {
      size: `${imageBuffer.byteLength} bytes`,
      contentType
    });

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'no-cache',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating wallpaper:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}