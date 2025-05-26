"use client";

import React, { ReactNode } from "react";

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Tools - My App</title>
      </head>
      <body>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}