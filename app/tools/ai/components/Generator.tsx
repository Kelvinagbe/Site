'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Clock, Monitor, Smartphone } from 'lucide-react';

interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  timestamp: number;
}

interface UsageData {
  userId: string;
  generations: number;
  lastResetDate: string;
  canGenerate: boolean;
  remainingGenerations: number;
  timeUntilReset: number;
  limit: number;
}

interface WallpaperGeneratorProps {
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  onImageGenerated?: (image: SavedImage) => void;
}

const Generator: React.FC<WallpaperGeneratorProps> = ({
  theme = 'dark',
  width = 1920,
  height = 1080,
  onImageGenerated = () => {}
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [usage, setUsage] = useState<UsageData>({
    userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    generations: 0,
    canGenerate: true,
    remainingGenerations: 2,
    timeUntilReset: 0,
    limit: 2,
    lastResetDate: new Date().toDateString()
  });

  const siteName = 'WallCraft';

  // Initialize usage data and reset timer
  useEffect(() => {
    const resetTimer = setInterval(() => {
      const now = new Date();
      const today = now.toDateString();

      if (usage.lastResetDate !== today) {
        setUsage(prev => ({
          ...prev,
          generations: 0,
          lastResetDate: today,
          canGenerate: true,
          remainingGenerations: 2,
          timeUntilReset: getTimeUntilReset()
        }));
      } else {
        setUsage(prev => ({
          ...prev,
          timeUntilReset: getTimeUntilReset()
        }));
      }
    }, 60000);

    return () => clearInterval(resetTimer);
  }, [usage.lastResetDate]);

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  const addWatermark = (canvas: HTMLCanvasElement, imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Add watermark with better positioning and styling
        const fontSize = Math.max(16, Math.min(canvas.width, canvas.height) / 50);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Create watermark with shadow effect
        const watermarkText = siteName;
        const textMetrics = ctx.measureText(watermarkText);
        const padding = 20;
        const x = canvas.width - textMetrics.width - padding;
        const y = canvas.height - padding;

        // Add text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(watermarkText, x + 2, y + 2);
        
        // Add main text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(watermarkText, x, y);

        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.95);
      };

      img.onerror = () => {
        // If watermark fails, just return original
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  };

  const generateImageWithAPI = async (prompt: string, width: number, height: number): Promise<string> => {
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/generate-wallpaper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width,
          height
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Convert response to blob and create URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      return imageUrl;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Enter a prompt');
      return;
    }

    if (!usage?.canGenerate) {
      setError('Generation limit reached. Please wait until tomorrow.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowPromptModal(false);
    setGenerationProgress(0);

    try {
      // Generate image using real API
      const imageUrl = await generateImageWithAPI(prompt.trim(), width, height);

      // Create canvas and add watermark
      const canvas = document.createElement('canvas');
      const watermarkedImageUrl = await addWatermark(canvas, imageUrl);

      setGeneratedImage(watermarkedImageUrl);
      setShowPreview(true);

      const newImage: SavedImage = {
        id: `img_${Date.now()}`,
        url: watermarkedImageUrl,
        prompt,
        width,
        height,
        timestamp: Date.now(),
      };

      onImageGenerated(newImage);

      // Update usage
      setUsage(prev => ({
        ...prev,
        generations: prev.generations + 1,
        remainingGenerations: prev.remainingGenerations - 1,
        canGenerate: prev.remainingGenerations > 1,
        timeUntilReset: getTimeUntilReset()
      }));

    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string, width: number, height: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${siteName}-wallpaper-${width}x${height}-${Date.now()}.jpg`;
    link.click();
  };

  const formatTimeUntilReset = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      card: 'bg-gray-800',
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
      button: 'bg-gray-800 hover:bg-gray-700',
      modal: 'bg-gray-800',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      card: 'bg-white',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      button: 'bg-gray-200 hover:bg-gray-300',
      modal: 'bg-white',
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Wallpaper Generator</h1>
          <p className="text-base md:text-lg opacity-75">Create stunning wallpapers with AI</p>
        </div>

        {/* Desktop and Mobile Layout */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Usage Display */}
            <div className={`px-4 py-2 rounded-lg text-sm inline-block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {usage.canGenerate ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  {usage.remainingGenerations} generations left
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Reset in {formatTimeUntilReset(usage.timeUntilReset)}
                </div>
              )}
            </div>

            {/* Resolution Display */}
            <div className={`rounded-2xl ${currentTheme.card} p-6`}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {width >= 1920 ? <Monitor size={20} /> : <Smartphone size={20} />}
                  <span className="font-medium">{width} × {height}</span>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-4">
                <label className="block text-sm font-medium opacity-75">
                  Describe your wallpaper
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Minimalist sunset over mountains with purple and orange gradient, serene landscape, high quality digital art..."
                  className={`w-full p-4 rounded-b-2xl rounded-t-lg ${currentTheme.input} resize-none text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  rows={4}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!usage.canGenerate || isGenerating || !prompt.trim()}
                className="w-full mt-4 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-lg"
              >
                <Sparkles className="inline mr-2" size={20} />
                {isGenerating ? 'Generating...' : usage.canGenerate ? 'Generate Wallpaper' : 'Limit Reached'}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Limit Warning */}
              {!usage.canGenerate && (
                <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                  Daily limit reached. Reset in {formatTimeUntilReset(usage.timeUntilReset)}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview Area */}
          <div className="space-y-6">
            <div className={`rounded-2xl ${currentTheme.card} p-6 min-h-[400px] flex items-center justify-center`}>
              {isGenerating ? (
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Creating Magic ✨</h3>
                  <p className="text-purple-400 text-sm mb-2">AI is generating your wallpaper...</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs opacity-60">{Math.round(generationProgress)}% complete</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full">
                  <img
                    src={generatedImage}
                    alt="Generated wallpaper"
                    className="w-full rounded-xl shadow-lg"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleDownload(generatedImage, prompt, width, height)}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Download size={16} className="inline mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-50">
                  <Sparkles size={48} className="mx-auto mb-4" />
                  <p>Your generated wallpaper will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Prompt Modal (for smaller screens) */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 md:hidden">
            <div className={`${currentTheme.modal} rounded-t-3xl w-full max-w-md transform transition-transform duration-300`}>
              <div className="p-6">
                <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-4">Describe your wallpaper</h3>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Minimalist sunset over mountains with purple and orange gradient..."
                  className={`w-full p-4 rounded-b-2xl rounded-t-lg ${currentTheme.input} resize-none text-sm border`}
                  rows={4}
                  autoFocus
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className={`flex-1 py-3 ${currentTheme.button} rounded-xl text-sm`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || !usage.canGenerate}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Preview Modal */}
        {showPreview && generatedImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full relative">
              <button
                onClick={() => { setShowPreview(false); }}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="bg-white rounded-3xl p-4 shadow-2xl">
                <img
                  src={generatedImage}
                  alt="Generated wallpaper preview"
                  className="w-full rounded-2xl"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDownload(generatedImage, prompt, width, height)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-medium"
                  >
                    <Download size={16} className="inline mr-2" />
                    Download HD
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;