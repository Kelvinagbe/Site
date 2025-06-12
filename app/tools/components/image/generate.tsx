'use client';

import { useState } from 'react';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "cozy coffee shop with warm lighting",
    "majestic dragon flying over mountains",
    "abstract geometric pattern in blue and gold",
    "cute robot in a flower garden",
    "futuristic city skyline at sunset",
    "magical forest with glowing mushrooms"
  ];

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
        setGeneratedImage({
          url: data.imageUrl,
          prompt: prompt,
          timestamp: Date.now(),
        });
        setError(null);
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
      if (generatedImage.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = generatedImage.url;
        link.download = `ai-image-${generatedImage.timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-image-${generatedImage.timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🎨 AI Image Generator
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Turn your ideas into stunning images with AI
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <div>
              <label htmlFor="prompt" className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                ✨ Describe your image:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., a magical forest with glowing mushrooms under starlight..."
                className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-3 focus:ring-purple-300 focus:border-purple-400 transition-all duration-200 text-gray-700 text-sm sm:text-base lg:text-lg resize-none shadow-sm"
                rows={3}
                disabled={loading}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                <small className="text-gray-500">
                  <span className="hidden sm:inline">Press Enter to generate, Shift+Enter for new line</span>
                  <span className="sm:hidden">Tap Generate to create</span>
                </small>
                <small className="text-gray-500">
                  {prompt.length}/500
                </small>
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs sm:text-base">Generating... (30-60s)</span>
                </span>
              ) : (
                'Generate Image ✨'
              )}
            </button>
          </div>

          {/* Example Prompts */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-700 flex items-center">
              💡 Try these ideas:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg transition-all duration-200 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 transform hover:scale-[1.02] active:scale-95"
                  disabled={loading}
                >
                  <span className="text-xs sm:text-sm font-medium">{example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-lg sm:text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                  {error.includes('Model is loading') && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      The AI model is starting up. Please wait a minute and try again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="relative inline-block group w-full max-w-lg mx-auto">
                  <img
                    src={generatedImage.url}
                    alt={generatedImage.prompt}
                    className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    onError={() => setError('Failed to load generated image')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl sm:rounded-2xl transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={downloadImage}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <span>📥</span>
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage(null);
                    setError(null);
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl hover:bg-gray-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <span>🗑️</span>
                  <span>Clear</span>
                </button>
              </div>

              <div className="text-center bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <p className="text-gray-600 italic text-sm sm:text-base lg:text-lg">
                  {`"${generatedImage.prompt}"`}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">
                  Generated on {new Date(generatedImage.timestamp).toLocaleDateString()} at {new Date(generatedImage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
            <p>🔥 Powered by Hugging Face • 1000 free generations per month</p>
          </div>
        </div>
      </div>
    </div>
  );
}