"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useTheme } from 'next-themes';

// Import your components
import SplashScreen from './components/SplashScreen';
import AIA from './components/AIAssistant';
import { Dashboard } from './components/Dashboard';
import WallpaperApp from './components/WallpaperApp';
import PDFConverter from './components/PDFConverter';
import Settings from './components/Settings';
import { ImageGenerator } from './components/image';
import { HomeIcon, BrainIcon, ImageIcon, DocumentIcon } from './components/icons';
import NotificationBell from './components/notification/NotificationBell';

// Simplified Icons
const icons = {
  Menu: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Settings: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>,
  Close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  Sparkle: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6l-1.5-1.5L5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 1l2 2-2 2-2-2 2-2zM12 19l2 2-2 2-2-2 2-2zM5 21l1.5-1.5L5 18l-1.5 1.5L5 21zM19 21l1.5-1.5L19 18l-1.5 1.5L19 21z" /></svg>
};

// App Configuration
const apps = {
  main: [
    { id: "home", name: "Dashboard", icon: HomeIcon, component: Dashboard },
    { id: "wallpaper", name: "Wallpapers", icon: ImageIcon, component: WallpaperApp },
  ],
  images: [
    { id: "image-generator", name: "Image Generator", icon: icons.Sparkle, component: ImageGenerator },
  ],
  tools: [
    { id: "ai-assistant", name: "AI Assistant", icon: BrainIcon, component: AIA },
    { id: "pdf-converter", name: "PDF Converter", icon: DocumentIcon, component: PDFConverter },
  ],
  settings: { id: "settings", name: "Settings", icon: icons.Settings, component: Settings }
};

// Get all apps as flat array
const allApps = [...apps.main, ...apps.images, ...apps.tools, apps.settings];

// Simplified Loading Components
const Loader = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return <div className={`${sizes[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin ${className}`} />;
};

const SkeletonLoader = () => (
  <div className="animate-pulse p-6 space-y-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const AppLoader = ({ isVisible, text = "Loading..." }: { isVisible: boolean, text?: string }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Image src="/favicon.ico" alt="Loading" width={32} height={32} className="animate-spin" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">{text}</p>
      </div>
    </div>
  );
};

// Simplified Sidebar Section
const SidebarSection = ({ title, apps, activeApp, onAppSwitch, isExpanded, onToggle }: any) => (
  <div className="mb-6">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300"
    >
      <span>{title}</span>
      <icons.ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
    
    <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
      <div className="space-y-2 px-2">
        {apps.map(({ id, name, icon: IconComponent }: any) => (
          <button
            key={id}
            onClick={() => onAppSwitch(id)}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors text-sm font-medium ${
              activeApp === id 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <IconComponent className="w-5 h-5 mr-3" />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// Custom hooks for state management
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return unsubscribe;
  }, [router]);

  return { user, loading };
};

const useAppState = () => {
  const [activeApp, setActiveApp] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    images: true,
    tools: true
  });

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');
      setTimeout(() => setShowSplash(false), 2500);
    }
  }, []);

  const handleAppSwitch = (appId: string) => {
    if (appId === activeApp) return;
    setLoading(true);
    setTimeout(() => {
      setActiveApp(appId);
      setLoading(false);
    }, 600);
    setMenuOpen(false);
  };

  const toggleSection = (section: 'images' | 'tools') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return {
    activeApp,
    menuOpen,
    loading,
    showSplash,
    expandedSections,
    setMenuOpen,
    handleAppSwitch,
    toggleSection
  };
};

// Main Component
export default function ToolsPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeApp, menuOpen, loading, showSplash, expandedSections, setMenuOpen, handleAppSwitch, toggleSection } = useAppState();

  if (authLoading) return null;
  if (showSplash) return <SplashScreen />;
  if (!user) return null;

  const currentApp = allApps.find(app => app.id === activeApp);
  const ActiveComponent = currentApp?.component;
  const isFullscreen = ['ai-assistant', 'wallpaper', 'image-generator'].includes(activeApp);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <AppLoader isVisible={loading} />

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col sm:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <icons.Close className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <SidebarSection title="Images" apps={apps.images} activeApp={activeApp} onAppSwitch={handleAppSwitch} isExpanded={expandedSections.images} onToggle={() => toggleSection('images')} />
              <SidebarSection title="Tools" apps={apps.tools} activeApp={activeApp} onAppSwitch={handleAppSwitch} isExpanded={expandedSections.tools} onToggle={() => toggleSection('tools')} />
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleAppSwitch('settings')}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium ${
                    activeApp === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <icons.Settings className="w-5 h-5 mr-3" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Image src="/favicon.ico" alt="Tools Hub" width={24} height={24} />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentApp?.name || 'Tools Hub'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:hidden"
          >
            <icons.Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleAppSwitch('settings')}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-sm font-medium text-white">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 pb-20">
            <SidebarSection title="Images" apps={apps.images} activeApp={activeApp} onAppSwitch={handleAppSwitch} isExpanded={expandedSections.images} onToggle={() => toggleSection('images')} />
            <SidebarSection title="Tools" apps={apps.tools} activeApp={activeApp} onAppSwitch={handleAppSwitch} isExpanded={expandedSections.tools} onToggle={() => toggleSection('tools')} />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleAppSwitch('settings')}
                className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium ${
                  activeApp === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <icons.Settings className="w-5 h-5 mr-3" />
                Settings
              </button>
            </div>
          </div>
          
          {/* User Profile - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
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

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto sm:ml-64 ${isFullscreen ? '' : 'bg-gray-50 dark:bg-gray-900'} ${activeApp !== 'ai-assistant' ? 'pb-16 sm:pb-0' : ''}`}>
          <div className={isFullscreen ? 'h-full' : 'min-h-full'}>
            {loading ? <SkeletonLoader /> : ActiveComponent && <ActiveComponent />}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      {activeApp !== 'ai-assistant' && (
        <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex">
            {apps.main.map(({ id, name, icon: IconComponent }) => (
              <button
                key={id}
                onClick={() => handleAppSwitch(id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                  activeApp === id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{name}</span>
              </button>
            ))}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex-1 flex flex-col items-center py-2 px-1 transition-colors text-gray-500 dark:text-gray-400"
            >
              <icons.Menu className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Menu</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}