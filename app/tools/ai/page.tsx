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
  { name: 'Phone', width: 719, height: 1611, icon: <Smartphone size={16} /> },
  { name: 'Desktop', width: 1920, height: 1080, icon: <Monitor size={16} /> },
  { name: 'Tablet', width: 1536, height: 2048, icon: <Tablet size={16} /> },
];

export default function HomePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [useCustomSize, setUseCustomSize] = useState(false);

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

  const currentDevice = useCustomSize 
    ? { name: 'Custom', width: customWidth, height: customHeight, icon: <Settings size={16} /> }
    : devicePresets[selectedDevice];

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
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
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
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">WallCraft</h1>
              <p className="text-lg opacity-70 mt-1">AI Wallpaper Generator</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleTheme}
                className={`p-3 ${currentTheme.button} rounded-xl transition-colors`}
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`p-3 ${currentTheme.button} rounded-xl transition-colors`}
              >
                <Settings size={24} />
              </button>
            </div>
          </div>

          {/* Desktop Content - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generator Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold">Generate</h2>
              </div>
              <Generator
                theme={theme}
                width={currentDevice.width}
                height={currentDevice.height}
                onImageGenerated={handleImageGenerated}
              />
            </div>

            {/* Gallery Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold">Gallery ({savedImages.length})</h2>
              </div>
              <WallpaperGallery
                theme={theme}
                savedImages={savedImages}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.modal} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300`}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 ${currentTheme.button} rounded-xl transition-colors`}
                >
                  ×
                </button>
              </div>

              {/* Device Selection */}
              <div className="mb-8">
                <h4 className="text-base lg:text-lg font-medium mb-4 opacity-70">Device Type</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {devicePresets.map((device, index) => (
                    <button
                      key={device.name}
                      onClick={() => {
                        setSelectedDevice(index);
                        setUseCustomSize(false);
                      }}
                      className={`p-4 lg:p-6 rounded-xl border transition-colors ${
                        selectedDevice === index && !useCustomSize
                          ? 'border-blue-500 bg-blue-500/10'
                          : `${currentTheme.border} ${currentTheme.button}`
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        {device.icon}
                        <span className="text-sm lg:text-base font-medium">{device.name}</span>
                        <span className="text-xs lg:text-sm opacity-50">
                          {device.width}×{device.height}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setUseCustomSize(true)}
                  className={`w-full p-4 rounded-xl border transition-colors ${
                    useCustomSize
                      ? 'border-blue-500 bg-blue-500/10'
                      : `${currentTheme.border} ${currentTheme.button}`
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Settings size={18} />
                    <span className="text-sm lg:text-base font-medium">Custom Size</span>
                  </div>
                </button>

                {useCustomSize && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-70">Width</label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 1920))}
                        className={`w-full p-3 rounded-lg ${currentTheme.input} text-sm border`}
                        min="1"
                        max="4096"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-70">Height</label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 1080))}
                        className={`w-full p-3 rounded-lg ${currentTheme.input} text-sm border`}
                        min="1"
                        max="4096"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* App Info */}
              <div className={`p-6 rounded-xl ${currentTheme.card} mb-6`}>
                <h4 className="text-base lg:text-lg font-medium mb-3">About WallCraft</h4>
                <p className="text-sm opacity-70 leading-relaxed mb-4">
                  Generate beautiful AI wallpapers for your devices. Free daily limits apply.
                </p>
                <div className="text-sm opacity-50 space-y-1">
                  <div>• 2 free generations per day</div>
                  <div>• High-quality AI artwork</div>
                  <div>• Multiple device formats</div>
                  <div>• Custom size support</div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-base font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}