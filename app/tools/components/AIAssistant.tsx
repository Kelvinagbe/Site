"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

// Theme detection
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for system theme preference
    const checkTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const hasDocumentClass = document.documentElement.classList.contains('dark');
      const bodyHasDark = document.body.classList.contains('dark');
      
      // Check multiple sources for theme
      if (hasDocumentClass || bodyHasDark || isDark) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    checkTheme();
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    // Watch for class changes on document
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    // Check periodically as fallback
    const interval = setInterval(checkTheme, 1000);

    return () => {
      mediaQuery.removeEventListener('change', checkTheme);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return { theme };
};

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const processText = (text: string, isDark: boolean): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(<ul key={`list-${elements.length}`} className="my-2 ml-4 list-disc">{currentList}</ul>);
      } else if (listType === 'ol') {
        elements.push(<ol key={`list-${elements.length}`} className="my-2 ml-4 list-decimal">{currentList}</ol>);
      }
      currentList = [];
      listType = null;
    }
  };

  const processInlineText = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s<>"{}|\\^`[\]]+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-lg">{part.slice(2, -2)}</strong>;
      }
      else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index} className="italic">{part.slice(1, -1)}</em>;
      }
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className={`px-2 py-1 rounded text-sm font-mono border ${
            isDark 
              ? 'bg-white/20 text-blue-200 border-white/10' 
              : 'bg-gray-100 text-blue-700 border-gray-200'
          }`}>
            {part.slice(1, -1)}
          </code>
        );
      }
      else if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" 
             className={`underline decoration-2 underline-offset-2 transition-colors ${
               isDark 
                 ? 'text-blue-300 hover:text-blue-100' 
                 : 'text-blue-600 hover:text-blue-800'
             }`}>
            {part}
          </a>
        );
      }
      else {
        return part;
      }
    });
  };

  lines.forEach((line, index) => {
    if (line.startsWith('```') && line.endsWith('```')) {
      flushList();
      const code = line.slice(3, -3);
      elements.push(
        <pre key={`code-${index}`} className={`p-4 rounded-xl my-3 overflow-x-auto border shadow-lg backdrop-blur-sm ${
          isDark 
            ? 'bg-black/40 text-green-300 border-white/20' 
            : 'bg-gray-50 text-green-700 border-gray-200'
        }`}>
          <code className="text-sm font-mono">{code}</code>
        </pre>
      );
    }
    else if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${index}`} className={`text-3xl font-bold mb-3 mt-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {processInlineText(line.slice(2))}
        </h1>
      );
    }
    else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${index}`} className={`text-2xl font-semibold mb-2 mt-5 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {processInlineText(line.slice(3))}
        </h2>
      );
    }
    else if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${index}`} className={`text-xl font-medium mb-2 mt-4 ${
          isDark ? 'text-white/90' : 'text-gray-800'
        }`}>
          {processInlineText(line.slice(4))}
        </h3>
      );
    }
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(
        <li key={`li-${index}`} className={`mb-1 ${
          isDark ? 'text-white/90' : 'text-gray-700'
        }`}>
          {processInlineText(line.slice(2))}
        </li>
      );
    }
    else if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(
        <li key={`li-${index}`} className={`mb-1 ${
          isDark ? 'text-white/90' : 'text-gray-700'
        }`}>
          {processInlineText(line.replace(/^\d+\. /, ''))}
        </li>
      );
    }
    else if (line.trim()) {
      flushList();
      elements.push(
        <p key={`p-${index}`} className={`mb-3 leading-relaxed ${
          isDark ? 'text-white/90' : 'text-gray-700'
        }`}>
          {processInlineText(line)}
        </p>
      );
    }
    else if (line === '') {
      flushList();
      elements.push(<div key={`br-${index}`} className="h-2" />);
    }
  });

  flushList();
  return elements;
};

const MessageContent = ({ content }: { content: string }) => {
  const { theme } = useTheme();
  const processedContent = processText(content, theme === 'dark');
  return <div className="prose prose-sm max-w-none">{processedContent}</div>;
};

const FloatingParticles = () => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    const createParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
      }));
      setParticles(newParticles);
    };

    createParticles();
    const interval = setInterval(createParticles, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full animate-bounce ${
            theme === 'dark' ? 'bg-white/30' : 'bg-gray-800/20'
          }`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '6s',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
};

const ChatInterface = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [{ role: "user", content: userMessage.content }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "bot",
        content: data.message || "I apologize, but I couldn't process your request properly.",
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "bot",
        content: `⚠️ ${error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className={`fixed inset-0 transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } animate-gradient-xy`}></div>
      <div className={`fixed inset-0 transition-all duration-500 animate-pulse ${
        theme === 'dark'
          ? 'bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20'
          : 'bg-gradient-to-tr from-blue-200/30 via-purple-200/30 to-pink-200/30'
      }`}></div>
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Main Chat Container */}
      <div className="relative z-10 flex flex-col h-full pt-8">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="relative mb-8">
                  <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-500 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className={`absolute inset-0 rounded-3xl blur-xl opacity-30 animate-pulse ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}></div>
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Ready to assist you
                </h2>
                <p className={`text-lg mb-8 max-w-md mx-auto leading-relaxed ${
                  theme === 'dark' ? 'text-white/80' : 'text-gray-600'
                }`}>
                  Ask me anything! I can help with coding, writing, analysis, creative projects, and much more.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["💡 Get ideas", "🔍 Research topics", "⚡ Solve problems", "✨ Be creative"].map((item, i) => (
                    <div key={i} className={`px-4 py-2 rounded-full border text-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white/90 hover:bg-white/20'
                        : 'bg-white/70 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white/90'
                    }`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(({ id, role, content }) => (
                  <div key={id} className={`group animate-in slide-in-from-bottom-4 duration-500 ${role === "user" ? "fade-in-0" : "fade-in-10"}`}>
                    {role === "user" ? (
                      <div className="flex justify-end">
                        <div className={`max-w-[85%] rounded-2xl rounded-br-md shadow-lg backdrop-blur-sm ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}>
                          <div className="px-4 py-3 text-white">
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                            theme === 'dark'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 opacity-80'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600'
                          }`}>
                            <img 
                              src="/favicon.ico" 
                              alt="AI" 
                              className="w-4 h-4"
                              onError={(e) => {
                                // Fallback to text if favicon fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<span class="text-white text-xs font-bold">AI</span>';
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 max-w-[85%]">
                          <MessageContent content={content} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="group animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 opacity-60'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 opacity-80'
                        }`}>
                          <img 
                            src="/favicon.ico" 
                            alt="AI" 
                            className="w-4 h-4"
                            onError={(e) => {
                              // Fallback to text if favicon fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-white text-xs font-bold">AI</span>';
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${
                              theme === 'dark' ? 'bg-white/60' : 'bg-gray-600/60'
                            }`} style={{animationDelay: `${i * 0.1}s`}}></div>
                          ))}
                        </div>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                        }`}>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        
        {/* Input Area */}
        <div className={`border-t backdrop-blur-md ${
          theme === 'dark' 
            ? 'border-white/20 bg-black/20' 
            : 'border-gray-200 bg-white/80'
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className={`flex items-end space-x-3 backdrop-blur-sm border rounded-2xl shadow-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:border-white/40 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20'
                : 'bg-white/95 border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20'
            }`}>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className={`w-full resize-none border-0 bg-transparent px-4 py-3 focus:outline-none focus:ring-0 max-h-32 ${
                    theme === 'dark'
                      ? 'text-white placeholder-gray-400'
                      : 'text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  disabled={loading}
                />
              </div>
              <div className="flex items-end pb-2 pr-2">
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                    loading || !input.trim()
                      ? theme === 'dark'
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      theme === 'dark' ? 'border-white/30' : 'border-gray-300'
                    }`}></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className={`flex justify-between items-center text-xs mt-2 px-1 ${
              theme === 'dark' ? 'text-white/60' : 'text-gray-500'
            }`}>
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Supports **bold**, *italic*, `code`, and links</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-size: 400% 400%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default function PremiumAIChat() {
  return <ChatInterface />;
}