// app/page.tsx
import React from 'react';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 1rem',
        backgroundColor: '#f5f7fa',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1rem',
          color: '#0F172A',
          textAlign: 'center',
        }}
      >
        AI PDF Converter
      </h1>

      <p
        style={{
          fontSize: '1.25rem',
          color: '#475569',
          marginBottom: '2rem',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        Convert your PDFs quickly and accurately with powerful AI technology.
      </p>

      <button
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.4)',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
      >
        Get Started
      </button>
    </main>
  );
            }
