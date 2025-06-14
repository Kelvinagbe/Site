import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import fetch from 'node-fetch';

// Helper function to resolve TikTok URLs
async function resolveTikTokUrl(url: string): Promise<string> {
  try {
    // Handle vm.tiktok.com and other shortened URLs
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      const response = await fetch(url, { 
        method: 'HEAD',
        redirect: 'follow' 
      });
      return response.url;
    }
    return url;
  } catch (error) {
    console.error('URL resolution error:', error);
    return url;
  }
}

// Helper function to extract video ID from TikTok URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[^/]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /tiktok\.com.*[?&]v=(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /vt\.tiktok\.com\/([A-Za-z0-9]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'TikTok URL is required' },
        { status: 400 }
      );
    }

    console.log('Original URL:', url);

    // Clean the URL - remove extra text
    const cleanUrl = url.split(' ')[0].trim();
    console.log('Cleaned URL:', cleanUrl);

    // Resolve shortened URLs
    const resolvedUrl = await resolveTikTokUrl(cleanUrl);
    console.log('Resolved URL:', resolvedUrl);

    // Try different approaches for TikTok data extraction
    
    // Method 1: Try with yt-dlp-wrap (using your installed package)
    try {
      const ytDlpWrap = new YTDlpWrap();
      const videoInfo = await ytDlpWrap.getVideoInfo(resolvedUrl);
      
      return NextResponse.json({
        success: true,
        data: {
          title: videoInfo.title || 'TikTok Video',
          duration: videoInfo.duration || 0,
          view_count: videoInfo.view_count || 0,
          like_count: videoInfo.like_count || 0,
          download_url: videoInfo.url || '',
          thumbnail: videoInfo.thumbnail || '',
          uploader: videoInfo.uploader || '',
          upload_date: videoInfo.upload_date || '',
          original_url: url,
          resolved_url: resolvedUrl
        }
      });
    } catch (ytDlpError) {
      console.error('yt-dlp error:', ytDlpError);
    }

    // Method 2: Basic URL validation and return structure
    const videoId = extractVideoId(resolvedUrl);
    
    if (videoId) {
      return NextResponse.json({
        success: true,
        data: {
          title: 'TikTok Video (Limited Info)',
          duration: 0,
          view_count: 0,
          like_count: 0,
          download_url: resolvedUrl,
          thumbnail: '',
          uploader: 'Unknown',
          upload_date: '',
          video_id: videoId,
          original_url: url,
          resolved_url: resolvedUrl,
          note: 'Limited information available - URL was processed successfully'
        }
      });
    }

    throw new Error('Could not extract video information');

  } catch (error) {
    console.error('TikTok API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process TikTok URL',
        details: error instanceof Error ? error.message : 'Unknown error',
        url_received: request.url
      },
      { status: 500 }
    );
  }
}

// Optional GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'TikTok API is running',
    usage: 'Send POST request with { "url": "your_tiktok_url" }',
    supported_formats: [
      'https://www.tiktok.com/@username/video/123456',
      'https://vm.tiktok.com/abcdef/',
      'https://vt.tiktok.com/abcdef/'
    ]
  });
}