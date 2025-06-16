'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Smartphone, Monitor, Tablet } from 'lucide-react';
import Generator from './components/Generator';
import WallpaperGallery from './components/WallpaperGallery';

interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  timestamp: number;
}

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const devicePresets: DevicePreset[] = [
  { name: 'Phone', width: 1080, height: 1920, icon: <Smartphone size={16} /> },
  { name: 'Desktop', width: 1920, height: 1080, icon: <Monitor size={16} /> },
  { name: 'Tablet', width: 1536, height: 2048, icon: <Tablet size={16} /> },
];

export default function HomePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');

  // Initialize data on mount (using in-memory storage)
  useEffect(() => {
    // Set default values - in a real app, you'd load from localStorage
    setSavedImages([]);
    setTheme('dark');
  }, []);

  const handleImageGenerated = (newImage: SavedImage) => {
    setSavedImages(prev => [newImage, ...prev]);
    setActiveTab('gallery');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentDevice = devicePresets[selectedDevice];

  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      card: 'bg-gray-800',
      input: 'bg-gray-700 border-gray-600 text-white',
      button: 'bg-gray-800 hover:bg-gray-700',
      modal: 'bg-gray-800',
      border: 'border-gray-700',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      card: 'bg-white',
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-gray-200 hover:bg-gray-300',
      modal: 'bg-white',
      border: 'border-gray-200',
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div>
            <h1 className="text-2xl font-bold">WallCraft</h1>
            <p className="text-sm opacity-70">AI Wallpaper Generator</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 ${currentTheme.button} rounded-xl transition-colors`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 ${currentTheme.button} rounded-xl transition-colors`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 mb-6">
          <div className={`flex ${currentTheme.card} rounded-2xl p-1`}>
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              Gallery ({savedImages.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {activeTab === 'generate' ? (
            <Generator
              theme={theme}
              width={currentDevice.width}
              height={currentDevice.height}
              onImageGenerated={handleImageGenerated}
            />
          ) : (
            <WallpaperGallery
              theme={theme}
              savedImages={savedImages}
            />
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
            <div className={`${currentTheme.modal} rounded-t-3xl w-full max-w-md transform transition-transform duration-300`}>
              <div className="p-6">
                <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-6">Settings</h3>

                {/* Device Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 opacity-70">Device Type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {devicePresets.map((device, index) => (
                      <button
                        key={device.name}
                        onClick={() => setSelectedDevice(index)}
                        className={`p-3 rounded-xl border transition-colors ${
                          selectedDevice === index
                            ? 'border-blue-500 bg-blue-500/10'
                            : `${currentTheme.border} ${currentTheme.button}`
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {device.icon}
                          <span className="text-xs font-medium">{device.name}</span>
                          <span className="text-xs opacity-50">
                            {device.width}×{device.height}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 opacity-70">Theme</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 p-3 rounded-xl border transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-500/10'
                          : `${currentTheme.border} ${currentTheme.button}`
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Moon size={16} />
                        <span className="text-sm">Dark</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 p-3 rounded-xl border transition-colors ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-500/10'
                          : `${currentTheme.border} ${currentTheme.button}`
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Sun size={16} />
                        <span className="text-sm">Light</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className={`p-4 rounded-xl ${currentTheme.card} mb-6`}>
                  <h4 className="text-sm font-medium mb-2">About WallCraft</h4>
                  <p className="text-xs opacity-70 leading-relaxed">
                    Generate beautiful AI wallpapers for your devices. Free daily limits apply.
                  </p>
                  <div className="mt-3 text-xs opacity-50">
                    <div>• 2 free generations per day</div>
                    <div>• High-quality AI artwork</div>
                    <div>• Multiple device formats</div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}