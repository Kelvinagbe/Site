"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useTheme } from 'next-themes';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import SplashScreen from './components/SplashScreen';
import AIA from './components/AIAssistant';
import { Dashboard } from './components/Dashboard';
import WallpaperApp from './components/WallpaperApp';
import PDFConverter from './components/PDFConverter';
import Settings from './components/Settings';
import { ImageGenerator } from './components/image';
import { HomeIcon, BrainIcon, ImageIcon, DocumentIcon } from './components/icons';

// Skeleton Components
const SkeletonLoader = () => (
  <div className="animate-pulse p-4 sm:p-6">
    <div className="space-y-4 sm:space-y-6">
      <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-3">
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-16 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContentWrapper = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
  if (isLoading) return <SkeletonLoader />;
  return <>{children}</>;
};

const AppLoader = ({ isVisible, text = "Loading..." }: { isVisible: boolean; text?: string }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Image 
              src="/favicon.ico" 
              alt="Loading" 
              width={32} 
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 animate-spin"
            />
          </div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-2xl animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">{text}</p>
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

const MiniLoader = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-3 h-3 sm:w-4 sm:h-4",
    md: "w-5 h-5 sm:w-6 sm:h-6", 
    lg: "w-6 h-6 sm:w-8 sm:h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`}></div>
  );
};

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
      <div className="absolute left-2 sm:left-3">
        <MiniLoader size="sm" />
      </div>
    )}
    <span className={loading ? 'ml-4 sm:ml-6' : ''}>{children}</span>
  </button>
);

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

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6l-1.5-1.5L5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 1l2 2-2 2-2-2 2-2zM12 19l2 2-2 2-2-2 2-2zM5 21l1.5-1.5L5 18l-1.5 1.5L5 21zM19 21l1.5-1.5L19 18l-1.5 1.5L19 21z" />
  </svg>
);

// App configurations with better structure
const mainApps = [
  { id: "home", name: "Dashboard", icon: HomeIcon, component: Dashboard },
  { id: "wallpaper", name: "Wallpapers", icon: ImageIcon, component: WallpaperApp },
];

const imageApps = [
  { id: "image-generator", name: "Image Generator", icon: SparkleIcon, component: ImageGenerator },
];

const toolApps = [
  { id: "ai-assistant", name: "AI Assistant", icon: BrainIcon, component: AIA },
  { id: "pdf-converter", name: "PDF Converter", icon: DocumentIcon, component: PDFConverter },
];

const allApps = [...mainApps, ...imageApps, ...toolApps, 
  { id: "settings", name: "Settings", icon: SettingsIcon, component: Settings }
];

// Improved Sidebar Section Component
const SidebarSection = ({ 
  title, 
  apps, 
  activeApp, 
  isContentLoading, 
  onAppSwitch,
  isExpanded = true,
  onToggle,
  isCollapsible = false
}: {
  title: string;
  apps: any[];
  activeApp: string;
  isContentLoading: boolean;
  onAppSwitch: (id: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  isCollapsible?: boolean;
}) => (
  <div className="mb-4">
    {/* Section Header */}
    {isCollapsible && onToggle ? (
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    ) : (
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </div>
    )}

    {/* Section Content */}
    <div className={`transition-all duration-300 ease-in-out ${
      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
    }`}>
      <div className="space-y-1">
        {apps.map(({ id, name, icon: IconComponent }) => (
          <LoadingButton
            key={id}
            loading={isContentLoading && activeApp === id}
            onClick={() => onAppSwitch(id)}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
              activeApp === id 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 flex-shrink-0 transition-colors ${
              activeApp === id 
                ? 'bg-blue-100 dark:bg-blue-800/50' 
                : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
            }`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="font-medium truncate">{name}</span>
          </LoadingButton>
        ))}
      </div>
    </div>
  </div>
);

// Main Tools Component
function ToolsPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeApp, setActiveApp] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { 
    isAppLoading, 
    isContentLoading, 
    loadingText,
    setAppLoading, 
    setContentLoading 
  } = useLoading();

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthLoading(false);
        const splashShown = sessionStorage.getItem('splashShown');
        if (!splashShown) {
          setIsLoading(true);
          sessionStorage.setItem('splashShown', 'true');
          const timer = setTimeout(() => setIsLoading(false), 2500);
          return () => clearTimeout(timer);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    window.setActiveApp = (appId: string) => {
      setContentLoading(true);
      setTimeout(() => {
        setActiveApp(appId);
        setContentLoading(false);
      }, 800);
    };
    return () => { delete window.setActiveApp; };
  }, [setContentLoading]);

  useEffect(() => {
    (window as any).setGlobalLoading = setAppLoading;
    return () => { delete (window as any).setGlobalLoading; };
  }, [setAppLoading]);

  if (authLoading) return null;
  if (isLoading && user) return <SplashScreen />;
  if (!user) return null;

  const currentApp = allApps.find(app => app.id === activeApp);
  const ActiveComponent = currentApp?.component;
  const isFullscreen = ['ai-assistant', 'wallpaper', 'image-generator'].includes(activeApp);

  const handleAppSwitch = (appId: string) => {
    if (appId === activeApp) return;
    setContentLoading(true);
    setTimeout(() => {
      setActiveApp(appId);
      setContentLoading(false);
    }, 600);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    handleAppSwitch('settings');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <AppLoader isVisible={isAppLoading} text={loadingText} />

      {/* Slide-out Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {/* Main Section */}
              <SidebarSection
                title="Main"
                apps={mainApps}
                activeApp={activeApp}
                isContentLoading={isContentLoading}
                onAppSwitch={handleAppSwitch}
              />

              {/* Image Section */}
              <SidebarSection
                title="Images"
                apps={imageApps}
                activeApp={activeApp}
                isContentLoading={isContentLoading}
                onAppSwitch={handleAppSwitch}
                isExpanded={imageExpanded}
                onToggle={() => setImageExpanded(!imageExpanded)}
                isCollapsible={true}
              />

              {/* Tools Section */}
              <SidebarSection
                title="Tools"
                apps={toolApps}
                activeApp={activeApp}
                isContentLoading={isContentLoading}
                onAppSwitch={handleAppSwitch}
                isExpanded={toolsExpanded}
                onToggle={() => setToolsExpanded(!toolsExpanded)}
                isCollapsible={true}
              />

              {/* Settings Section */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <LoadingButton
                  loading={isContentLoading && activeApp === 'settings'}
                  onClick={() => handleAppSwitch('settings')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                    activeApp === 'settings'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 flex-shrink-0 transition-colors ${
                    activeApp === 'settings'
                      ? 'bg-blue-100 dark:bg-blue-800/50' 
                      : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                  }`}>
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium truncate">Settings</span>
                </LoadingButton>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fixed Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Image 
            src="/favicon.ico" 
            alt="Tools Hub" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentApp?.name || 'Tools Hub'}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleProfileClick}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-sm font-medium text-white">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 pb-20">
            {/* Main Apps */}
            <SidebarSection
              title="Main"
              apps={mainApps}
              activeApp={activeApp}
              isContentLoading={isContentLoading}
              onAppSwitch={handleAppSwitch}
            />

            {/* Images Section */}
            <SidebarSection
              title="Images"
              apps={imageApps}
              activeApp={activeApp}
              isContentLoading={isContentLoading}
              onAppSwitch={handleAppSwitch}
              isExpanded={imageExpanded}
              onToggle={() => setImageExpanded(!imageExpanded)}
              isCollapsible={true}
            />

            {/* Tools Section */}
            <SidebarSection
              title="Tools"
              apps={toolApps}
              activeApp={activeApp}
              isContentLoading={isContentLoading}
              onAppSwitch={handleAppSwitch}
              isExpanded={toolsExpanded}
              onToggle={() => setToolsExpanded(!toolsExpanded)}
              isCollapsible={true}
            />

            {/* Settings Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <LoadingButton
                loading={isContentLoading && activeApp === 'settings'}
                onClick={() => handleAppSwitch('settings')}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group ${
                  activeApp === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 flex-shrink-0 transition-colors ${
                  activeApp === 'settings'
                    ? 'bg-blue-100 dark:bg-blue-800/50' 
                    : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                }`}>
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <span className="font-medium truncate">Settings</span>
              </LoadingButton>
            </div>
          </div>

          
          {/* User Profile Section - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
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
        <main className={`flex-1 overflow-y-auto sm:ml-64 ${isFullscreen ? '' : 'bg-gray-50 dark:bg-gray-900'} ${isFullscreen ? 'pb-0' : 'pb-16 sm:pb-0'}`}>
          <div className={isFullscreen ? 'h-full' : 'min-h-full'}>
            <ContentWrapper isLoading={isContentLoading}>
              {ActiveComponent && <ActiveComponent />}
            </ContentWrapper>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Main apps + Menu */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <div className="flex">
          {mainApps.map(({ id, name, icon: IconComponent }) => (
            <button
              key={id}
              onClick={() => handleAppSwitch(id)}
              disabled={isContentLoading}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors relative ${
                activeApp === id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              } ${isContentLoading ? 'opacity-70' : ''}`}
            >
              {isContentLoading && activeApp === id ? (
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  <MiniLoader size="sm" />
                </div>
              ) : (
                <IconComponent className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 flex flex-col items-center py-2 px-1 transition-colors text-gray-500 dark:text-gray-400"
          >
            <MenuIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <LoadingProvider>
      <ToolsPageContent />
    </LoadingProvider>
  );
}