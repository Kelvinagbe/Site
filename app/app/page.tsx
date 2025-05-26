import React, { useState } from 'react';
import { Menu, Image, FileText, Bot, Home, X, Upload, Send, Download, Sparkles } from 'lucide-react';

const App = () => {
  const [activeApp, setActiveApp] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');

  const apps = [
    { id: 'home', name: 'Dashboard', icon: Home, color: 'from-blue-500 to-purple-600' },
    { id: 'wallpaper', name: 'Wallpapers', icon: Image, color: 'from-green-500 to-teal-600' },
    { id: 'pdf-converter', name: 'PDF Converter', icon: FileText, color: 'from-orange-500 to-red-600' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Bot, color: 'from-purple-500 to-pink-600' },
  ];

  const wallpapers = [
    { id: 1, gradient: 'from-purple-400 via-pink-500 to-red-500', name: 'Sunset Gradient' },
    { id: 2, gradient: 'from-green-400 via-blue-500 to-purple-600', name: 'Ocean Breeze' },
    { id: 3, gradient: 'from-yellow-400 via-red-500 to-pink-500', name: 'Warm Glow' },
    { id: 4, gradient: 'from-indigo-500 via-purple-500 to-pink-500', name: 'Night Sky' },
    { id: 5, gradient: 'from-teal-400 to-blue-500', name: 'Cool Waters' },
    { id: 6, gradient: 'from-orange-400 to-rose-400', name: 'Peach Dream' },
    { id: 7, gradient: 'from-cyan-500 to-blue-500', name: 'Ice Crystal' },
    { id: 8, gradient: 'from-violet-600 to-indigo-600', name: 'Deep Space' }
  ];

  const renderAppContent = () => {
    switch (activeApp) {
      case 'home':
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Welcome to Astixo
              </h1>
              <p className="text-base sm:text-lg text-gray-500">Your premium productivity suite</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {apps.slice(1).map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 active:scale-95"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative p-4 sm:p-6">
                      <div className={`inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${app.color} text-white mb-3 sm:mb-4 shadow-lg`}>
                        <IconComponent size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {app.id === 'wallpaper' && 'Discover and download high-quality wallpapers'}
                        {app.id === 'pdf-converter' && 'Convert and process PDF documents with AI'}
                        {app.id === 'ai-assistant' && 'Get help with tasks using our AI assistant'}
                      </p>
                      <div className="flex items-center text-xs sm:text-sm font-medium text-gray-500 group-hover:text-gray-700">
                        Open App
                        <svg className="ml-1 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Converted 3 PDF documents</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Downloaded 5 wallpapers</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">AI assistant helped with 2 tasks</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">24</div>
                    <div className="text-xs sm:text-sm text-gray-600">Files Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-pink-600">12</div>
                    <div className="text-xs sm:text-sm text-gray-600">AI Conversations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'wallpaper':
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wallpaper Collection</h2>
              <p className="text-sm sm:text-base text-gray-600">Premium wallpapers for all your devices</p>
            </div>
            
            <div className="mb-6">
              <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">All</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap active:scale-95">Abstract</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap active:scale-95">Nature</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap active:scale-95">Minimal</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {wallpapers.map((wallpaper) => (
                <div key={wallpaper.id} className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95">
                  <div className={`aspect-[3/4] bg-gradient-to-br ${wallpaper.gradient}`}></div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                    <div className="p-3 sm:p-4 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">{wallpaper.name}</h4>
                      <button className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 active:scale-95">
                        <Download size={14} className="sm:w-4 sm:h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'pdf-converter':
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI PDF Converter</h2>
              <p className="text-sm sm:text-base text-gray-600">Convert, extract, and process PDF documents with AI</p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group active:scale-95">
                  <div className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="text-white" size={20} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Drop your PDF files here</h3>
                  <p className="text-sm text-gray-600 mb-4">Or click to browse and select files</p>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base">
                    Choose Files
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="mr-2 text-purple-600" size={18} />
                  AI-Powered Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">Smart OCR</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Extract text from scanned documents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">Format Detection</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Automatically identify document structure</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">Multi-format Export</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Convert to Word, Excel, PowerPoint</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">AI Summarization</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Generate content summaries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'ai-assistant':
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI Assistant</h2>
              <p className="text-sm sm:text-base text-gray-600">Get intelligent help with your tasks</p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[500px] sm:h-[600px] flex flex-col">
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 sm:space-x-3 max-w-xs sm:max-w-sm">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={12} />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-md">
                        <p className="text-sm sm:text-base text-gray-800">Hello! I'm your AI assistant. I can help you with document conversion, content creation, analysis, and much more. What would you like to work on today?</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm p-3 sm:p-4 max-w-xs sm:max-w-sm shadow-md">
                      <p className="text-sm sm:text-base">Hi! Can you help me convert a PDF document to Word format and summarize its content?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 sm:space-x-3 max-w-xs sm:max-w-sm">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={12} />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-md">
                        <p className="text-sm sm:text-base text-gray-800">Absolutely! I can help you with both tasks. Please upload your PDF document using the PDF Converter tool, and I'll:</p>
                        <ul className="mt-2 ml-4 space-y-1 text-sm sm:text-base text-gray-800">
                          <li>• Convert it to Word format</li>
                          <li>• Extract and analyze the content</li>
                          <li>• Provide a comprehensive summary</li>
                          <li>• Highlight key points and insights</li>
                        </ul>
                        <p className="mt-2 text-sm sm:text-base text-gray-800">Would you like me to guide you through the process?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-1 sm:space-x-2">
                    <Send size={16} />
                    <span className="hidden sm:inline text-sm sm:text-base">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="p-4 sm:p-6">App not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative w-64 sm:w-72 bg-white shadow-2xl transition-transform duration-300 flex flex-col border-r border-gray-200 z-50 h-full`}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">A</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Astixo</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {apps.map((app) => {
              const IconComponent = app.icon;
              return (
                <li key={app.id}>
                  <button
                    onClick={() => {
                      setActiveApp(app.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 sm:space-x-4 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 group active:scale-95 ${
                      activeApp === app.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      activeApp === app.id 
                        ? `bg-gradient-to-br ${app.color} text-white shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">{app.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Pro Version</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Unlock premium features</p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all active:scale-95">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 active:scale-95"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Astixo</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0">
        {renderAppContent()}
      </div>
    </div>
  );
};

export default App;