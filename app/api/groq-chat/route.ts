import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // or another model you want
        messages: [
          {
            role: 'system',
            content: 'your name is V0 You are a helpful AI assistant. Provide clear and helpful responses.'
          },
          ...messages
        ],
        max_tokens: 1000, // reduced for safety
        temperature: 0.7,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from Groq API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Groq API response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure from Groq API:', data);
      return NextResponse.json(
        { error: 'Invalid response from Groq API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Error in groq-chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}