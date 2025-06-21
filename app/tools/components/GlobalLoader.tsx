'use client';

import { useEffect, useState, useRef } from 'react';

interface GlobalLoaderProps {
  children?: React.ReactNode;
  minLoadTime?: number; // Minimum loading time in ms
  preloadDelay?: number; // Additional delay after content loads
}

export default function GlobalLoader({ 
  children, 
  minLoadTime = 1500, 
  preloadDelay = 800 
}: GlobalLoaderProps = {}) {
  const [dots, setDots] = useState('');
  const [loadingStage, setLoadingStage] = useState('Initializing');
  const [progress, setProgress] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Progress and loading stages simulation
  useEffect(() => {
    const stages = [
      { text: 'Initializing', duration: 300 },
      { text: 'Loading resources', duration: 400 },
      { text: 'Preparing content', duration: 500 },
      { text: 'Optimizing layout', duration: 400 },
      { text: 'Finalizing', duration: 300 }
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5; // Random increment between 5-20
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval);
        
        // Mark content as ready after progress completes
        setTimeout(() => {
          setIsContentReady(true);
        }, 200);
        return;
      }

      setProgress(currentProgress);

      // Update loading stage based on progress
      const targetStage = Math.floor((currentProgress / 100) * stages.length);
      if (targetStage > stageIndex && targetStage < stages.length) {
        stageIndex = targetStage;
        setLoadingStage(stages[stageIndex].text);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Content preloading and visibility management
  useEffect(() => {
    if (!isContentReady) return;

    const handleContentLoad = async () => {
      // Ensure minimum loading time has passed
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingMinTime = Math.max(0, minLoadTime - elapsedTime);

      // Wait for minimum loading time
      if (remainingMinTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingMinTime));
      }

      // Preload images and other resources
      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true); // Continue even if image fails
            }
          });
        });

        // Wait for all images to load
        await Promise.all(imagePromises);
      }

      // Additional preload delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, preloadDelay));

      // Final stage update
      setLoadingStage('Ready');
      setProgress(100);

      // Small delay before showing content
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    };

    handleContentLoad();
  }, [isContentReady, minLoadTime, preloadDelay]);

  // If we're just using this as a standalone loader (no children)
  if (!children) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-blue-300 opacity-50"></div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {loadingStage}
              <span className="inline-block w-8 text-left">{dots}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Preparing your tools and optimizing performance
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-full">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading tips */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>💡 Tip: All content is being preloaded for optimal performance</p>
          </div>
        </div>
      </div>
    );
  }

  // Wrapper mode with children
  return (
    <>
      {/* Loader overlay */}
      <div 
        className={`fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50 transition-opacity duration-500 ${
          showContent ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="text-center max-w-md mx-auto px-6">
          {/* Same loader content as above */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-blue-300 opacity-50"></div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {loadingStage}
              <span className="inline-block w-8 text-left">{dots}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Preparing your tools and optimizing performance
            </p>
          </div>

          <div className="mt-6 w-full">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>💡 Tip: All content is being preloaded for optimal performance</p>
          </div>
        </div>
      </div>

      {/* Hidden content for preloading */}
      <div 
        ref={contentRef}
        className={`transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ visibility: showContent ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </>
  );
}