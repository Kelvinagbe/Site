import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Helper function to resolve TikTok URLs
async function resolveTikTokUrl(url: string): Promise<string> {
  try {
    console.log('Resolving URL:', url);
    
    // Handle vm.tiktok.com and other shortened URLs
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      const response = await fetch(url, { 
        method: 'HEAD',
        redirect: 'follow'
      });
      console.log('Resolved to:', response.url);
      return response.url;
    }
    return url;
  } catch (error) {
    console.error('URL resolution error:', error);
    throw new Error(`Failed to resolve URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to extract video ID from TikTok URL
function extractVideoId(url: string): string | null {
  const patterns = [
    // Standard format: @username/video/123456
    /tiktok\.com\/@[^/]+\/video\/(\d+)/,
    // Malformed format: @/video/123456 (missing username)
    /tiktok\.com\/@\/video\/(\d+)/,
    // Direct video format: /v/123456
    /tiktok\.com\/v\/(\d+)/,
    // Query parameter format: ?v=123456 or &v=123456
    /tiktok\.com.*[?&]v=(\d+)/,
    // Short URLs
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /vt\.tiktok\.com\/([A-Za-z0-9]+)/,
    // Extract from any URL that has /video/ followed by digits
    /\/video\/(\d+)/,
    // Extract from share_item_id parameter
    /share_item_id=(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Extracted video ID:', match[1], 'using pattern:', pattern.source);
      return match[1];
    }
  }
  
  console.log('No video ID found in URL:', url);
  return null;
}

// Alternative method using puppeteer-like scraping (fallback)
async function scrapeTikTokBasicInfo(url: string) {
  try {
    console.log('Attempting to scrape basic info from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extract basic info from HTML (this is a simplified approach)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' | TikTok', '').trim() : 'TikTok Video';
    
    return {
      title,
      success: true,
      method: 'html_scraping'
    };
  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let originalUrl = '';
  let resolvedUrl = '';
  let cleanUrl = '';
  
  try {
    console.log('=== TikTok API Request Started ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { url } = body;
    originalUrl = url;
    
    if (!url) {
      console.error('No URL provided');
      return NextResponse.json(
        { error: 'TikTok URL is required' },
        { status: 400 }
      );
    }

    console.log('Original URL:', url);

    // Validate and potentially fix URL format
    if (!url.includes('tiktok.com')) {
      console.error('Invalid TikTok URL format');
      return NextResponse.json(
        { error: 'Invalid TikTok URL format' },
        { status: 400 }
      );
    }

    // Check for malformed URL (missing username)
    if (url.includes('tiktok.com/@/video/')) {
      console.log('Detected malformed URL with missing username');
      // Extract video ID from malformed URL
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        console.log('Extracted video ID from malformed URL:', videoId);
        
        // Return early with basic info since we have the video ID
        return NextResponse.json({
          success: true,
          data: {
            title: 'TikTok Video (Malformed URL)',
            duration: 0,
            view_count: 0,
            like_count: 0,
            download_url: cleanUrl,
            thumbnail: '',
            uploader: 'Unknown',
            upload_date: new Date().toISOString().split('T')[0],
            video_id: videoId,
            original_url: originalUrl,
            resolved_url: cleanUrl,
            method: 'malformed_url_extraction',
            note: 'Video ID extracted from malformed URL structure'
          }
        });
      }
    }

// Helper function to clean and normalize TikTok URLs
function cleanTikTokUrl(url: string): string {
  try {
    // Remove extra parameters that might cause issues
    const urlObj = new URL(url);
    
    // Keep only essential parameters
    const essentialParams = ['_r', '_d'];
    const newSearchParams = new URLSearchParams();
    
    essentialParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        newSearchParams.set(param, urlObj.searchParams.get(param)!);
      }
    });
    
    // Reconstruct clean URL
    const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    return newSearchParams.toString() ? `${cleanUrl}?${newSearchParams.toString()}` : cleanUrl;
  } catch (error) {
    console.error('Error cleaning URL:', error);
    // If URL parsing fails, just return the original
    return url.split(' ')[0].trim();
  }
}

    // Resolve shortened URLs
    try {
      resolvedUrl = await resolveTikTokUrl(cleanUrl);
      console.log('Resolved URL:', resolvedUrl);
    } catch (urlError) {
      console.error('URL resolution failed:', urlError);
      resolvedUrl = cleanUrl; // Use original if resolution fails
    }

    // Try different methods in order of preference
    
    // Method 1: Try with yt-dlp (if available)
    let ytDlpError = null;
    try {
      console.log('Attempting yt-dlp method...');
      
      // Check if yt-dlp-wrap is properly installed
      const YTDlpWrap = require('yt-dlp-wrap');
      const ytDlpWrap = new YTDlpWrap();
      
      // Test if yt-dlp binary is available
      await ytDlpWrap.getVideoInfo(resolvedUrl);
      
      console.log('yt-dlp method succeeded');
      // If we get here, yt-dlp worked - you can process the result
      
    } catch (error) {
      ytDlpError = error;
      console.error('yt-dlp method failed:', error instanceof Error ? error.message : error);
    }

    // Method 2: Try basic HTML scraping
    try {
      console.log('Attempting HTML scraping method...');
      const scrapedInfo = await scrapeTikTokBasicInfo(resolvedUrl);
      
      const videoId = extractVideoId(resolvedUrl);
      
      return NextResponse.json({
        success: true,
        data: {
          title: scrapedInfo.title,
          duration: 0,
          view_count: 0,
          like_count: 0,
          download_url: resolvedUrl,
          thumbnail: `https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/placeholder.jpeg`, // Generic placeholder
          uploader: 'Unknown',
          upload_date: new Date().toISOString().split('T')[0],
          video_id: videoId,
          original_url: originalUrl,
          resolved_url: resolvedUrl,
          method: scrapedInfo.method,
          note: 'Basic information extracted via HTML scraping'
        }
      });
    } catch (scrapingError) {
      console.error('HTML scraping method failed:', scrapingError);
    }

    // Method 3: Return basic URL validation result
    const videoId = extractVideoId(resolvedUrl);
    
    if (videoId) {
      console.log('Returning basic validation result');
      return NextResponse.json({
        success: true,
        data: {
          title: 'TikTok Video (Limited Access)',
          duration: 0,
          view_count: 0,
          like_count: 0,
          download_url: resolvedUrl,
          thumbnail: '',
          uploader: 'Unknown',
          upload_date: new Date().toISOString().split('T')[0],
          video_id: videoId,
          original_url: originalUrl,
          resolved_url: resolvedUrl,
          method: 'url_validation',
          note: 'URL validated but detailed information unavailable',
          warnings: [
            ytDlpError ? `yt-dlp failed: ${ytDlpError instanceof Error ? ytDlpError.message : 'Unknown error'}` : null
          ].filter(Boolean)
        }
      });
    }

    throw new Error('All extraction methods failed - could not process TikTok URL');

  } catch (error) {
    console.error('=== TikTok API Error ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to process TikTok URL',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug_info: {
          original_url: originalUrl,
          clean_url: cleanUrl,
          resolved_url: resolvedUrl || 'Failed to resolve',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'unknown'
        }
      },
      { status: 500 }
    );
  }
}

// Enhanced GET method for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testUrl = searchParams.get('url');
  
  if (testUrl) {
    // Test the API with the provided URL
    try {
      const testResult = await POST(new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
        headers: { 'Content-Type': 'application/json' }
      }));
      
      return testResult;
    } catch (error) {
      return NextResponse.json({
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({
    message: 'TikTok API is running',
    usage: 'Send POST request with { "url": "your_tiktok_url" }',
    test_usage: 'Add ?url=your_tiktok_url to test via GET',
    supported_formats: [
      'https://www.tiktok.com/@username/video/123456',
      'https://vm.tiktok.com/abcdef/',
      'https://vt.tiktok.com/abcdef/'
    ],
    debug_info: {
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
}