"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useTheme } from 'next-themes';
import SplashScreen from './components/SplashScreen';
import AIA from './components/AIAssistant';
import Dashboard from './components/Dashboard';
import WallpaperApp from './components/WallpaperApp';
import PDFConverter from './components/PDFConverter';
import Settings from './components/Settings';
import { HomeIcon, BrainIcon, ImageIcon, DocumentIcon } from './components/icons';

// Loading Context
const LoadingContext = React.createContext<{
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
}>({
  isLoading: false,
  loadingText: '',
  setLoading: () => {},
});

export const useLoading = () => React.useContext(LoadingContext);

// Enhanced Loader Component
const AppLoader = ({ isVisible, text = "Loading..." }: { isVisible: boolean; text?: string }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Image 
              src="/favicon.ico" 
              alt="Loading" 
              width={32} 
              height={32}
              className="w-8 h-8 animate-spin"
            />
          </div>
          {/* Rotating border */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-2xl animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">{text}</p>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Loader for smaller operations
const MiniLoader = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`}></div>
  );
};

// Button with loading state
const LoadingButton = ({ 
  loading, 
  children, 
  onClick, 
  className = "",
  disabled = false,
  ...props 
}: {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`relative flex items-center justify-center ${className} ${
      loading || disabled ? 'opacity-70 cursor-not-allowed' : ''
    }`}
    {...props}
  >
    {loading && (
      <div className="absolute left-3">
        <MiniLoader size="sm" />
      </div>
    )}
    <span className={loading ? 'ml-6' : ''}>{children}</span>
  </button>
);

// Global window interface
declare global {
  interface Window {
    setActiveApp?: (appId: string) => void;
  }
}

// Icons
const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// App configurations
const mainApps = [
  { id: "home", name: "Dashboard", icon: HomeIcon, component: Dashboard },
  { id: "wallpaper", name: "Wallpapers", icon: ImageIcon, component: WallpaperApp },
  { id: "ai-assistant", name: "AI Assistant", icon: BrainIcon, component: AIA },
];

const menuApps = [
  { id: "pdf-converter", name: "PDF Converter", icon: DocumentIcon, component: PDFConverter },
  { id: "settings", name: "Settings", icon: SettingsIcon, component: Settings },
];

const allApps = [...mainApps, ...menuApps];

export default function ToolsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeApp, setActiveApp] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Global loading function
  const setGlobalLoading = (loading: boolean, text = "Loading...") => {
    setAppLoading(loading);
    setLoadingText(text);
  };

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthLoading(false);
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Global app setter with loading
  useEffect(() => {
    window.setActiveApp = (appId: string) => {
      setGlobalLoading(true, "Loading app...");
      setTimeout(() => {
        setActiveApp(appId);
        setGlobalLoading(false);
      }, 800); // Simulate app loading time
    };
    return () => { delete window.setActiveApp; };
  }, []);

  // Make loading function available globally
  useEffect(() => {
    (window as any).setGlobalLoading = setGlobalLoading;
    return () => { delete (window as any).setGlobalLoading; };
  }, []);

  if (authLoading) return null;
  if (isLoading && user) return <SplashScreen />;
  if (!user) return null;

  const currentApp = allApps.find(app => app.id === activeApp);
  const ActiveComponent = currentApp?.component;
  const isFullscreen = ['ai-assistant', 'wallpaper'].includes(activeApp);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Handle app switching with loading
  const handleAppSwitch = (appId: string) => {
    if (appId === activeApp) return;
    
    setGlobalLoading(true, "Switching apps...");
    setTimeout(() => {
      setActiveApp(appId);
      setGlobalLoading(false);
    }, 600);
  };

  // Handle menu item clicks with loading
  const handleMenuItemClick = (appId: string) => {
    setMenuOpen(false);
    handleAppSwitch(appId);
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading: appLoading, 
      loadingText, 
      setLoading: setGlobalLoading 
    }}>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
        
        {/* Global App Loader */}
        <AppLoader isVisible={appLoading} text={loadingText} />
        
        {/* Slide-out Menu - Fixed position, doesn't affect scrolling */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tools</h2>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Menu Items */}
              <div className="flex-1 p-4 space-y-2">
                {menuApps.map(({ id, name, icon: IconComponent }) => (
                  <LoadingButton
                    key={id}
                    loading={appLoading && activeApp === id}
                    onClick={() => handleMenuItemClick(id)}
                    className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                      activeApp === id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span className="font-medium">{name}</span>
                  </LoadingButton>
                ))}
              </div>
            </div>
          </>
        )}

      {/* Fixed Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        {/* Left: Favicon & Current App */}
        <div className="flex items-center space-x-3">
          <Image 
            src="/favicon.ico" 
            alt="Tools Hub" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentApp?.name || 'Tools Hub'}
            </h1>
          </div>
        </div>

        {/* Right: Theme Toggle, Menu, User Avatar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? 
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : 
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            }
          </button>
          
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Container - Scrollable */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        
        {/* Desktop Sidebar - Fixed, doesn't scroll */}
        <aside className="hidden sm:block fixed left-0 top-16 bottom-16 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-2">
            {allApps.map(({ id, name, icon: IconComponent }) => (
              <LoadingButton
                key={id}
                loading={appLoading && activeApp === id}
                onClick={() => handleAppSwitch(id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeApp === id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="font-medium">{name}</span>
              </LoadingButton>
            ))}
          </div>

          {/* User Info - Fixed at bottom of sidebar */}
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Scrollable Content Area */}
        <main className={`flex-1 overflow-y-auto sm:ml-64 ${isFullscreen ? '' : 'bg-gray-50 dark:bg-gray-900'} ${isFullscreen ? 'pb-0' : 'pb-16 sm:pb-0'}`}>
          <div className={isFullscreen ? 'h-full' : 'min-h-full'}>
            {ActiveComponent && <ActiveComponent />}
          </div>
        </main>
      </div>

      {/* Fixed Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex">
          {mainApps.map(({ id, name, icon: IconComponent }) => (
            <button
              key={id}
              onClick={() => handleAppSwitch(id)}
              disabled={appLoading}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors relative ${
                activeApp === id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              } ${appLoading ? 'opacity-70' : ''}`}
            >
              {appLoading && activeApp === id ? (
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <MiniLoader size="sm" />
                </div>
              ) : (
                <IconComponent className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
    </LoadingContext.Provider>
  );
}