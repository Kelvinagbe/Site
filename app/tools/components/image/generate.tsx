'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  transactionId?: string;
}

interface UserUsage {
  userId: string;
  generations: number;
  lastReset: number;
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'result'>('generate');
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);

  const websiteName = typeof window !== 'undefined' ? 
    window.location.hostname.split('.')[0].charAt(0).toUpperCase() + 
    window.location.hostname.split('.')[0].slice(1) : 'AICreator';

  const examplePrompts = [
    "cozy coffee shop with warm lighting",
    "majestic dragon flying over mountains", 
    "abstract geometric pattern in blue and gold",
    "cute robot in a flower garden",
    "futuristic city skyline at sunset",
    "magical forest with glowing mushrooms"
  ];

  // Auth and usage management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) checkUserUsage(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const checkUserUsage = async (userId: string) => {
    try {
      const response = await fetch('/api/check-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) setUserUsage(data.usage);
    } catch (error) {
      console.error('Failed to check usage:', error);
    }
  };

  const hasReachedLimit = () => {
    if (!userUsage) return false;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - userUsage.lastReset <= oneHour && userUsage.generations >= 2;
  };

  const getRemainingTime = () => {
    if (!userUsage) return 0;
    const oneHour = 60 * 60 * 1000;
    const remaining = oneHour - (Date.now() - userUsage.lastReset);
    return Math.max(0, remaining);
  };

  const formatRemainingTime = (ms: number) => {
    const minutes = Math.ceil(ms / (60 * 1000));
    return minutes >= 60 ? '1 hour' : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // Image generation and processing
  const addWatermark = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);

        const fontSize = Math.max(16, Math.min(img.width / 25, img.height / 25));
        ctx!.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx!.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx!.lineWidth = 2;
        ctx!.textAlign = 'right';
        ctx!.textBaseline = 'bottom';

        const padding = fontSize * 0.5;
        const x = img.width - padding;
        const y = img.height - padding;

        ctx!.strokeText(websiteName, x, y);
        ctx!.fillText(websiteName, x, y);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const generateImage = async () => {
    if (!currentUser) {
      setError('Please log in to generate images');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (hasReachedLimit()) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), userId: currentUser.uid }),
      });

      const data = await response.json();

      if (data.success) {
        let watermarkedUrl = data.imageUrl;
        try {
          watermarkedUrl = await addWatermark(data.imageUrl);
        } catch (error) {
          console.error('Watermark failed:', error);
        }

        const imageData: GeneratedImage = {
          url: watermarkedUrl,
          prompt,
          timestamp: Date.now(),
        };

        // Store transaction
        try {
          const transactionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await fetch('/api/store-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              transactionId,
              transaction: { prompt, timestamp: imageData.timestamp, status: 'completed' }
            }),
          });
          imageData.transactionId = transactionId;
        } catch (error) {
          console.error('Transaction storage failed:', error);
        }

        // Update usage
        try {
          const usageResponse = await fetch('/api/update-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.uid }),
          });
          const usageData = await usageResponse.json();
          if (usageData.success) setUserUsage(usageData.usage);
        } catch (error) {
          console.error('Usage update failed:', error);
        }

        setGeneratedImage(imageData);
        setActiveTab('result');
        setShowModal(true);
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    try {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `${websiteName.toLowerCase()}-ai-image-${generatedImage.timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 max-w-md">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            AI Image Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please log in to start generating amazing AI images
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Log In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              🎨 AI Image Generator
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {currentUser.displayName || currentUser.email}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Turn your ideas into stunning images with AI
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              ✨ Generate
            </button>
            <button
              onClick={() => setActiveTab('result')}
              disabled={!generatedImage}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'result' && generatedImage
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : generatedImage 
                    ? 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              🖼️ Result
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'generate' && (
            <div className="space-y-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">
                    ✨ Describe your image
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !loading) {
                        e.preventDefault();
                        generateImage();
                      }
                    }}
                    placeholder="e.g., a magical forest with glowing mushrooms under starlight..."
                    className="w-full px-6 py-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:ring-3 focus:ring-purple-300/50 dark:focus:ring-purple-500/50 focus:border-purple-400/50 dark:focus:border-purple-500/50 transition-all duration-300 text-lg resize-none shadow-lg hover:shadow-xl"
                    rows={4}
                    disabled={loading}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-3 text-sm">
                    <small className="text-gray-500 dark:text-gray-400">
                      Press Enter to generate, Shift+Enter for new line
                    </small>
                    <small className="text-gray-500 dark:text-gray-400">
                      {prompt.length}/500
                    </small>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <button
                    onClick={generateImage}
                    disabled={loading || !prompt.trim() || hasReachedLimit()}
                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-500 dark:via-blue-500 dark:to-indigo-500 text-white py-4 px-12 rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:via-blue-600 dark:hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating... (30-60s)
                      </span>
                    ) : hasReachedLimit() ? (
                      'Limit Reached 🚫'
                    ) : (
                      'Generate Image ✨'
                    )}
                  </button>

                  {/* Usage Counter */}
                  {userUsage && (
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 dark:border-gray-700/20">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          🎨 {userUsage.generations}/2 images this hour
                        </span>
                        {userUsage.generations >= 2 && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Reset in {formatRemainingTime(getRemainingTime())}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Example Prompts */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                  💡 Try these ideas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 border border-white/20 dark:border-gray-700/20 hover:border-purple-200/50 dark:hover:border-purple-500/50 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      disabled={loading}
                    >
                      <span className="font-medium">{example}</span>
                    </button>
                  ))}
                </div>
              </div>

{/* Error Display */}
              {error && (
                <div className="max-w-2xl mx-auto p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border-l-4 border-red-400 dark:border-red-500 rounded-xl shadow-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 dark:text-red-300 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                      {error.includes('Model is loading') && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          The AI model is starting up. Please wait a minute and try again.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'result' && generatedImage && (
            <div className="text-center">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 max-w-2xl mx-auto">
                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full h-auto max-h-96 object-contain rounded-xl shadow-lg mb-6"
                  onError={() => setError('Failed to load generated image')}
                />

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                  <button
                    onClick={downloadImage}
                    className="w-full sm:w-auto px-8 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <span>📥</span>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedImage(null);
                      setError(null);
                      setActiveTab('generate');
                      setShowModal(false);
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-gray-600 dark:bg-gray-500 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <span>🔄</span>
                    <span>Generate New</span>
                  </button>
                </div>

                <div className="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 p-4 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-300 italic text-base mb-2">
                    &quot;{generatedImage.prompt}&quot;
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Generated on {new Date(generatedImage.timestamp).toLocaleDateString()} at {new Date(generatedImage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  {generatedImage.transactionId && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      ID: {generatedImage.transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showModal && generatedImage && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                    🎉 Image Generated!
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>

                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full h-auto max-h-64 object-contain rounded-xl shadow-lg mb-4"
                />

                <p className="text-gray-600 dark:text-gray-300 italic text-center mb-4">
                  &quot;{generatedImage.prompt}&quot;
                </p>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      downloadImage();
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>📥</span>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>👀</span>
                    <span>View Full</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Limit Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">⏱️</div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  Generation Limit Reached
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You&apos;ve reached your limit of 2 images per hour.
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-6">
                  <p className="text-orange-700 dark:text-orange-300 font-medium">
                    ⏳ Come back in {formatRemainingTime(getRemainingTime())}
                  </p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                    Your limit will reset automatically
                  </p>
                </div>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Got it, thanks! 👍
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex flex-col items-center space-y-4 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/30 dark:border-gray-700/30 max-w-md mx-auto">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              {websiteName}
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              🔥 Powered by AI • Generate unlimited images
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              © 2025 {websiteName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}