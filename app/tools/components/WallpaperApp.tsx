'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Wand2, Settings, ImageIcon } from 'lucide-react';

interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  timestamp: number;
}

const WallpaperApp = () => {
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
  const [usage, setUsage] = useState<{
    generations: number;
    canGenerate: boolean;
    remainingGenerations: number;
    timeUntilReset: number;
    limit: number;
  } | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  // Auto-detect site name
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

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', detectTheme);
    };
  }, []);

  // Initialize user ID and check usage
  useEffect(() => {
    const initializeUser = () => {
      let currentUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(currentUserId);
      checkUsage(currentUserId);
    };

    initializeUser();
  }, []);

  const checkUsage = async (uid: string) => {
    if (!uid) return;

    setIsCheckingUsage(true);
    try {
      const response = await fetch('/api/check-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: uid }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsage({
            generations: data.usage.generations,
            canGenerate: data.canGenerate,
            remainingGenerations: data.remainingGenerations,
            timeUntilReset: data.timeUntilReset,
            limit: data.limit,
          });
        }
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const updateUsage = async () => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/update-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await checkUsage(userId);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const saveImageToGallery = (imageUrl: string, prompt: string, width: number, height: number) => {
    const newImage: SavedImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: imageUrl,
      prompt,
      width,
      height,
      timestamp: Date.now(),
    };

    setSavedImages(prev => [newImage, ...prev]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Enter a prompt');
      return;
    }

    if (!usage?.canGenerate) {
      if (usage?.timeUntilReset && usage.timeUntilReset > 0) {
        setError(`Generation limit reached. Try again in ${formatTime(usage.timeUntilReset)}`);
      } else {
        setError('Generation limit reached. Please try again later.');
      }
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const usageUpdated = await updateUsage();
      if (!usageUpdated) {
        throw new Error('Failed to update usage count');
      }

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

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      setGeneratedImage(imageUrl);
      setShowPreview(true);
      saveImageToGallery(imageUrl, prompt, width, height);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      if (userId) {
        await checkUsage(userId);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string, width: number, height: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${siteName}-wallpaper-${width}x${height}-${Date.now()}.jpg`;
    link.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex gap-2">
          {savedImages.length > 0 && (
            <div className={`px-2 py-1 rounded-lg text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
              {savedImages.length} saved
            </div>
          )}
          <button
            onClick={() => setShowSizeModal(true)}
            className={`p-2 rounded-lg ${currentTheme.button}`}
          >
            <Settings size={18} />
          </button>
        </div>
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
          <ImageIcon size={16} className="inline mr-2" />
          Gallery ({savedImages.length})
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

            {/* Usage Information */}
            {usage && (
              <div className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">
                    Generations: {usage.generations}/{usage.limit}
                  </span>
                  <span className="opacity-70">
                    Remaining: {usage.remainingGenerations}
                  </span>
                </div>
                {usage.remainingGenerations === 0 && usage.timeUntilReset > 0 && (
                  <div className="mt-1 text-xs text-orange-500">
                    Reset in: {formatTime(usage.timeUntilReset)}
                  </div>
                )}
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your wallpaper..."
              className={`w-full p-3 rounded-lg border ${currentTheme.input} resize-none text-sm`}
              rows={3}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !usage?.canGenerate || isCheckingUsage}
              className="w-full mt-3 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {isGenerating ? 'Creating...' : 
               isCheckingUsage ? 'Checking limits...' :
               !usage?.canGenerate ? 'Limit reached' : 'Generate'}
            </button>

            {error && (
              <div className={`mt-3 p-2 ${currentTheme.error} border rounded-lg text-xs`}>
                {error}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-4`}>
            <h3 className="font-medium mb-2 text-sm">Tips & Limits</h3>
            <ul className="text-xs space-y-1 opacity-70">
              <li>• Be specific about colors and mood</li>
              <li>• Mention artistic styles (e.g., minimalist, abstract)</li>
              <li>• Include lighting preferences (bright, soft, dramatic)</li>
              <li>• Limit: 2 generations per hour</li>
              <li>• Auto-branded with {siteName}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          {savedImages.length === 0 ? (
            <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-8 text-center`}>
              <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm opacity-70 mb-2">No wallpapers generated yet</p>
              <p className="text-xs opacity-50">Generated images will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedImages.map((image) => (
                <div key={image.id} className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.card} p-2`}>
                  <img
                    src={image.url}
                    alt="Generated wallpaper"
                    className="w-full rounded-lg cursor-pointer"
                    style={{ 
                      aspectRatio: `${image.width}/${image.height}`,
                      objectFit: 'cover',
                      maxHeight: '120px'
                    }}
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs opacity-70 line-clamp-2">{image.prompt}</p>
                    <div className="flex justify-between items-center text-xs opacity-50">
                      <span>{image.width}×{image.height}</span>
                      <span>{formatDate(image.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && generatedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-xs w-full">
            <button
              onClick={() => {
                setShowPreview(false);
                setGeneratedImage(null);
              }}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>

            <div className="bg-white rounded-2xl p-3 shadow-2xl">
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

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDownload(generatedImage, prompt, width, height)}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  <Download size={14} className="inline mr-1" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setGeneratedImage(null);
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-xs w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>

            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <img
                src={selectedImage.url}
                alt="Generated wallpaper"
                className="w-full rounded-lg"
                style={{ 
                  maxHeight: '400px', 
                  objectFit: 'contain',
                  aspectRatio: `${selectedImage.width}/${selectedImage.height}`
                }}
              />

              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-700">{selectedImage.prompt}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{selectedImage.width} × {selectedImage.height}</span>
                  <span>{formatDate(selectedImage.timestamp)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDownload(selectedImage.url, selectedImage.prompt, selectedImage.width, selectedImage.height)}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  <Download size={14} className="inline mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Close
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

export default WallpaperApp;