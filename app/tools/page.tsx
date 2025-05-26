"use client";

import React, { useState, useEffect } from "react";
import SplashScreen from './components/SplashScreen';
import AIA from './components/AIAssistant';
import Dashboard from './components/Dashboard';
import WallpaperApp from './components/WallpaperApp';
import PDFConverter from './components/PDFConverter';
import { HomeIcon, BrainIcon, ImageIcon, DocumentIcon, LightningIcon } from './components/icons';

// Extend the Window interface
declare global {
  interface Window {
    setActiveApp?: (appId: string) => void;
  }
}

// App configuration
const apps = [
  { id: "home", name: "Dashboard", icon: HomeIcon, component: Dashboard },
  { id: "wallpaper", name: "Wallpapers", icon: ImageIcon, component: WallpaperApp },
  { id: "pdf-converter", name: "PDF Converter", icon: DocumentIcon, component: PDFConverter },
  { id: "ai-assistant", name: "AI Assistant", icon: BrainIcon, component: AIA },
];

export default function ToolsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeApp, setActiveApp] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Make setActiveApp available globally for dashboard
  useEffect(() => {
    window.setActiveApp = setActiveApp;
    return () => {
      delete window.setActiveApp;
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const currentApp = apps.find(app => app.id === activeApp);
  const ActiveComponent = currentApp?.component;
  const isAIAssistant = activeApp === "ai-assistant";

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <LightningIcon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold">Tools Hub</h1>
              <p className="text-slate-400 text-xs">Professional Suite</p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {apps.map(({ id, name, icon: IconComponent }) => (
            <button
              key={id}
              className={`flex items-center w-full p-4 rounded-xl transition-all duration-300 ${
                activeApp === id 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              onClick={() => {
                setActiveApp(id);
                setSidebarOpen(false);
              }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                activeApp === id 
                  ? "bg-white bg-opacity-20" 
                  : "bg-slate-600"
              }`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden text-slate-600 hover:text-slate-900 mr-3 p-2 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  {currentApp && React.createElement(currentApp.icon, { className: "w-5 h-5 text-white" })}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {currentApp?.name || "Dashboard"}
                  </h2>
                  <p className="text-slate-500 text-xs">Professional Tools</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${isAIAssistant ? '' : 'p-4 sm:p-6'}`}>
          <div className={isAIAssistant ? "h-full" : ""}>
            {ActiveComponent && React.createElement(ActiveComponent)}
          </div>
        </main>
      </div>
    </div>
  );
}