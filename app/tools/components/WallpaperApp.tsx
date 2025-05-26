"use client";

import React, { useState } from "react";
import { DownloadIcon } from "./icons";

export default function WallpaperApp() {
  const [selectedCategory, setSelectedCategory] = useState("nature");
  const categories = ["nature", "abstract", "technology", "minimal"];

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-xl capitalize font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category 
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg" 
                : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 shadow-md hover:shadow-lg"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Wallpaper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 transform hover:-translate-y-2">
            <div className="aspect-video bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-lg font-bold mb-1">{selectedCategory}</div>
                  <div className="text-sm opacity-80">#{i}</div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-slate-600 mb-3 capitalize font-medium text-sm">{selectedCategory} wallpaper #{i}</p>
              <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download HD
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <button className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105">
          Load More Wallpapers
        </button>
      </div>
    </div>
  );
}
