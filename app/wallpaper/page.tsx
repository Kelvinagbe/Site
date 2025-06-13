'use client';

import React, { useState } from 'react';

const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetResolutions = [
    { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { name: '4K (3840x2160)', width: 3840, height: 2160 },
    { name: 'iPhone (1170x2532)', width: 1170, height: 2532 },
    { name: 'iPad (2048x2732)', width: 2048, height: 2732 },
    { name: 'Desktop Square (1080x1080)', width: 1080, height: 1080 },
    { name: 'Ultrawide (3440x1440)', width: 3440, height: 1440 },
  ];

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
    link.download = `wallpaper-${width}x${height}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePresetSelect = (preset: { width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Wallpaper Generator</h1>
          <p className="text-gray-300">Create stunning wallpapers with AI-powered image generation</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-white font-medium mb-2">
                Describe your wallpaper
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A serene mountain landscape at sunset with purple sky and golden light"
                className="w-full p-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Resolution Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Quick Presets</label>
                <div className="grid grid-cols-1 gap-2">
                  {presetResolutions.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        width === preset.width && height === preset.height
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/20 text-gray-300 hover:bg-white/30'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm opacity-75">{preset.width} × {preset.height}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Custom Dimensions</label>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="width" className="block text-gray-300 text-sm mb-1">Width</label>
                    <input
                      type="number"
                      id="width"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      min="512"
                      max="4096"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-gray-300 text-sm mb-1">Height</label>
                    <input
                      type="number"
                      id="height"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 1080)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      min="512"
                      max="4096"
                    />
                  </div>
                  <div className="text-sm text-gray-300">
                    Aspect Ratio: {(width / height).toFixed(2)}:1
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Wallpaper...</span>
                </div>
              ) : (
                'Generate Wallpaper'
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Generated Image */}
            {generatedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated wallpaper"
                    className="w-full rounded-lg shadow-2xl border border-white/20"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white text-sm font-medium">{width} × {height}</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Download Wallpaper
                  </button>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">💡 Tips for Better Results</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <ul className="space-y-2">
              <li>• Be specific about colors, lighting, and mood</li>
              <li>• Mention the style (realistic, artistic, minimalist)</li>
              <li>• Include composition details (center, left, panoramic)</li>
            </ul>
            <ul className="space-y-2">
              <li>• Try keywords like "vibrant", "serene", "dramatic"</li>
              <li>• Generation may take 30-60 seconds</li>
              <li>• Higher resolutions may be scaled down during generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperGenerator;