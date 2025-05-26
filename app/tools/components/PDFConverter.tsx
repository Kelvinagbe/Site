'use client';

import React, { useState, useCallback, useEffect } from 'react';

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
    jsPDF: any;
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

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
  </svg>
);

const PDFConverter = () => {
  const [mode, setMode] = useState<'pdf-to-text' | 'text-to-pdf'>('pdf-to-text');
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('original');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [jsPDFLoaded, setJsPDFLoaded] = useState(false);

  // Load required libraries
  useEffect(() => {
    const loadLibraries = () => {
      // Load PDF.js for PDF to text
      if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        pdfScript.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfLibLoaded(true);
          }
        };
        document.head.appendChild(pdfScript);
      } else {
        setPdfLibLoaded(true);
      }

      // Load jsPDF for text to PDF
      if (!window.jsPDF) {
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jsPDFScript.onload = () => {
          setJsPDFLoaded(true);
        };
        document.head.appendChild(jsPDFScript);
      } else {
        setJsPDFLoaded(true);
      }
    };

    loadLibraries();
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

    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const convertTextToPDF = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to convert to PDF.');
      return;
    }

    if (!window.jsPDF || !jsPDFLoaded) {
      setError('PDF generation library not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { jsPDF } = window.jsPDF;
      const doc = new jsPDF();
      
      // Split text into lines that fit the page width
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - 2 * margin;
      
      const lines = doc.splitTextToSize(inputText, maxLineWidth);
      
      // Add text to PDF with proper pagination
      let yPosition = 30;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.getHeight();
      
      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }
      
      // Download the PDF
      doc.save('converted-text.pdf');
      setSuccess('PDF generated and downloaded successfully!');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const enhanceTextWithAI = async () => {
    const textToEnhance = mode === 'pdf-to-text' ? extractedText : inputText;
    
    if (!textToEnhance.trim()) {
      setError('No text to enhance. Please add some text first.');
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
              ${textToEnhance}`
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
              PDF Converter
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Convert between PDF and text formats with AI-powered enhancement
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setMode('pdf-to-text')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                mode === 'pdf-to-text'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <FileTextIcon className="w-6 h-6 mr-2" />
                <ArrowRightIcon className="w-4 h-4 mr-2" />
                <FileTextIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">PDF to Text</h3>
              <p className="text-sm text-gray-600 mt-1">Extract text from PDF files</p>
            </button>

            <button
              onClick={() => setMode('text-to-pdf')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                mode === 'text-to-pdf'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <FileTextIcon className="w-6 h-6 mr-2" />
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                <FileTextIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Text to PDF</h3>
              <p className="text-sm text-gray-600 mt-1">Convert text to PDF format</p>
            </button>
          </div>
        </div>

        {/* Library Loading Status */}
        {(!pdfLibLoaded || !jsPDFLoaded) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center">
            <LoaderIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-yellow-800 text-sm">Loading PDF processing libraries...</p>
          </div>
        )}

        {/* PDF to Text Mode */}
        {mode === 'pdf-to-text' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload PDF File</h2>
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

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={extractTextFromPDF}
                disabled={!file || isProcessing || !pdfLibLoaded}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
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
            </div>
          </div>
        )}

        {/* Text to PDF Mode */}
        {mode === 'text-to-pdf' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Text to Convert</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={convertTextToPDF}
                disabled={!inputText.trim() || isProcessing || !jsPDFLoaded}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Enhancement Button */}
        {((mode === 'pdf-to-text' && extractedText) || (mode === 'text-to-pdf' && inputText)) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <button
              onClick={enhanceTextWithAI}
              disabled={isEnhancing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center"
            >
              {isEnhancing ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <WandIcon className="w-4 h-4 mr-2" />
                  Enhance Text with AI
                </>
              )}
            </button>
          </div>
        )}

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
                <FileTextIcon className="w-4 h-4 mr-2" />
                {mode === 'pdf-to-text' ? 'Extracted Text' : 'Original Text'}
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
              {activeTab === 'original' && (mode === 'pdf-to-text' ? extractedText : inputText) && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button
                      onClick={() => copyToClipboard(mode === 'pdf-to-text' ? extractedText : inputText)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadText(mode === 'pdf-to-text' ? extractedText : inputText, 'text-content.txt')}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {mode === 'pdf-to-text' ? extractedText : inputText}
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
                    Click &ldquo;Enhance Text with AI&rdquo; to improve your text
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFConverter;