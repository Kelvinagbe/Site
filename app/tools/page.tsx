"use client";

import React, { useState } from "react";
import AIA from './components/AIAssistant';

// Individual app components
const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
        <p className="text-gray-600">Files converted: 127</p>
        <p className="text-gray-600">Wallpapers downloaded: 45</p>
        <p className="text-gray-600">AI queries: 89</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <ul className="text-gray-600 space-y-1">
          <li>• PDF converted 2 hours ago</li>
          <li>• Wallpaper downloaded yesterday</li>
          <li>• AI chat session completed</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
        <p className="text-gray-600 mb-3">Jump to your favorite tools:</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.setActiveApp("ai-assistant")}
            className="block w-full text-left px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            AI Assistant
          </button>
          <button 
            onClick={() => window.setActiveApp("pdf-converter")}
            className="block w-full text-left px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
          >
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full capitalize ${
              selectedCategory === category 
                ? "bg-green-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500"></div>
            <div className="p-3">
              <p className="text-sm text-gray-600">{selectedCategory} {i}</p>
              <button className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PDFConverter = () => {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleConvert = () => {
    setConverting(true);
    // Simulate conversion
    setTimeout(() => {
      setConverting(false);
      alert("File converted successfully!");
    }, 2000);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Upload File</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".doc,.docx,.txt,.jpg,.png"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-gray-500">
              <p className="text-lg mb-2">Click to upload file</p>
              <p className="text-sm">Supports: DOC, DOCX, TXT, JPG, PNG</p>
            </div>
          </label>
          {file && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
      </div>
      
      {file && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Convert to PDF</h3>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {converting ? "Converting..." : "Convert to PDF"}
          </button>
        </div>
      )}
    </div>
  );
};

const AIAssistant = () => {
  return <AIA />;
};

const apps = [
  { id: "home", name: "Dashboard", color: "from-blue-500 to-purple-600", component: Dashboard },
  { id: "wallpaper", name: "Wallpapers", color: "from-green-500 to-teal-600", component: WallpaperApp },
  { id: "pdf-converter", name: "PDF Converter", color: "from-orange-500 to-red-600", component: PDFConverter },
  { id: "ai-assistant", name: "AI Assistant", color: "from-purple-500 to-pink-600", component: AIAssistant },
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

  const ActiveComponent = apps.find(app => app.id === activeApp)?.component;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:static md:flex-shrink-0 z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Tools</h1>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className="p-4">
          {apps.map(({ id, name, color }) => (
            <button
              key={id}
              className={`flex items-center w-full p-3 mb-2 rounded-md hover:bg-gray-700 transition-colors ${
                activeApp === id ? "bg-gradient-to-r " + color + " text-white" : "text-gray-300"
              }`}
              onClick={() => {
                setActiveApp(id);
                setSidebarOpen(false);
              }}
            >
              <span className="font-medium">{name}</span>
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
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-gray-900 text-white p-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            aria-label="Open sidebar"
            className="text-xl"
          >
            ☰
          </button>
          <h2 className="text-lg font-semibold">
            {apps.find((a) => a.id === activeApp)?.name}
          </h2>
          <div style={{ width: 24 }} />
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {apps.find((a) => a.id === activeApp)?.name}
          </h1>
          
          {ActiveComponent && <ActiveComponent />}
        </main>
      </div>
    </div>
  );
}