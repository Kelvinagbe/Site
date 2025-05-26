"use client";

import React, { useState } from "react";

const apps = [
  { id: "home", name: "Dashboard", color: "from-blue-500 to-purple-600" },
  { id: "wallpaper", name: "Wallpapers", color: "from-green-500 to-teal-600" },
  { id: "pdf-converter", name: "PDF Converter", color: "from-orange-500 to-red-600" },
  { id: "ai-assistant", name: "AI Assistant", color: "from-purple-500 to-pink-600" },
];

export default function ToolsPage() {
  const [activeApp, setActiveApp] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:static md:flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Tools</h1>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            X
          </button>
        </div>
        <nav className="p-4">
          {apps.map(({ id, name, color }) => (
            <button
              key={id}
              className={`flex items-center w-full p-2 mb-2 rounded-md hover:bg-gray-700 ${
                activeApp === id ? "bg-gradient-to-r " + color : ""
              }`}
              onClick={() => {
                setActiveApp(id);
                setSidebarOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-gray-900 text-white p-4">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            ☰
          </button>
          <h2 className="text-lg font-semibold">
            {apps.find((a) => a.id === activeApp)?.name}
          </h2>
          <div style={{ width: 24 }} /> {/* placeholder for spacing */}
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">
            {apps.find((a) => a.id === activeApp)?.name}
          </h1>
          <p>Content for {activeApp} goes here.</p>
        </main>
      </div>
    </div>
  );
}