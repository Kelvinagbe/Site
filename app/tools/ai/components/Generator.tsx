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
  const [retryAttempt, setRetryAttempt] = useState(0);
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
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += Math.random() * 10;
      if (progressValue > 85) progressValue = 85;
      setGenerationProgress(progressValue);
    }, 800);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

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
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        // Handle specific error cases with user-friendly messages
        if (response.status === 503) {
          throw new Error('AI model is loading. Please wait 30 seconds and try again.');
        } else if (response.status === 401) {
          throw new Error('API authentication failed. Please check your setup.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (errorMessage.includes('endpoint is in error')) {
          throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
        }
        
        throw new Error(errorMessage);
      }

      // Convert response to blob and create URL
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Received empty image. Please try again.');
      }
      
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;

    } catch (error) {
      clearInterval(progressInterval);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
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
    setRetryAttempt(0);

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
      let errorMessage = 'Failed to generate image. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
    handleGenerate();
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
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-2 md:p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Mobile-optimized Layout */}
        <div className="space-y-4 md:space-y-6">
          {/* Usage Display - Mobile Optimized */}
          <div className="flex justify-center">
            <div className={`px-3 py-2 rounded-lg text-xs md:text-sm inline-block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {usage.canGenerate ? (
                <span className="flex items-center gap-1 md:gap-2">
                  <Sparkles size={14} className="md:w-4 md:h-4" />
                  {usage.remainingGenerations} generations left
                </span>
              ) : (
                <div className="flex items-center gap-1 md:gap-2">
                  <Clock size={14} className="md:w-4 md:h-4" />
                  Reset in {formatTimeUntilReset(usage.timeUntilReset)}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Single Column on Mobile */}
          <div className="space-y-4">
            {/* Resolution Display - Compact */}
            <div className={`rounded-xl md:rounded-2xl ${currentTheme.card} p-4 md:p-6`}>
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
                <div className="flex items-center gap-1 md:gap-2">
                  {width >= 1920 ? <Monitor size={16} className="md:w-5 md:h-5" /> : <Smartphone size={16} className="md:w-5 md:h-5" />}
                  <span className="font-medium text-sm md:text-base">{width} × {height}</span>
                </div>
              </div>

              {/* Generate Button - Mobile Optimized */}
              <button
                onClick={() => setShowPromptModal(true)}
                disabled={!usage.canGenerate}
                className="w-full py-4 md:py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-base md:text-xl"
              >
                <Sparkles className="inline mr-2 md:mr-3" size={20} />
                {usage.canGenerate ? 'Generate Wallpaper' : 'Limit Reached'}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 md:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs md:text-sm">
                  {error}
                  {retryAttempt < 2 && error.includes('temporarily unavailable') && (
                    <button
                      onClick={handleRetry}
                      className="ml-2 text-red-300 underline hover:text-red-200"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Limit Warning */}
              {!usage.canGenerate && (
                <div className="mt-4 p-3 md:p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs md:text-sm">
                  Daily limit reached. Reset in {formatTimeUntilReset(usage.timeUntilReset)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Modal - Mobile Optimized */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className={`${currentTheme.modal} rounded-2xl md:rounded-3xl w-full max-w-sm md:max-w-md transform transition-all duration-300 scale-100`}>
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base md:text-lg font-semibold">Describe your wallpaper</h3>
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-500/20 hover:bg-gray-500/30 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Minimalist sunset over mountains with purple and orange gradient..."
                  className={`w-full p-3 md:p-4 rounded-xl ${currentTheme.input} resize-none text-xs md:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  rows={3}
                  autoFocus
                />

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !usage.canGenerate || isGenerating}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs md:text-sm font-medium"
                >
                  {isGenerating ? 'Generating...' : 'Generate Wallpaper'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal - Mobile Optimized */}
        {generatedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className={`${currentTheme.modal} rounded-2xl md:rounded-3xl w-full max-w-sm md:max-w-md transform transition-all duration-300 scale-100`}>
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base md:text-lg font-semibold">Your Wallpaper</h3>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="w-8 h-8 rounded-full bg-gray-500/20 hover:bg-gray-500/30 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                <img
                  src={generatedImage}
                  alt="Generated wallpaper"
                  className="w-full rounded-xl md:rounded-2xl shadow-lg mb-4"
                  style={{ maxHeight: '250px', objectFit: 'cover' }}
                />

                <button
                  onClick={() => handleDownload(generatedImage, prompt, width, height)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs md:text-sm font-medium transition-colors"
                >
                  <Download size={14} className="inline mr-2 md:w-4 md:h-4" />
                  Download Wallpaper
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Modal - Mobile Optimized */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="text-center text-white px-4">
              <div className="relative mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Creating Magic ✨</h3>
              <p className="text-purple-400 text-xs md:text-sm mb-2">AI is generating your wallpaper...</p>
              <div className="w-48 md:w-64 bg-gray-700 rounded-full h-2 mb-2 mx-auto">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs opacity-60">{Math.round(generationProgress)}% complete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;