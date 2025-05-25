
"use client";

import { useState, useEffect } from 'react';

// Simple SVG icon components
const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Cookie = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h.01M15 10h.01M10 16s2 2 4 0" />
  </svg>
);

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = document.cookie.split(';').some((item) => item.trim().startsWith('cookies-accepted='));
    if (!cookiesAccepted) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowCookieBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const acceptCookies = () => {
    // Set cookie with 1 year expiration
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `cookies-accepted=true; expires=${date.toUTCString()}; path=/`;
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    // Set cookie with 30 days expiration for decline
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `cookies-declined=true; expires=${date.toUTCString()}; path=/`;
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center ml-1 lg:ml-0">
                <img 
                  src="/favicon.ico" 
                  alt="Apexion" 
                  className="w-7 h-7 sm:w-8 sm:h-8 mr-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center mr-3 hidden">
                  <span className="text-white text-sm sm:text-base font-bold">A</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">Apexion</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm hidden sm:block">
                Sign In
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
        <div className={`fixed left-0 top-0 bottom-0 w-64 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center">
              <img 
                src="/favicon.ico" 
                alt="Apexion" 
                className="w-8 h-8 sm:w-9 sm:h-9 mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center mr-3 hidden">
                <span className="text-white text-base sm:text-lg font-bold">A</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Apexion</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="p-4 sm:p-6">
            <div className="space-y-3">
              <a href="#features" className="block text-base font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Features</a>
              <a href="#pricing" className="block text-base font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Pricing</a>
              <a href="#about" className="block text-base font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>About</a>
              <a href="#contact" className="block text-base font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Contact</a>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button className="w-full text-left text-gray-600 hover:text-gray-900 font-medium mb-3 text-sm transition-colors">
                Sign In
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Cookie Consent Banner */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-in-out ${
        showCookieBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  <Cookie className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline font-medium">
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={declineCookies}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Decline
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-12 sm:pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Transform PDFs with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Intelligence
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-2">
              Experience the future of document processing. Convert, analyze, and extract data from PDFs 
              with unprecedented accuracy using advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <button className="group w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                Start Converting Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 hover:bg-gray-50">
                Watch Demo
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>Process up to 10MB files</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>100% secure & private</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                Why Choose Apexion?
              </h2>
              <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 px-4">
                Our AI-powered platform delivers unmatched accuracy and speed for all your PDF processing needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Lightning Fast</h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Process documents in seconds, not minutes. Our optimized AI algorithms deliver results 10x faster than traditional methods.
                </p>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">99.9% Accurate</h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Advanced OCR and machine learning ensure perfect text recognition, even from scanned or low-quality documents.
                </p>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Bank-Level Security</h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Your documents are encrypted end-to-end and automatically deleted after processing. Zero data retention policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Join thousands of businesses and individuals who rely on Apexion for their document processing needs.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">5M+</div>
                <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Documents Processed</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">250K+</div>
                <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Happy Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">99.9%</div>
                <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">24/7</div>
                <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-3 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your PDFs?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Start processing your documents with AI-powered precision. No setup required, instant results.
            </p>
                <button className="bg-white hover:bg-gray-50 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Now - It's Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-base sm:text-lg font-bold">A</span>
                </div>
                <span className="text-lg sm:text-xl font-bold">Apexion</span>
              </div>
              <p className="text-gray-400 max-w-md text-sm sm:text-base">
                Transform your documents with AI-powered intelligence. Fast, accurate, and secure PDF processing for the modern world.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 Apexion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
      }
