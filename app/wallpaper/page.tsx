'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Wand2, Settings } from 'lucide-react';

const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [width, setWidth] = useState(721);
  const [height, setHeight] = useState(1612);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Auto-detect site name (fallback to default)
  const siteName = typeof window !== 'undefined' ? 
    window.location.hostname.replace('www.', '').split('.')[0] || 'WallCraft' : 'WallCraft';

  // Theme detection
  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark') || 
                    htmlElement.getAttribute('data-theme') === 'dark' ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', detectTheme);
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Convert response to blob and create object URL
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setGeneratedImage(imageUrl);
      setShowPreview(true);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${siteName}-wallpaper-${width}x${height}-${Date.now()}.jpg`;
    link.click();
  };

  const presetSizes = [
    { name: 'Mobile Portrait', width: 721, height: 1612 },
    { name: 'iPhone 14', width: 1179, height: 2556 },
    { name: 'Samsung S23', width: 1080, height: 2340 },
    { name: 'iPad', width: 1620, height: 2160 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'Desktop 4K', width: 3840, height: 2160 },
  ];

  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      card: 'bg-gray-800',
      cardBorder: 'border-gray-700',
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
      button: 'bg-gray-800 hover:bg-gray-700',
      modal: 'bg-gray-800',
      error: 'bg-red-900/20 border-red-800 text-red-300',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      card: 'bg-white',
      cardBorder: 'border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      button: 'bg-gray-200 hover:bg-gray-300',
      modal: 'bg-white',
      error: 'bg-red-50 border-red-200 text-red-700',
    }
  };

  const currentTheme = themeClasses[theme as keyof typeof themeClasses];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-4 transition-colors`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">{siteName}</h1>
        <button
          onClick={() => setShowSizeModal(true)}
          className={`p-2 rounded-lg ${currentTheme.button}`}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className={`flex rounded-lg p-1 mb-6 ${currentTheme.card}`}>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-blue-600 text-white'
              : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          <Wand2 size={16} className="inline mr-2" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'gallery'
              ? 'bg-blue-600 text-white'
              : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Gallery
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-4`}>
            <div className="text-center mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                {width} × {height}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your wallpaper..."
              className={`w-full p-3 rounded-lg border ${currentTheme.input} resize-none text-sm`}
              rows={3}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {isGenerating ? 'Creating...' : 'Generate'}
            </button>

            {error && (
              <div className={`mt-3 p-2 ${currentTheme.error} border rounded-lg text-xs`}>
                {error}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-4`}>
            <h3 className="font-medium mb-2 text-sm">Tips</h3>
            <ul className="text-xs space-y-1 opacity-70">
              <li>• Be specific about colors and mood</li>
              <li>• Mention artistic styles (e.g., minimalist, abstract)</li>
              <li>• Include lighting preferences (bright, soft, dramatic)</li>
              <li>• Auto-branded with {siteName}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-4 text-center`}>
          <p className="text-sm opacity-70">Your generated wallpapers will appear here</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && generatedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-xs w-full">
            <button
              onClick={() => {
                setShowPreview(false);
                if (generatedImage) {
                  URL.revokeObjectURL(generatedImage);
                }
              }}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>
            
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <div className="relative">
                <img
                  src={generatedImage}
                  alt="Generated wallpaper"
                  className="w-full rounded-lg"
                  style={{ 
                    maxHeight: '400px', 
                    objectFit: 'contain',
                    aspectRatio: `${width}/${height}`
                  }}
                />
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  <Download size={14} className="inline mr-1" />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (generatedImage) {
                      URL.revokeObjectURL(generatedImage);
                    }
                    setGeneratedImage(null);
                    setShowPreview(false);
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Settings Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.modal} rounded-2xl p-4 w-full max-w-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Image Size</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className={`w-8 h-8 ${currentTheme.button} rounded-full flex items-center justify-center`}
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Preset Sizes */}
            <div className="space-y-2 mb-4">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Presets</h4>
              {presetSizes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setWidth(preset.width);
                    setHeight(preset.height);
                    setShowSizeModal(false);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-sm ${
                    width === preset.width && height === preset.height
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs opacity-70">{preset.width} × {preset.height}</div>
                </button>
              ))}
            </div>

            {/* Custom Size */}
            <div className="space-y-3">
              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Custom Size</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Width</label>
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value === '') {
                        setWidth(0);
                      } else {
                        const num = parseInt(value);
                        if (num >= 1 && num <= 8000) {
                          setWidth(num);
                        }
                      }
                    }}
                    placeholder="e.g. 1080"
                    className={`w-full p-2 ${currentTheme.input} rounded-lg text-sm`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value === '') {
                        setHeight(0);
                      } else {
                        const num = parseInt(value);
                        if (num >= 1 && num <= 8000) {
                          setHeight(num);
                        }
                      }
                    }}
                    placeholder="e.g. 1920"
                    className={`w-full p-2 ${currentTheme.input} rounded-lg text-sm`}
                  />
                </div>
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                Range: 1 - 8000 pixels
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                disabled={!width || !height || width < 1 || height < 1}
                className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
              >
                Apply Custom Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperGenerator;