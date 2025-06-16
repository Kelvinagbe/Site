'use client';

import React, { useState } from 'react';
import { Download, X, Image } from 'lucide-react';

interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  timestamp: number;
}

interface WallpaperGalleryProps {
  theme: 'dark' | 'light';
  savedImages: SavedImage[];
}

const WallpaperGallery: React.FC<WallpaperGalleryProps> = ({
  theme,
  savedImages
}) => {
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  const siteName = typeof window !== 'undefined' ? 
    window.location.hostname.replace('www.', '').split('.')[0] || 'WallCraft' : 'WallCraft';

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

  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      card: 'bg-gray-800',
      input: 'bg-gray-700 border-gray-600 text-white',
      button: 'bg-gray-800 hover:bg-gray-700',
      modal: 'bg-gray-800',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      card: 'bg-white',
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-gray-200 hover:bg-gray-300',
      modal: 'bg-white',
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <>
      {/* Gallery Grid */}
      <div className="space-y-4">
        {savedImages.length === 0 ? (
          <div className={`rounded-2xl ${currentTheme.card} p-8 text-center`}>
            <Image size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm opacity-70">No wallpapers generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedImages.map((image) => (
              <div key={image.id} className={`rounded-2xl ${currentTheme.card} p-2`}>
                <img
                  src={image.url}
                  alt="Generated wallpaper"
                  className="w-full rounded-xl cursor-pointer"
                  style={{ aspectRatio: `${image.width}/${image.height}`, objectFit: 'cover', maxHeight: '120px' }}
                  onClick={() => setSelectedImage(image)}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs opacity-70 line-clamp-2">{image.prompt}</p>
                  <div className="flex justify-between text-xs opacity-50">
                    <span>{image.width}×{image.height}</span>
                    <span>{formatDate(image.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

            <div className="bg-white rounded-3xl p-4 shadow-2xl">
              <img
                src={selectedImage.url}
                alt="Generated wallpaper"
                className="w-full rounded-2xl"
                style={{ maxHeight: '280px', objectFit: 'cover' }}
              />

              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-700">{selectedImage.prompt}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{selectedImage.width} × {selectedImage.height}</span>
                  <span>{formatDate(selectedImage.timestamp)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleDownload(selectedImage.url, selectedImage.prompt, selectedImage.width, selectedImage.height)}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-medium"
                >
                  <Download size={14} className="inline mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WallpaperGallery;