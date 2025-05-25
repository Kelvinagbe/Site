// app/page.tsx

import React from 'react';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: 'auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AI PDF Converter</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
        Easily convert and process your PDF documents using AI technology.
      </p>

      <section style={{ backgroundColor: '#f7f7f7', padding: '1.5rem', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>How It Works</h2>
        <ol>
          <li>Upload your PDF file.</li>
          <li>Let the AI analyze and convert the content.</li>
          <li>Download your processed file quickly and securely.</li>
        </ol>
      </section>

      <footer style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666' }}>
        Built with Next.js by Kelvin Agbe.
      </footer>
    </main>
  );
}
