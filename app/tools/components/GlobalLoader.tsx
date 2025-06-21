'use client';

import { useEffect, useState, useRef } from 'react';

interface GlobalLoaderProps {
  children?: React.ReactNode;
  minLoadTime?: number;
  preloadDelay?: number;
  showOnRefresh?: boolean;
}

export default function GlobalLoader({ 
  children, 
  minLoadTime = 800,
  preloadDelay = 300,
  showOnRefresh = false 
}: GlobalLoaderProps = {}) {
  const [progress, setProgress] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(true);
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if we should show the loader
  useEffect(() => {
    const isPageRefresh = performance.navigation?.type === 1 || 
                         performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const hasShownBefore = sessionStorage.getItem('loader-shown') === 'true';
    
    if (!showOnRefresh && (isPageRefresh || hasShownBefore)) {
      setShouldShowLoader(false);
      setShowContent(true);
      return;
    }

    sessionStorage.setItem('loader-shown', 'true');
  }, [showOnRefresh]);

  // Simple progress simulation
  useEffect(() => {
    if (!shouldShowLoader) return;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 20 + 10;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval);
        setIsContentReady(true);
        return;
      }

      setProgress(currentProgress);
    }, 100);

    return () => clearInterval(progressInterval);
  }, [shouldShowLoader]);

  // Content loading management
  useEffect(() => {
    if (!shouldShowLoader || !isContentReady) return;

    const handleContentLoad = async () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingMinTime = Math.max(0, minLoadTime - elapsedTime);

      if (remainingMinTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingMinTime));
      }

      // Quick image preload
      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('img[src]');
        if (images.length > 0) {
          const imagePromises = Array.from(images).slice(0, 3).map(img => {
            return Promise.race([
              new Promise((resolve) => {
                if (img.complete) resolve(true);
                else {
                  img.onload = () => resolve(true);
                  img.onerror = () => resolve(true);
                }
              }),
              new Promise(resolve => setTimeout(resolve, 1000))
            ]);
          });

          await Promise.all(imagePromises);
        }
      }

      await new Promise(resolve => setTimeout(resolve, preloadDelay));
      setTimeout(() => setShowContent(true), 50);
    };

    handleContentLoad();
  }, [shouldShowLoader, isContentReady, minLoadTime, preloadDelay]);

  // Skip loader if not needed
  if (!shouldShowLoader) {
    return children ? <>{children}</> : null;
  }

  // Standalone loader
  if (!children) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Large Wave Animation - Centered */}
          <div className="flex space-x-3 items-end justify-center">
            <div 
              className="w-4 h-16 bg-blue-500 dark:bg-blue-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '0ms'
              }}
            ></div>
            <div 
              className="w-4 h-16 bg-purple-500 dark:bg-purple-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '150ms'
              }}
            ></div>
            <div 
              className="w-4 h-16 bg-pink-500 dark:bg-pink-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '300ms'
              }}
            ></div>
          </div>
        </div>

        {/* Wave Animation Keyframes */}
        <style jsx>{`
          @keyframes wave {
            0%, 80%, 100% {
              transform: scaleY(0.3);
              opacity: 0.5;
            }
            40% {
              transform: scaleY(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // Wrapper mode
  return (
    <>
      {/* Clean loader overlay */}
      <div 
        className={`fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50 transition-opacity duration-300 ${
          showContent ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="text-center">
          {/* Large Wave Animation - Centered */}
          <div className="flex space-x-3 items-end justify-center">
            <div 
              className="w-4 h-16 bg-blue-500 dark:bg-blue-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '0ms'
              }}
            ></div>
            <div 
              className="w-4 h-16 bg-purple-500 dark:bg-purple-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '150ms'
              }}
            ></div>
            <div 
              className="w-4 h-16 bg-pink-500 dark:bg-pink-400 rounded-full"
              style={{ 
                animation: 'wave 1.2s infinite ease-in-out',
                animationDelay: '300ms'
              }}
            ></div>
          </div>
        </div>

        {/* Wave Animation Keyframes */}
        <style jsx>{`
          @keyframes wave {
            0%, 80%, 100% {
              transform: scaleY(0.3);
              opacity: 0.5;
            }
            40% {
              transform: scaleY(1);
              opacity: 1;
            }
          }
        `}</style>
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