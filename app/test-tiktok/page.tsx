'use client';

import { useState } from 'react';

interface TikTokData {
  title: string;
  duration: number;
  view_count: number;
  like_count: number;
  download_url: string;
  thumbnail: string;
  uploader: string;
  upload_date: string;
  video_id?: string;
  method?: string;
  note?: string;
}

export default function TikTokTestPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<TikTokData | null>(null);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch('/api/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch TikTok data');
        if (result.debug_info) {
          console.error('Debug info:', result.debug_info);
        }
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async () => {
    if (!data?.download_url) {
      setError('No download URL available');
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);

    try {
      // Method 1: Try server-side download proxy
      const proxyResponse = await fetch('/api/download-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: data.download_url,
          filename: `tiktok_${data.video_id || Date.now()}.mp4`
        }),
      });

      if (proxyResponse.ok) {
        const blob = await proxyResponse.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tiktok_${data.video_id || Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        setDownloadProgress(100);
        return;
      }

      // Method 2: Try direct fetch with CORS headers
      const response = await fetch(data.download_url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.tiktok.com/',
          'Origin': 'https://www.tiktok.com'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loaded += value.length;

          if (total > 0) {
            setDownloadProgress(Math.round((loaded / total) * 100));
          }
        }
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `tiktok_${data.video_id || Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadProgress(100);

    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Try iframe download method
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `/api/download-iframe?url=${encodeURIComponent(data.download_url)}&filename=${encodeURIComponent(`tiktok_${data.video_id || Date.now()}.mp4`)}`;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 5000);
        
        setError('Download initiated via alternative method. Check your downloads folder.');
      } catch (iframeError) {
        // Final fallback: Open in new tab
        const link = document.createElement('a');
        link.href = data.download_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `tiktok_${data.video_id || Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setError('Direct download failed. Video opened in new tab - right-click to save as.');
      }
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openInNewTab = () => {
    if (data?.download_url) {
      window.open(data.download_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">TikTok Video Downloader</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2 text-gray-700">
              TikTok URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/... or https://vm.tiktok.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Get Video Info'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <strong>Error:</strong>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {data && (
        <div className="bg-white border rounded-lg shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Video Information</h2>
            {data.method && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {data.method.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {data.thumbnail && (
            <div className="flex justify-center">
              <img 
                src={data.thumbnail} 
                alt="Video thumbnail" 
                className="max-w-sm w-full rounded-lg shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Title:</strong>
              <p className="mt-1">{data.title || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Uploader:</strong>
              <p className="mt-1">{data.uploader || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Duration:</strong>
              <p className="mt-1">{data.duration ? `${data.duration}s` : 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Views:</strong>
              <p className="mt-1">{data.view_count?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Likes:</strong>
              <p className="mt-1">{data.like_count?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong className="text-gray-600">Upload Date:</strong>
              <p className="mt-1">{data.upload_date || 'N/A'}</p>
            </div>
          </div>

          {data.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 text-sm">{data.note}</p>
            </div>
          )}

          {/* Download Section */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Download Options</h3>
              {downloading && downloadProgress > 0 && (
                <span className="text-sm text-blue-600">{downloadProgress}%</span>
              )}
            </div>

            {downloading && downloadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={downloadVideo}
                disabled={downloading || !data.download_url}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Download...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </>
                )}
              </button>

              <button
                onClick={openInNewTab}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Video
              </button>

              <button
                onClick={() => copyToClipboard(data.download_url)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy URL
              </button>

              <a
                href={data.download_url}
                download={`tiktok_${data.video_id || Date.now()}.mp4`}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center text-center no-underline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Direct Link
              </a>
            </div>

            {data.download_url && (
              <div className="text-xs text-gray-500 break-all">
                <strong>Direct URL:</strong> {data.download_url}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Copy a TikTok video URL (from the share button)</li>
          <li>Paste it in the input field above</li>
          <li>Click "Get Video Info" to process the URL</li>
          <li>Try different download methods if one fails</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
          <strong>Download Methods:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li><strong>Download:</strong> Attempts multiple download strategies</li>
            <li><strong>Open Video:</strong> Opens video in new tab for manual save</li>
            <li><strong>Copy URL:</strong> Copies direct URL to clipboard</li>
            <li><strong>Direct Link:</strong> Browser's native download attempt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}