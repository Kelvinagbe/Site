import React, { useState, useRef, useCallback } from 'react';
import { FileDown, FileText, Wand2, Upload, Eye, EyeOff, Trash2, Menu, X, MessageSquare, Plus } from 'lucide-react';

interface PDFDocument {
  id: string;
  name: string;
  content: string;
  originalContent: string;
  createdAt: Date;
  size: number;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PDFConverter = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<PDFDocument | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<'create' | 'edit' | 'documents'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI response (replace with actual AI API call)
  const simulateAIResponse = async (prompt: string, context: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      `I've analyzed your document and here are some improvements:\n\n**Enhanced Content:**\n${context.slice(0, 200)}...\n\n**Suggestions:**\n- Added better structure and formatting\n- Improved readability\n- Enhanced professional tone\n- Added relevant examples where appropriate`,
      `Here's an improved version of your text with better clarity and flow:\n\n${context.replace(/\./g, '. ').replace(/,/g, ', ').trim()}`,
      `I've enhanced your document with:\n- Better paragraph structure\n- Improved transitions\n- Professional formatting\n- Clearer language\n\nWould you like me to make any specific adjustments?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generatePDF = useCallback(async (content: string, filename: string) => {
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          h1, h2, h3 { color: #2c3e50; margin-top: 30px; }
          h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          p { margin-bottom: 15px; text-align: justify; }
          .header { text-align: center; margin-bottom: 40px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
          strong { color: #2c3e50; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${filename.replace('.pdf', '')}</h1>
          <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        </div>
        <div class="content">
          ${content.split('\n').map(line => {
            if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
            if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
            if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
            if (line.trim() === '') return '<br>';
            return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
          }).join('')}
        </div>
        <div class="footer">
          <p>Created with AI-Enhanced PDF Converter</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename.replace('.pdf', '.html') : `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const createDocument = async () => {
    if (!textInput.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const newDoc: PDFDocument = {
        id: crypto.randomUUID(),
        name: `Document_${new Date().toISOString().slice(0, 10)}.pdf`,
        content: textInput,
        originalContent: textInput,
        createdAt: new Date(),
        size: new Blob([textInput]).size
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setTextInput('');
      setCurrentView('edit');
      
      await generatePDF(newDoc.content, newDoc.name);
      
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
  };

  const enhanceWithAI = async () => {
    if (!activeDoc) return;
    
    setAiLoading(true);
    
    try {
      const enhancement = await simulateAIResponse('enhance this document', activeDoc.content);
      
      const newMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: enhancement,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, newMessage]);
      setShowAIChat(true);
      
    } catch (error) {
      console.error('AI enhancement error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim() || !activeDoc) return;
    
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: aiInput,
      timestamp: new Date()
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);
    
    try {
      const response = await simulateAIResponse(userMessage.content, activeDoc.content);
      
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    if (activeDoc?.id === docId) {
      setActiveDoc(null);
      setAiMessages([]);
      setCurrentView('create');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">PDF Converter</h1>
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative fixed inset-y-0 left-0 z-50
          w-80 bg-white shadow-xl border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PDF Converter</h1>
                <p className="text-sm text-gray-500">AI-Enhanced</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setCurrentView('create');
                  setShowSidebar(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'create'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCurrentView('edit');
                  setShowSidebar(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'edit'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={!activeDoc}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setCurrentView('documents');
                  setShowSidebar(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'documents'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Docs
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Documents</h3>
              <span className="text-sm text-gray-500">{documents.length}</span>
            </div>
            
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No documents yet</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeDoc?.id === doc.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveDoc(doc);
                      setCurrentView('edit');
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Chat Toggle */}
          {activeDoc && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                {showAIChat ? 'Hide AI Chat' : 'Open AI Chat'}
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Create View */}
          {currentView === 'create' && (
            <div className="flex-1 p-4 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Create New Document</h2>
                  <p className="text-gray-600">Write your content and convert it to PDF with AI enhancements</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-8 border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Document Content</h3>
                      <p className="text-sm text-gray-500">Supports Markdown formatting</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text here... You can use markdown formatting like **bold**, *italic*, and # headings."
                    className="w-full h-64 lg:h-80 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 leading-relaxed text-sm lg:text-base"
                  />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div className="text-sm text-gray-500">
                      {textInput.length} characters
                    </div>
                    <button
                      onClick={createDocument}
                      disabled={!textInput.trim() || isGenerating}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          Create & Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit View */}
          {currentView === 'edit' && activeDoc && (
            <div className="flex-1 flex flex-col">
              {/* Edit Header */}
              <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activeDoc.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {activeDoc.createdAt.toLocaleDateString()} • {Math.round(activeDoc.size / 1024)}KB
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button
                      onClick={enhanceWithAI}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      AI Enhance
                    </button>
                    <button
                      onClick={() => generatePDF(activeDoc.content, activeDoc.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Content */}
              <div className="flex-1 p-4 lg:p-8">
                {previewMode ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="prose max-w-none p-6 bg-white rounded-xl border shadow-sm">
                      {activeDoc.content.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mb-4 text-gray-900">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-semibold mb-3 text-gray-800">{line.slice(3)}</h2>;
                        if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-medium mb-2 text-gray-700">{line.slice(4)}</h3>;
                        if (line.trim() === '') return <br key={index} />;
                        return (
                          <p key={index} className="mb-3 text-gray-700 leading-relaxed text-sm lg:text-base"
                             dangerouslySetInnerHTML={{
                               __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                             }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <textarea
                      value={activeDoc.content}
                      onChange={(e) => {
                        const updatedDoc = { ...activeDoc, content: e.target.value };
                        setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? updatedDoc : doc));
                        setActiveDoc(updatedDoc);
                      }}
                      className="w-full h-full min-h-96 p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 leading-relaxed text-sm lg:text-base shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents View */}
          {currentView === 'documents' && (
            <div className="flex-1 p-4 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">My Documents</h2>
                  <p className="text-gray-600">Manage your PDF documents</p>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-500 mb-6">Create your first document to get started</p>
                    <button
                      onClick={() => setCurrentView('create')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Create Document
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setActiveDoc(doc);
                          setCurrentView('edit');
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2 truncate">{doc.name}</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          {doc.createdAt.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-3">
                          {doc.content.slice(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showAIChat && activeDoc && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 z-30 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Ask me anything about your document!</p>
                </div>
              ) : (
                aiMessages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-xl text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
              {aiLoading && (
                <div className="bg-gray-100 mr-8 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Ask AI about your document..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendAIMessage}
                  disabled={!aiInput.trim() || aiLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFConverter;