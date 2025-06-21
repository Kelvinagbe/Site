'use client';

import { useEffect, useState, useRef } from 'react';

interface GlobalLoaderProps {
  children?: React.ReactNode;
  minLoadTime?: number; // Minimum loading time in ms
  preloadDelay?: number; // Additional delay after content loads
  showOnRefresh?: boolean; // Whether to show loader on page refresh
}

export default function GlobalLoader({ 
  children, 
  minLoadTime = 800, // Reduced default time
  preloadDelay = 300, // Reduced default delay
  showOnRefresh = false 
}: GlobalLoaderProps = {}) {
  const [dots, setDots] = useState('');
  const [loadingStage, setLoadingStage] = useState('Loading');
  const [progress, setProgress] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(true);
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const hasShownRef = useRef(false);

  // Check if we should show the loader
  useEffect(() => {
    // Check if this is a page refresh/reload
    const isPageRefresh = performance.navigation?.type === 1 || 
                         performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    // Check if we've already shown the loader in this session
    const hasShownBefore = sessionStorage.getItem('loader-shown') === 'true';
    
    if (!showOnRefresh && (isPageRefresh || hasShownBefore)) {
      // Skip the loader for refreshes or if already shown
      setShouldShowLoader(false);
      setShowContent(true);
      return;
    }

    // Mark that we've shown the loader
    sessionStorage.setItem('loader-shown', 'true');
    hasShownRef.current = true;
  }, [showOnRefresh]);

  // Animated dots effect
  useEffect(() => {
    if (!shouldShowLoader) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 400);

    return () => clearInterval(interval);
  }, [shouldShowLoader]);

  // Simplified progress simulation
  useEffect(() => {
    if (!shouldShowLoader) return;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 25 + 10; // Faster progress
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval);
        setIsContentReady(true);
        return;
      }

      setProgress(currentProgress);
      
      // Update stage based on progress
      if (currentProgress < 30) {
        setLoadingStage('Loading');
      } else if (currentProgress < 70) {
        setLoadingStage('Preparing');
      } else {
        setLoadingStage('Almost ready');
      }
    }, 150); // Faster updates

    return () => clearInterval(progressInterval);
  }, [shouldShowLoader]);

  // Content loading management
  useEffect(() => {
    if (!shouldShowLoader || !isContentReady) return;

    const handleContentLoad = async () => {
      // Much shorter minimum time for better UX
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingMinTime = Math.max(0, minLoadTime - elapsedTime);

      if (remainingMinTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingMinTime));
      }

      // Quick image preload check
      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('img[src]');
        if (images.length > 0) {
          // Only wait for critical images, timeout after 1 second
          const imagePromises = Array.from(images).slice(0, 3).map(img => {
            return Promise.race([
              new Promise((resolve) => {
                if (img.complete) resolve(true);
                else {
                  img.onload = () => resolve(true);
                  img.onerror = () => resolve(true);
                }
              }),
              new Promise(resolve => setTimeout(resolve, 1000)) // 1s timeout
            ]);
          });

          await Promise.all(imagePromises);
        }
      }

      // Shorter preload delay
      await new Promise(resolve => setTimeout(resolve, preloadDelay));

      setLoadingStage('Ready');
      setTimeout(() => setShowContent(true), 100);
    };

    handleContentLoad();
  }, [shouldShowLoader, isContentReady, minLoadTime, preloadDelay]);

  // If we shouldn't show the loader, render content immediately
  if (!shouldShowLoader) {
    return children ? <>{children}</> : null;
  }

  // Standalone loader (no children)
  if (!children) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center max-w-sm mx-auto px-6">
          {/* Simplified spinner */}
          <div className="relative mb-4">
            <div className="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
          </div>
          
          {/* Simple loading text */}
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            {loadingStage}
            <span className="inline-block w-6 text-left">{dots}</span>
          </h2>

          {/* Compact progress bar */}
          <div className="w-full">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wrapper mode with children
  return (
    <>
      {/* Compact loader overlay */}
      <div 
        className={`fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50 transition-opacity duration-300 ${
          showContent ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-3 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            {loadingStage}
            <span className="inline-block w-6 text-left">{dots}</span>
          </h2>

          <div className="w-full">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className={`transition-opacity duration-300 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ visibility: showContent ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </>
  );
}