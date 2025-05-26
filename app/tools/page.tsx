"use client";

import React, { useState } from "react";
import AIA from './components/AIAssistant';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    setActiveApp?: (appId: string) => void;
  }
}

// Modern Icon Components
const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ImageIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BrainIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const StatsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightningIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const UploadIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const DownloadIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Individual app components
const Dashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <StatsIcon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold ml-4">Analytics</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Files converted</span>
            <span className="font-bold text-2xl">127</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Downloads</span>
            <span className="font-bold text-2xl">45</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-100">AI Queries</span>
            <span className="font-bold text-2xl">89</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold ml-4 text-slate-800">Activity</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-xl">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
            <span className="text-slate-700">PDF converted 2h ago</span>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-xl">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
            <span className="text-slate-700">Image downloaded 1d ago</span>
          </div>
          <div className="flex items-center p-3 bg-purple-50 rounded-xl">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
            <span className="text-slate-700">AI session completed</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <LightningIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold ml-4 text-slate-800">Quick Launch</h3>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => window.setActiveApp?.("ai-assistant")}
            className="w-full flex items-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BrainIcon className="w-5 h-5 mr-3" />
            AI Assistant
          </button>
          <button 
            onClick={() => window.setActiveApp?.("pdf-converter")}
            className="w-full flex items-center p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <DocumentIcon className="w-5 h-5 mr-3" />
            PDF Converter
          </button>
        </div>
      </div>
    </div>
  </div>
);

const WallpaperApp = () => {
  const [selectedCategory, setSelectedCategory] = useState("nature");
  const categories = ["nature", "abstract", "technology", "minimal"];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-8 py-4 rounded-2xl capitalize font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category 
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl" 
                : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 shadow-lg hover:shadow-xl"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 transform hover:-translate-y-2">
            <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4 capitalize font-medium">{selectedCategory} #{i}</p>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download HD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PDFConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setConverted(false);
    setDownloadUrl(null);
  };

  const handleConvert = () => {
    if (!file) return;
    
    setConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setConverting(false);
      setConverted(true);
      
      // Create a dummy PDF blob for download
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Converted: ${file.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000208 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
304
%%EOF`;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }, 3000);
  };

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.split('.')[0]}_converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <UploadIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold ml-4 text-slate-800">Upload Document</h3>
        </div>
        
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".doc,.docx,.txt,.jpg,.png"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
              <UploadIcon className="w-8 h-8" />
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-2">Drop files here or click to browse</p>
            <p className="text-slate-500">Supports: DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
          </label>
          
          {file && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-center">
                <DocumentIcon className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {file && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold ml-4 text-slate-800">Convert to PDF</h3>
          </div>
          
          {!converted ? (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="w-full flex items-center justify-center px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
            >
              {converting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Converting...
                </>
              ) : (
                <>
                  <DocumentIcon className="w-6 h-6 mr-3" />
                  Convert to PDF
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-xl font-semibold text-green-600 mb-6">Conversion Complete!</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                <DownloadIcon className="w-5 h-5 mr-3" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIAssistant = () => {
  return <AIA />;
};

// Type definition for app components
type AppComponent = React.ComponentType;

interface AppConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: AppComponent;
}

const apps: AppConfig[] = [
  { id: "home", name: "Dashboard", icon: HomeIcon, component: Dashboard },
  { id: "wallpaper", name: "Wallpapers", icon: ImageIcon, component: WallpaperApp },
  { id: "pdf-converter", name: "PDF Converter", icon: DocumentIcon, component: PDFConverter },
  { id: "ai-assistant", name: "AI Assistant", icon: BrainIcon, component: AIAssistant },
];

export default function ToolsPage() {
  const [activeApp, setActiveApp] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Make setActiveApp available globally for dashboard quick access buttons
  React.useEffect(() => {
    window.setActiveApp = setActiveApp;
    return () => {
      delete window.setActiveApp;
    };
  }, []);

  const currentApp = apps.find(app => app.id === activeApp);
  const ActiveComponent = currentApp?.component;
  const isAIAssistant = activeApp === "ai-assistant";

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Favicon */}
      <link rel="icon" href="../favicon.ico" />
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:static md:flex-shrink-0 z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LightningIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">Tools Hub</h1>
              <p className="text-slate-400 text-sm">Professional Suite</p>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-6">
          {apps.map(({ id, name, icon: IconComponent }) => (
            <button
              key={id}
              className={`flex items-center w-full p-5 mb-4 rounded-2xl transition-all duration-300 group ${
                activeApp === id 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              onClick={() => {
                setActiveApp(id);
                setSidebarOpen(false);
              }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                activeApp === id 
                  ? "bg-white bg-opacity-20" 
                  : "bg-slate-600 group-hover:bg-slate-500"
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg">{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Always visible */}
        <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)} 
                aria-label="Open sidebar"
                className="md:hidden text-slate-600 hover:text-slate-900 mr-4 transition-colors duration-200"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  {currentApp && React.createElement(currentApp.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {currentApp?.name || "Dashboard"}
                  </h2>
                  <p className="text-slate-500 text-sm">Professional Tools</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className={`flex-1 overflow-auto ${isAIAssistant ? 'p-8' : 'p-10'}`}>
          {isAIAssistant ? (
            <div className="h-full">
              {ActiveComponent && React.createElement(ActiveComponent)}
            </div>
          ) : (
            <div>
              {ActiveComponent && React.createElement(ActiveComponent)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}