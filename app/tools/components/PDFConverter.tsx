'use client';

import React, { useState, useCallback, useEffect } from 'react';

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// SVG Icons as components
const UploadIcon = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const WandIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21l3-3 9-9a1.414 1.414 0 000-2L17.586 5.586a1.414 1.414 0 00-2 0L6 15l-3 3 2 2z m7.5-7.5L16 12"></path>
  </svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
  </svg>
);

const PDFConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('original');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  // Load PDF.js from CDN
  useEffect(() => {
    const loadPdfJs = () => {
      // Check if already loaded
      if (window.pdfjsLib) {
        setPdfLibLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          // Set up PDF.js worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfLibLoaded(true);
        }
      };
      script.onerror = () => {
        setError('Failed to load PDF processing library');
      };
      document.head.appendChild(script);
    };

    loadPdfJs();
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setError('');
      setSuccess('');
      setExtractedText('');
      setEnhancedText('');
    } else {
      setError('Please select a valid PDF file');
    }
  }, []);

  const extractTextFromPDF = async () => {
    if (!file || !window.pdfjsLib || !pdfLibLoaded) {
      setError('PDF processing library not ready. Please try again.');
      return;
    }

    setIsExtracting(true);
    setError('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setExtractedText(fullText.trim());
      setSuccess(`Successfully extracted text from ${pdf.numPages} pages`);
      setActiveTab('original');
    } catch (err) {
      setError('Failed to extract text from PDF. Please try another file.');
      console.error('PDF extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const enhanceTextWithAI = async () => {
    if (!extractedText.trim()) {
      setError('No text to enhance. Please extract text first.');
      return;
    }

    setIsEnhancing(true);
    setError('');

    try {
      const response = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please enhance and improve the following text by:
              1. Correcting grammar and spelling errors
              2. Improving readability and flow
              3. Organizing content with proper paragraphs
              4. Maintaining the original meaning and context
              5. Adding appropriate formatting where needed
              
              Text to enhance:
              ${extractedText}`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setEnhancedText(data.message);
      setSuccess('Text successfully enhanced with AI!');
      setActiveTab('enhanced');
    } catch (err) {
      setError('Failed to enhance text with AI. Please try again.');
      console.error('AI enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Text copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy text to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileTextIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI PDF Converter
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Extract text from PDFs and enhance it with AI-powered editing
          </p>
        </div>

        {/* PDF.js Loading Status */}
        {!pdfLibLoaded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center">
            <LoaderIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-yellow-800 text-sm">Loading PDF processing library...</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <UploadIcon />
            <div className="mb-4">
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700">
                  Drop your PDF here or{' '}
                  <span className="text-blue-600 hover:text-blue-700">browse</span>
                </span>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {file && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-blue-800 font-medium text-sm">
                  Selected: {file.name}
                </p>
                <p className="text-blue-600 text-xs">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={extractTextFromPDF}
              disabled={!file || isExtracting || !pdfLibLoaded}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              {isExtracting ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  Extract Text
                </>
              )}
            </button>

            <button
              onClick={enhanceTextWithAI}
              disabled={!extractedText || isEnhancing}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              {isEnhancing ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2" />
                  Enhancing...
                </>
              ) : (
                <>
                  <WandIcon className="w-4 h-4 mr-2" />
                  Enhance with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircleIcon className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Text Display */}
        {(extractedText || enhancedText) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('original')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center ${
                  activeTab === 'original'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Original Text
              </button>
              <button
                onClick={() => setActiveTab('enhanced')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors flex items-center justify-center ${
                  activeTab === 'enhanced'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                disabled={!enhancedText}
              >
                <WandIcon className="w-4 h-4 mr-2" />
                AI Enhanced
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'original' && extractedText && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button
                      onClick={() => copyToClipboard(extractedText)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadText(extractedText, 'extracted-text.txt')}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {extractedText}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'enhanced' && enhancedText && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button
                      onClick={() => copyToClipboard(enhancedText)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadText(enhancedText, 'enhanced-text.txt')}
                      className="flex items-center justify-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <div className="text-sm text-gray-800 leading-relaxed">
                      {enhancedText.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'enhanced' && !enhancedText && (
                <div className="text-center py-8">
                  <WandIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Click &ldquo;Enhance with AI&rdquo; to improve your extracted text
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <FileTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">PDF Text Extraction</h3>
            <p className="text-gray-600 text-sm">
              Extract text from any PDF document with high accuracy
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <WandIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">AI Enhancement</h3>
            <p className="text-gray-600 text-sm">
              Improve text quality with AI-powered grammar and style fixes
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <DownloadIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Easy Export</h3>
            <p className="text-gray-600 text-sm">
              Download or copy your processed text instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFConverter;