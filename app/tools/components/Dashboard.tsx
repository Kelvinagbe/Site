"use client";

import React from "react";
import { StatsIcon, ClockIcon, LightningIcon, BrainIcon, DocumentIcon } from "./icons";

// Extend the Window interface for quick launch buttons
declare global {
  interface Window {
    setActiveApp?: (appId: string) => void;
  }
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <StatsIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold ml-3">Analytics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">Files converted</span>
              <span className="font-bold text-xl">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">Downloads</span>
              <span className="font-bold text-xl">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">AI Queries</span>
              <span className="font-bold text-xl">89</span>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold ml-3 text-slate-800">Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-slate-700 text-sm">PDF converted 2h ago</span>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-slate-700 text-sm">Image downloaded 1d ago</span>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-xl">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-slate-700 text-sm">AI session completed</span>
            </div>
          </div>
        </div>

        {/* Quick Launch Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-slate-100 md:col-span-2 xl:col-span-1">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <LightningIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold ml-3 text-slate-800">Quick Launch</h3>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.setActiveApp?.("ai-assistant")}
              className="w-full flex items-center p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <BrainIcon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="font-medium">AI Assistant</span>
            </button>
            <button 
              onClick={() => window.setActiveApp?.("pdf-converter")}
              className="w-full flex items-center p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <DocumentIcon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="font-medium">PDF Converter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
          <div className="text-sm text-slate-600">Uptime</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">5s</div>
          <div className="text-sm text-slate-600">Avg Response</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">1.2TB</div>
          <div className="text-sm text-slate-600">Data Processed</div>
        </div>
      </div>
    </div>
  );
}