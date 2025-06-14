// app/api/download-iframe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'video.mp4';

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Create an HTML page that triggers download
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Download Video</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .container {
                text-align: center;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .download-btn {
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
            }
            .download-btn:hover {
                background-color: #45a049;
            }
            .status {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
            }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
            .info { background-color: #d1ecf1; color: #0c5460; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Video Download</h2>
            <div id="status" class="status info">
                Preparing download...
            </div>
            <button onclick="downloadVideo()" class="download-btn">
                Download Video
            </button>
            <button onclick="openVideo()" class="download-btn" style="background-color: #2196F3;">
                Open Video
            </button>
        </div>

        <script>
            const videoUrl = "${url.replace(/"/g, '\\"')}";
            const fileName = "${filename.replace(/"/g, '\\"')}";

            function updateStatus(message, type = 'info') {
                const statusDiv = document.getElementById('status');
                statusDiv.textContent = message;
                statusDiv.className = 'status ' + type;
            }

            async function downloadVideo() {
                updateStatus('Starting download...', 'info');
                
                try {
                    // Method 1: Try fetch with blob
                    const response = await fetch(videoUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://www.tiktok.com/'
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        window.URL.revokeObjectURL(downloadUrl);
                        updateStatus('Download started successfully!', 'success');
                        
                        // Close iframe after delay
                        setTimeout(() => {
                            if (window.parent !== window) {
                                window.parent.postMessage('download-complete', '*');
                            }
                        }, 2000);
                        
                        return;
                    }
                } catch (error) {
                    console.error('Fetch download failed:', error);
                }

                // Method 2: Try direct link approach
                try {
                    const link = document.createElement('a');
                    link.href = videoUrl;
                    link.download = fileName;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    updateStatus('Download initiated. Check your downloads folder.', 'success');
                } catch (error) {
                    updateStatus('Download failed. Try the "Open Video" button.', 'error');
                }
            }

            function openVideo() {
                window.open(videoUrl, '_blank', 'noopener,noreferrer');
                updateStatus('Video opened in new tab. Right-click to save.', 'info');
            }

            // Auto-trigger download after page loads
            window.addEventListener('load', () => {
                setTimeout(downloadVideo, 1000);
            });
        </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
    },
  });
}