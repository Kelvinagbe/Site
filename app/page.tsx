"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 md:hidden ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                <Image src="/favicon.ico" alt="Ovrica" width={20} height={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Ovrica</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-6">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-600 hover:text-purple-600 font-medium py-2">Features</button>
            <button onClick={() => scrollToSection('tools')} className="block w-full text-left text-gray-600 hover:text-purple-600 font-medium py-2">Tools</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-600 hover:text-purple-600 font-medium py-2">Pricing</button>
            <button className="block w-full text-left text-gray-600 hover:text-purple-600 font-medium py-2">Sign In</button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
              Get Started
            </button>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-purple-100 z-30 transition-all duration-300 ${
        scrollY > 50 ? 'shadow-lg' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3 animate-pulse">
              <Image src="/favicon.ico" alt="Ovrica" width={20} height={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Ovrica</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Features</button>
            <button onClick={() => scrollToSection('tools')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Tools</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Pricing</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-purple-600 font-medium hidden sm:block transition-colors">Sign In</button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105">
              Get Started
            </button>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            AI-Powered Creative & 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient-x">
              Document Tools
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8 animate-fade-in-up animation-delay-200">
            Generate stunning images, create professional PDFs, and convert documents with AI enhancement. 
            All your creative and productivity needs in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 animate-bounce-subtle">
              Start Creating Now
            </button>
            <button className="border-2 border-purple-300 text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105">
              View All Tools
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 animate-fade-in-up">
            Powerful AI Tools Suite
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "AI Image Generator",
                description: "Create stunning artwork, illustrations, and photos from simple text descriptions using advanced AI models.",
                features: ["Multiple art styles & formats", "High-resolution outputs", "Commercial usage rights"],
                bgColor: "purple"
              },
              {
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "PDF Creator & Converter",
                description: "Transform text into beautifully formatted PDFs with AI enhancement for professional documents.",
                features: ["Text to PDF conversion", "AI-enhanced formatting", "Multiple templates"],
                bgColor: "pink"
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Smart Document Processing",
                description: "Extract, analyze, and enhance documents with AI-powered text recognition and formatting.",
                features: ["OCR & text extraction", "Format optimization", "Batch processing"],
                bgColor: "blue"
              }
            ].map((tool, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${index * 200}ms`}}>
                <div className={`w-16 h-16 bg-${tool.bgColor}-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float`}>
                  <svg className={`h-8 w-8 text-${tool.bgColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{tool.title}</h3>
                <p className="text-gray-600 text-center mb-4">{tool.description}</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 animate-fade-in-up">
            Why Choose Ovrica?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Lightning Fast", desc: "Process in seconds with optimized AI", color: "purple" },
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "99.9% Accurate", desc: "Advanced AI ensures precision", color: "pink" },
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Secure & Private", desc: "End-to-end encryption", color: "blue" },
              { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "Easy to Use", desc: "Intuitive interface for everyone", color: "green" }
            ].map((feature, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{animationDelay: `${index * 150}ms`}}>
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-subtle`}>
                  <svg className={`h-6 w-6 text-${feature.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Trusted by Creators & Professionals</h2>
          <p className="text-lg text-gray-600 mb-12 animate-fade-in-up">Join millions who enhance their workflow with AI</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "15M+", label: "Files Processed" },
              { number: "800K+", label: "Happy Users" },
              { number: "4.9/5", label: "User Rating" },
              { number: "24/7", label: "Available" }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-4xl font-bold text-purple-600 mb-2 animate-count-up">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 px-4 animate-gradient-x">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Supercharge Your Workflow?
          </h2>
          <p className="text-lg text-purple-100 mb-8 animate-fade-in-up">
            Create images, generate PDFs, and process documents with AI-powered precision. Start for free today.
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg animate-pulse-subtle">
            Get Started - It&apos;s Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                  <Image src="/favicon.ico" alt="Ovrica" width={20} height={20} />
                </div>
                <span className="text-xl font-bold">Ovrica</span>
              </div>
              <p className="text-gray-400 max-w-md">
                AI-powered tools for image generation, PDF creation, and document processing. Transform your creative and productivity workflow.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Image Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PDF Creator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Document Converter</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ovrica. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientX {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulseSubtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 3s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounceSubtle 2s ease-in-out infinite;
        }

        .animate-pulse-subtle {
          animation: pulseSubtle 2s ease-in-out infinite;
        }

        .animate-count-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}