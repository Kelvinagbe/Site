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
}

export default function TikTokTestPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TikTokData | null>(null);
  const [error, setError] = useState('');

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
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">TikTok API Test</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            TikTok URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@username/video/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get TikTok Info'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="bg-white border rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">Video Information</h2>
          
          {data.thumbnail && (
            <img 
              src={data.thumbnail} 
              alt="Video thumbnail" 
              className="w-full max-w-sm mx-auto rounded"
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Title:</strong> {data.title || 'N/A'}
            </div>
            <div>
              <strong>Uploader:</strong> {data.uploader || 'N/A'}
            </div>
            <div>
              <strong>Duration:</strong> {data.duration ? `${data.duration}s` : 'N/A'}
            </div>
            <div>
              <strong>Views:</strong> {data.view_count?.toLocaleString() || 'N/A'}
            </div>
            <div>
              <strong>Likes:</strong> {data.like_count?.toLocaleString() || 'N/A'}
            </div>
            <div>
              <strong>Upload Date:</strong> {data.upload_date || 'N/A'}
            </div>
          </div>
          
          {data.download_url && (
            <div className="pt-4 border-t">
              <strong>Download URL:</strong>
              <a 
                href={data.download_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline ml-2 break-all"
              >
                {data.download_url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}