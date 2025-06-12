"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase'; // Adjust path to your Firebase config
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeApp, setActiveApp] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthLoading(false);
        // Show splash screen only for authenticated users
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Make setActiveApp available globally for dashboard
  useEffect(() => {
    window.setActiveApp = setActiveApp;
    return () => {
      delete window.setActiveApp;
    };
  }, []);

  // Show nothing while checking auth status
  if (authLoading) {
    return null;
  }

  // Show splash screen only for authenticated users
  if (isLoading && user) {
    return <SplashScreen />;
  }

  // This component only renders for authenticated users
  if (!user) {
    return null;
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

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl`}
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
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {apps.map(({ id, name, icon: IconComponent }) => (
            <button
              key={id}
              className={`flex items-center w-full p-4 rounded-xl transition-all duration-300 ${
                activeApp === id 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              onClick={() => setActiveApp(id)}
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

        {/* User Info Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <header className="lg:hidden bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
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

            {/* User Avatar in Header */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header - Only visible on desktop */}
        <header className="hidden lg:block bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
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

            {/* User Avatar in Header */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${isAIAssistant ? '' : 'p-4 sm:p-6'} ${isAIAssistant ? '' : 'pb-20 lg:pb-6'}`}>
          <div className={isAIAssistant ? "h-full" : ""}>
            {ActiveComponent && React.createElement(ActiveComponent)}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg z-40">
          <div className="flex items-center justify-around px-2 py-2">
            {apps.map(({ id, name, icon: IconComponent }) => (
              <button
                key={id}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  activeApp === id 
                    ? "text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveApp(id)}
              >
                <div className={`w-6 h-6 mb-1 flex items-center justify-center rounded-md transition-all duration-200 ${
                  activeApp === id 
                    ? "bg-blue-100 text-blue-600" 
                    : "text-slate-500"
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium truncate max-w-full ${
                  activeApp === id ? "text-blue-600" : "text-slate-500"
                }`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}