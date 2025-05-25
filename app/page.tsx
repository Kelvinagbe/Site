// app/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';

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

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <Image 
                  src="/favicon.ico" 
                  alt="Apexion" 
                  width={32}
                  height={32}
                  className="mr-3 animate-spin"
                  style={{ animationDuration: '3s' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center mr-3 hidden animate-spin" style={{ animationDuration: '3s' }}>
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Apexion</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
        <div className={`fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center">
              <Image 
                src="/favicon.ico" 
                alt="Apexion" 
                width={32}
                height={32}
                className="mr-3 animate-spin"
                style={{ animationDuration: '3s' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center mr-3 hidden animate-spin" style={{ animationDuration: '3s' }}>
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Apexion</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-6">
            <div className="space-y-4">
              <a href="#features" className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Features</a>
              <a href="#pricing" className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Pricing</a>
              <a href="#about" className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>About</a>
              <a href="#contact" className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={toggleSidebar}>Contact</a>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button className="w-full text-left text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors">
                Sign In
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform PDFs with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Intelligence
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed">
              Experience the future of document processing. Convert, analyze, and extract data from PDFs 
              with unprecedented accuracy using advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                Start Converting Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:bg-gray-50">
                Watch Demo
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Process up to 10MB files</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% secure & private</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Why Choose Apexion?
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-600">
                Our AI-powered platform delivers unmatched accuracy and speed for all your PDF processing needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Process documents in seconds, not minutes. Our optimized AI algorithms deliver results 10x faster than traditional methods.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">99.9% Accurate</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Advanced OCR and machine learning ensure perfect text recognition, even from scanned or low-quality documents.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bank-Level Security</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Your documents are encrypted end-to-end and automatically deleted after processing. Zero data retention policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses and individuals who rely on Apexion for their document processing needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">5M+</div>
                <div className="text-gray-600 text-lg">Documents Processed</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">250K+</div>
                <div className="text-gray-600 text-lg">Happy Users</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600 text-lg">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600 text-lg">Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your PDFs?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start processing your documents with AI-powered precision. No setup required, instant results.
            </p>
            <button className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Now - It&apos;s Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Image 
                  src="/favicon.ico" 
                  alt="Apexion" 
                  width={32}
                  height={32}
                  className="mr-3 animate-spin"
                  style={{ animationDuration: '3s' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center mr-3 hidden animate-spin" style={{ animationDuration: '3s' }}>
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="text-xl font-bold">Apexion</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Transform your documents with AI-powered intelligence. Fast, accurate, and secure PDF processing for the modern world.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Apexion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
