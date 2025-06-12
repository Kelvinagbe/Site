// app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid prompt' },
        { status: 400 }
      );
    }

    // Check if prompt is too long
    if (prompt.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Prompt is too long. Please keep it under 500 characters.' },
        { status: 400 }
      );
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
    
    if (!HF_TOKEN) {
      console.error('Hugging Face API key not found');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Generating image for prompt:', prompt);

    // Call Hugging Face API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted, low resolution, text, watermark',
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      if (response.status === 503) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'The AI model is currently loading. Please wait about 1-2 minutes and try again.' 
          },
          { status: 503 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many requests. Please wait a moment and try again.' 
          },
          { status: 429 }
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'API key invalid. Please check your configuration.' 
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate image. Please try again.' 
        },
        { status: response.status }
      );
    }

    // Convert response to image
    const imageBuffer = await response.arrayBuffer();
    
    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'Received empty image data' },
        { status: 500 }
      );
    }

    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('Image generated successfully');

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Unexpected error generating image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
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