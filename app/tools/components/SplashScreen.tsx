import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    const textInterval = setInterval(() => {
      const texts = [
        'Initializing...',
        'Loading components...',
        'Syncing workspace...',
        'Preparing tools...',
        'Almost ready...'
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center z-50 overflow-hidden">
      {/* Dynamic particle background */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-gradient-to-r from-blue-300/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300/25 to-blue-400/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
      </div>

      {/* Floating geometric elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 border border-blue-400/40 transform rotate-45 animate-bounce"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Floating circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute w-4 h-4 border-2 border-indigo-300/50 rounded-full animate-pulse"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 1}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center relative z-10">
        {/* Logo section with advanced animations */}
        <div className="relative mb-16">
          <div className="relative w-40 h-40 mx-auto">
            {/* Rotating rings */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-2 border-2 border-transparent border-b-cyan-400 border-l-blue-400 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
            
            {/* Central logo with white background */}
            <div className="absolute inset-6 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-200">
              <img 
                src="./favicon.ico" 
                alt="Loading" 
                className="w-16 h-16 drop-shadow-lg"
              />
            </div>
            
            {/* Pulsing energy rings */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full animate-ping"></div>
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '4s'}}>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '6s', animationDirection: 'reverse'}}>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '5s'}}>
              <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Title with spectacular blue gradient */}
        <div className="mb-8">
          <h1 className="text-7xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
            TOOLS HUB
          </h1>
          <div className="mt-4 h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
          <div className="mt-1 h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full"></div>
        </div>

        {/* Dynamic loading section */}
        <div className="space-y-6">
          {/* Progress bar with glass effect */}
          <div className="w-80 mx-auto">
            <div className="relative h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden border border-blue-200/50 shadow-lg">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-inner"
                style={{width: `${Math.min(progress, 100)}%`}}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full"></div>
            </div>
            <div className="mt-3 text-blue-600 text-sm font-semibold">
              {Math.round(Math.min(progress, 100))}%
            </div>
          </div>

          {/* Loading text */}
          <p className="text-blue-700 text-xl font-medium">
            {loadingText}
          </p>

          {/* Animated loading dots */}
          <div className="flex items-center justify-center space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-bounce shadow-lg"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Elegant scanning lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-300 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-300 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Refined corner accents */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
    </div>
  );
}