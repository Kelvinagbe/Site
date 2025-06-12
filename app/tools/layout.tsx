import React, { ReactNode } from "react";
import type { Metadata } from 'next';

interface ToolsLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Tools - Apexion',
  description: 'Access powerful PDF and AI tools',
};

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {children}
    </div>
  );
}