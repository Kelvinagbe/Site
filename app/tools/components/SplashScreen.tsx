import { useState, useEffect } from 'react';

export default function CleanSplash() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [fadeIn, setFadeIn] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    setFadeIn(true);

    // Simple progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    // Simple loading text rotation
    const texts = [
      'Loading...',
      'Preparing workspace...',
      'Almost ready...'
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      setLoadingText(texts[textIndex]);
      textIndex = (textIndex + 1) % texts.length;
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  const themeClasses = {
    bg: isDark 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-slate-50 to-blue-50',
    text: isDark ? 'text-white' : 'text-slate-800',
    textSecondary: isDark ? 'text-gray-300' : 'text-slate-600',
    textTertiary: isDark ? 'text-gray-500' : 'text-slate-400',
    progressBg: isDark ? 'bg-gray-700' : 'bg-slate-200',
    progressBar: isDark ? 'bg-blue-500' : 'bg-blue-600',
    logoShadow: isDark ? 'shadow-lg shadow-gray-900/50' : 'shadow-lg'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallback = target.nextSibling as HTMLElement;
    
    // Hide the failed image
    target.style.display = 'none';
    
    // Show the fallback element
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className={`fixed inset-0 ${themeClasses.bg} flex items-center justify-center z-50 transition-colors duration-300`}>

      <div className={`text-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Logo using favicon */}
        <div className="mb-12">
          <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center ${themeClasses.logoShadow} mb-6 overflow-hidden`}>
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-16 h-16 object-contain"
              onError={handleImageError}
            />
            <div className={`w-16 h-16 ${themeClasses.progressBar} rounded-xl hidden items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <h1 className={`text-4xl font-bold ${themeClasses.text} mb-2 transition-colors duration-300`}>
            Tools Hub
          </h1>
          <p className={`${themeClasses.textSecondary} transition-colors duration-300`}>
            Your Productivity Workspace
          </p>
        </div>

        {/* Simple progress bar */}
        <div className="max-w-xs mx-auto">
          <div className={`h-1 ${themeClasses.progressBg} rounded-full overflow-hidden mb-4 transition-colors duration-300`}>
            <div 
              className={`h-full ${themeClasses.progressBar} rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className={`${themeClasses.textSecondary} text-sm mb-6 transition-colors duration-300`}>
            {loadingText}
          </p>

          {/* Simple loading dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 ${themeClasses.progressBar} rounded-full animate-bounce transition-colors duration-300`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Simple version info */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs ${themeClasses.textTertiary} transition-colors duration-300`}>
        v2.1.0
      </div>
    </div>
  );
}