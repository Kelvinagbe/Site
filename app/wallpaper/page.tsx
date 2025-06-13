'use client';

import React, { useState } from 'react';

const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [width] = useState(721);
  const [height] = useState(1612);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-wallpaper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width,
          height,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);
      setShowImagePopup(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate wallpaper');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `mobile-wallpaper-${width}x${height}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePopup = () => {
    setShowImagePopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Mobile Wallpaper Generator</h1>
          <p className="text-gray-300">Create stunning mobile wallpapers with AI</p>
        </div>

        {/* Current Resolution Display */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-white font-medium">Resolution:</span>
            <span className="text-purple-200 font-bold">{width} × {height}</span>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your perfect mobile wallpaper..."
            className="w-full p-6 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none text-lg"
            rows={4}
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-6 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-2xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-2xl"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Your Wallpaper...</span>
              </div>
            ) : (
              'Generate Wallpaper'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">💡 Tips for Better Results</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <ul className="space-y-2">
              <li>• Be specific about colors and mood</li>
              <li>• Mention style (realistic, artistic, minimal)</li>
              <li>• Include lighting details</li>
            </ul>
            <ul className="space-y-2">
              <li>• Try keywords like "vibrant", "serene"</li>
              <li>• Generation takes 30-60 seconds</li>
              <li>• Perfect for mobile screens</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Popup Modal */}
      {showImagePopup && generatedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-sm w-full">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              ✕
            </button>
            
            {/* Image Container */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl">
              <img
                src={generatedImage}
                alt="Generated mobile wallpaper"
                className="w-full rounded-2xl shadow-xl"
                style={{ aspectRatio: `${width}/${height}` }}
              />
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage(null);
                    setShowImagePopup(false);
                  }}
                  className="py-4 px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperGenerator;