"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Loading Context Type
interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
  
  // Additional loading states for different operations
  isAppLoading: boolean;
  isContentLoading: boolean;
  setAppLoading: (loading: boolean, text?: string) => void;
  setContentLoading: (loading: boolean) => void;
}

// Create Context
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingText: 'Loading...',
  setLoading: () => {},
  isAppLoading: false,
  isContentLoading: false,
  setAppLoading: () => {},
  setContentLoading: () => {},
});

// Loading Provider Component
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const setLoading = (loading: boolean, text = 'Loading...') => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  const setAppLoading = (loading: boolean, text = 'Loading...') => {
    setIsAppLoading(loading);
    setLoadingText(text);
  };

  const setContentLoading = (loading: boolean) => {
    setIsContentLoading(loading);
  };

  const value = {
    isLoading,
    loadingText,
    setLoading,
    isAppLoading,
    isContentLoading,
    setAppLoading,
    setContentLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom Hook to use Loading Context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// HOC for easier component wrapping
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <LoadingProvider>
      <Component {...props} />
    </LoadingProvider>
  );
};