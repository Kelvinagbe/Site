'use client';

import { useState } from 'react';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  transactionId?: string;
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatermarking, setIsWatermarking] = useState(false);

  // Your website details - replace with actual values
  const websiteName = "AICreator"; // Replace with your website name
  const faviconUrl = "/favicon.ico"; // Replace with your favicon path

  const examplePrompts = [
    "cozy coffee shop with warm lighting",
    "majestic dragon flying over mountains", 
    "abstract geometric pattern in blue and gold",
    "cute robot in a flower garden",
    "futuristic city skyline at sunset",
    "magical forest with glowing mushrooms"
  ];

  // Firebase transaction logging function
  const logToFirebase = async (imageData: GeneratedImage) => {
    try {
      const transactionData = {
        prompt: imageData.prompt,
        timestamp: imageData.timestamp,
        userId: 'anonymous', // Replace with actual user ID if you have authentication
        imageUrl: imageData.url,
        status: 'completed',
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: null // This would need to be set server-side
      };

      // Replace with your Firebase endpoint
      const response = await fetch('/api/log-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const result = await response.json();
        return result.transactionId;
      }
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
    return null;
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setIsWatermarking(true);
        
        // Add watermark to the generated image
        let watermarkedImageUrl = data.imageUrl;
        
        try {
          watermarkedImageUrl = await addWatermarkToImage(data.imageUrl);
        } catch (error) {
          console.error('Failed to add watermark to generated image:', error);
          // Continue with original image if watermarking fails
        }

        const imageData: GeneratedImage = {
          url: watermarkedImageUrl,
          prompt: prompt,
          timestamp: Date.now(),
        };

        // Log transaction to Firebase
        const transactionId = await logToFirebase(imageData);
        if (transactionId) {
          imageData.transactionId = transactionId;
        }

        setGeneratedImage(imageData);
        setError(null);
        setIsWatermarking(false);
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

  // Function to add watermark to image
  const addWatermarkToImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx!.drawImage(img, 0, 0);
        
        // Configure watermark styling
        const fontSize = Math.max(16, Math.min(img.width / 25, img.height / 25));
        ctx!.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx!.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx!.lineWidth = 2;
        ctx!.textAlign = 'right';
        ctx!.textBaseline = 'bottom';
        
        // Position watermark at bottom right
        const padding = fontSize * 0.5;
        const x = img.width - padding;
        const y = img.height - padding;
        
        // Draw text with stroke (outline) and fill
        const watermarkText = websiteName;
        ctx!.strokeText(watermarkText, x, y);
        ctx!.fillText(watermarkText, x, y);
        
        // Add favicon if available
        const favicon = new Image();
        favicon.crossOrigin = 'anonymous';
        favicon.onload = () => {
          const faviconSize = fontSize * 1.2;
          ctx!.drawImage(
            favicon, 
            x - ctx!.measureText(watermarkText).width - faviconSize - (padding * 0.5), 
            y - faviconSize + (padding * 0.2), 
            faviconSize, 
            faviconSize
          );
          resolve(canvas.toDataURL('image/png'));
        };
        favicon.onerror = () => {
          // If favicon fails to load, just resolve with text watermark
          resolve(canvas.toDataURL('image/png'));
        };
        favicon.src = faviconUrl;
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      let imageUrl = generatedImage.url;
      
      // Add watermark to the image before downloading
      try {
        imageUrl = await addWatermarkToImage(generatedImage.url);
      } catch (error) {
        console.error('Failed to add watermark:', error);
        // Continue with original image if watermarking fails
      }

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${websiteName.toLowerCase()}-ai-image-${generatedImage.timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            🎨 AI Image Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Turn your ideas into stunning images with AI
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - Input Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 h-fit">
            
            {/* Input Section */}
            <div className="space-y-6 mb-6">
              <div>
                <label htmlFor="prompt" className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  ✨ Describe your image:
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., a magical forest with glowing mushrooms under starlight..."
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-3 focus:ring-purple-300 dark:focus:ring-purple-500 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-200 text-base resize-none shadow-sm"
                  rows={4}
                  disabled={loading}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <small className="text-gray-500 dark:text-gray-400">
                    Press Enter to generate, Shift+Enter for new line
                  </small>
                  <small className="text-gray-500 dark:text-gray-400">
                    {prompt.length}/500
                  </small>
                </div>
              </div>

              <button
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-500 dark:via-blue-500 dark:to-indigo-500 text-white py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:via-blue-600 dark:hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-95 shadow-lg"
              >
                {(loading || isWatermarking) ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {loading ? 'Generating... (30-60s)' : 'Adding watermark...'}
                  </span>
                ) : (
                  'Generate Image ✨'
                )}
              </button>
            </div>

            {/* Example Prompts */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
                💡 Try these ideas:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-800/50 dark:hover:to-blue-800/50 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 border border-gray-200 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-500 transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    <span className="text-sm font-medium">{example}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 rounded-lg">
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

          {/* Right Column - Generated Image */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            {generatedImage ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block group w-full">
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="w-full h-auto max-h-96 object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105 border border-gray-200/50 dark:border-gray-700/50"
                      onError={() => setError('Failed to load generated image')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
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
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-gray-600 dark:bg-gray-500 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <span>🗑️</span>
                    <span>Clear</span>
                  </button>
                </div>

                <div className="text-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 p-4 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-300 italic text-base">
                    {`"${generatedImage.prompt}"`}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    Generated on {new Date(generatedImage.timestamp).toLocaleDateString()} at {new Date(generatedImage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  {generatedImage.transactionId && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Transaction ID: {generatedImage.transactionId}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Your generated image will appear here
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Enter a prompt and click generate to start
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with your branding */}
        <div className="mt-12 text-center">
          <div className="flex flex-col items-center space-y-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <img 
                src={faviconUrl} 
                alt={`${websiteName} Logo`}
                className="w-8 h-8 opacity-80"
                onError={(e) => {
                  // Fallback to a default icon if favicon fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                {websiteName}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              🔥 Powered by Hugging Face • 1000 free generations per month
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