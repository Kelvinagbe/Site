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

    const HF_TOKEN = process.env.HF_API_TOKEN;

    if (!HF_TOKEN) {
      console.error('HF_API_TOKEN environment variable not found');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Generating image for prompt:', prompt);

    // Enhanced prompt for better results
    const enhancedPrompt = `${prompt.trim()}, high quality, detailed, masterpiece, 8k resolution`;

    const requestPayload = {
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted, low resolution, text, watermark, deformed, ugly, duplicate, morbid, mutilated',
        num_inference_steps: 25,
        guidance_scale: 7.5,
        width: 1024,
        height: 1024,
      },
    };

    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

    // Call Hugging Face API with better error handling
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'image-generator/1.0',
        },
        body: JSON.stringify(requestPayload),
      }
    );

    console.log('Hugging Face API response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });

      // Handle specific error cases with more detail
      if (response.status === 503) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'The AI model is currently loading. Please wait about 1-2 minutes and try again.',
            retryAfter: 120
          },
          { status: 503 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many requests. Please wait a moment and try again.',
            retryAfter: 60
          },
          { status: 429 }
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'API authentication failed. Please check your API key configuration.'
          },
          { status: 401 }
        );
      }

      if (response.status === 400) {
        // Parse error details for bad request
        let errorDetail = 'Invalid request parameters';
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.error || errorData.message || errorDetail;
        } catch {
          errorDetail = errorText || errorDetail;
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Bad request: ${errorDetail}`
          },
          { status: 400 }
        );
      }

      if (response.status === 422) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'The prompt contains invalid content or parameters. Please try a different prompt.'
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to generate image: ${response.status} - ${errorText || response.statusText}`
        },
        { status: response.status }
      );
    }

    // Check content type to ensure we received an image
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);

    if (!contentType || !contentType.startsWith('image/')) {
      const responseText = await response.text();
      console.error('Unexpected response content type:', {
        contentType,
        responseBody: responseText.substring(0, 500) // Log first 500 chars
      });

      // Sometimes the API returns JSON error in 200 response
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          return NextResponse.json(
            { success: false, error: errorData.error },
            { status: 500 }
          );
        }
      } catch {
        // Not JSON, continue with generic error
      }

      return NextResponse.json(
        { success: false, error: 'Received invalid response format from image generation service' },
        { status: 500 }
      );
    }

    // Convert response to image
    const imageBuffer = await response.arrayBuffer();

    if (imageBuffer.byteLength === 0) {
      console.error('Received empty image buffer');
      return NextResponse.json(
        { success: false, error: 'Received empty image data' },
        { status: 500 }
      );
    }

    console.log('Image buffer size:', imageBuffer.byteLength, 'bytes');

    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('Image generated successfully, base64 length:', base64Image.length);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      timestamp: Date.now(),
      size: imageBuffer.byteLength,
    });

  } catch (error) {
    console.error('Unexpected error generating image:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, error: 'Network error: Unable to connect to image generation service' },
        { status: 503 }
      );
    }

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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}