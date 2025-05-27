import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Download, Wand2, Loader2, AlertCircle, CheckCircle, Copy, ArrowRight, ArrowLeft } from 'lucide-react';

const PDFConverter = () => {
  const [mode, setMode] = useState('pdf-to-text');
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('original');
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        setError('');
        setSuccess('');
        setExtractedText('');
        setEnhancedText('');
      } else {
        setError('Please select a valid PDF file');
      }
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setSuccess('');
      setExtractedText('');
      setEnhancedText('');
    } else {
      setError('Please drop a valid PDF file');
    }
  }, []);

  // Extract text from PDF using pdf-parse
  const extractTextFromPDF = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Convert file to buffer for pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Use pdf-parse (we'll simulate this since we can't import it directly in this environment)
      // In your actual app, you would do: const pdfParse = require('pdf-parse');
      // const data = await pdfParse(uint8Array);
      
      // For demonstration, we'll simulate text extraction
      // Replace this with actual pdf-parse implementation
      const simulatedText = `This is extracted text from your PDF file: ${file.name}
      
Sample content that would be extracted from your PDF document. In your actual implementation, this would be the real extracted text using the pdf-parse library you installed.

The text would maintain formatting and structure from the original PDF document, including paragraphs, line breaks, and spacing as much as possible.

This is just a simulation - your actual implementation will extract the real text content from the uploaded PDF file.`;

      setExtractedText(simulatedText);
      setSuccess(`Successfully extracted text from PDF: ${file.name}`);
      setActiveTab('original');
    } catch (err) {
      setError('Failed to extract text from PDF. Please try another file.');
      console.error('PDF extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert text to PDF using jsPDF
  const convertTextToPDF = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to convert to PDF.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Configure page settings
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - 2 * margin;
      const lineHeight = 7;

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(inputText, maxLineWidth);

      // Add text to PDF with proper pagination
      let yPosition = 30;

      // Add title
      doc.setFontSize(16);
      doc.text('Converted Document', margin, 20);
      doc.setFontSize(12);

      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 30;
        }

        doc.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }

      // Save the PDF
      doc.save('converted-document.pdf');
      setSuccess('PDF generated and downloaded successfully!');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhance text with AI
  const enhanceTextWithAI = async () => {
    const textToEnhance = mode === 'pdf-to-text' ? extractedText : inputText;

    if (!textToEnhance.trim()) {
      setError('No text to enhance. Please add some text first.');
      return;
    }

    setIsEnhancing(true);
    setError('');

    try {
      // Simulate AI enhancement (replace with your actual AI API call)
      // In your real app, you would call your AI service here
      const enhancedContent = `Enhanced Version:

${textToEnhance}

[AI Enhancement Applied]
- Grammar and spelling corrected
- Improved readability and flow
- Better paragraph organization
- Enhanced clarity and structure
- Professional formatting applied

This is a simulation of AI enhancement. In your actual implementation, you would integrate with OpenAI, Google AI, or another AI service using the packages you installed.`;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEnhancedText(enhancedContent);
      setSuccess('Text successfully enhanced with AI!');
      setActiveTab('enhanced');
    } catch (err) {
      setError('Failed to enhance text with AI. Please try again.');
      console.error('AI enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Download text as file
  const downloadText = (text, filename) => {
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

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Text copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy text to clipboard');
    }
  };

  // Clear all data
  const clearAll = () => {
    setFile(null);
    setInputText('');
    setExtractedText('');
    setEnhancedText('');
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered PDF Converter
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Convert between PDF and text formats with intelligent AI enhancement. 
            Upload PDFs to extract text or create professional PDFs from your content.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setMode('pdf-to-text');
                clearAll();
              }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                mode === 'pdf-to-text'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 mr-2" />
                <ArrowRight className="w-4 h-4 mr-2" />
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">PDF to Text</h3>
              <p className="text-sm text-gray-600 mt-1">Extract and enhance text from PDF files</p>
            </button>

            <button
              onClick={() => {
                setMode('text-to-pdf');
                clearAll();
              }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                mode === 'text-to-pdf'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 mr-2" />
                <ArrowLeft className="w-4 h-4 mr-2" />
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Text to PDF</h3>
              <p className="text-sm text-gray-600 mt-1">Create professional PDFs from text</p>
            </button>
          </div>
        </div>

        {/* PDF to Text Mode */}
        {mode === 'pdf-to-text' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload PDF File
            </h2>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="mb-4">
                <span className="text-lg font-medium text-gray-700">
                  Drop your PDF here or{' '}
                  <span className="text-blue-600 hover:text-blue-700">browse files</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>
            </div>

            {file && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium">📄 {file.name}</p>
                    <p className="text-blue-600 text-sm">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={extractTextFromPDF}
                disabled={!file || isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Text...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Extract Text from PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Text to PDF Mode */}
        {mode === 'text-to-pdf' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Enter Text to Convert
            </h2>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here...

• Write your content, documents, or notes
• The text will be formatted into a professional PDF
• Use AI enhancement to improve quality before conversion"
                className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                style={{ fontFamily: 'inherit' }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {inputText.length} characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={convertTextToPDF}
                disabled={!inputText.trim() || isProcessing}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Convert to PDF
                  </>
                )}
              </button>
              {inputText && (
                <button
                  onClick={clearAll}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Enhancement Button */}
        {((mode === 'pdf-to-text' && extractedText) || (mode === 'text-to-pdf' && inputText)) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                AI Text Enhancement
              </h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Powered by AI
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Improve your text with AI-powered grammar correction, readability enhancement, and professional formatting.
            </p>
            <button
              onClick={enhanceTextWithAI}
              disabled={isEnhancing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Enhance Text with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Text Display */}
        {(extractedText || enhancedText) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab('original')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-all flex items-center justify-center ${
                  activeTab === 'original'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                {mode === 'pdf-to-text' ? 'Extracted Text' : 'Original Text'}
              </button>
              {enhancedText && (
                <button
                  onClick={() => setActiveTab('enhanced')}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-all flex items-center justify-center ${
                    activeTab === 'enhanced'
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600 -mb-px'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Enhanced
                  <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    New
                  </span>
                </button>
              )}
            </div>

       
            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                  {activeTab === 'original' 
                    ? (mode === 'pdf-to-text' ? 'Extracted Text' : 'Original Text')
                    : 'AI Enhanced Text'
                  }
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(activeTab === 'original' ? extractedText : enhancedText)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadText(
                      activeTab === 'original' ? extractedText : enhancedText,
                      activeTab === 'original' ? 'extracted-text.txt' : 'enhanced-text.txt'
                    )}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {activeTab === 'original' ? extractedText : enhancedText}
                </pre>
              </div>

              {activeTab === 'original' && extractedText && !enhancedText && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Click "Enhance Text with AI" above to improve grammar, readability, and formatting.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 text-sm">
            Built with modern web technologies • Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFConverter;