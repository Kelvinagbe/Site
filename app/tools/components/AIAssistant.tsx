"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Zap } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const processText = (text: string): React.ReactNode[] => {
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
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index} className="italic">{part.slice(1, -1)}</em>;
      }
      else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-white/20 text-blue-200 px-2 py-1 rounded text-sm font-mono border border-white/10">{part.slice(1, -1)}</code>;
      }
      else if (part.startsWith('http://') || part.startsWith('https://')) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100 underline decoration-2 underline-offset-2 transition-colors">{part}</a>;
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
        <pre key={`code-${index}`} className="bg-black/40 text-green-300 p-4 rounded-xl my-3 overflow-x-auto border border-white/20 shadow-lg backdrop-blur-sm">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      );
    }
    else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={`h1-${index}`} className="text-3xl font-bold text-white mb-3 mt-6">{processInlineText(line.slice(2))}</h1>);
    }
    else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${index}`} className="text-2xl font-semibold text-white mb-2 mt-5">{processInlineText(line.slice(3))}</h2>);
    }
    else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${index}`} className="text-xl font-medium text-white/90 mb-2 mt-4">{processInlineText(line.slice(4))}</h3>);
    }
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(<li key={`li-${index}`} className="mb-1 text-white/90">{processInlineText(line.slice(2))}</li>);
    }
    else if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(<li key={`li-${index}`} className="mb-1 text-white/90">{processInlineText(line.replace(/^\d+\. /, ''))}</li>);
    }
    else if (line.trim()) {
      flushList();
      elements.push(<p key={`p-${index}`} className="mb-3 text-white/90 leading-relaxed">{processInlineText(line)}</p>);
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
  const processedContent = processText(content);
  return <div className="prose prose-sm max-w-none">{processedContent}</div>;
};

const FloatingParticles = () => {
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
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-bounce"
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

export default function PremiumAIChat() {
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
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-gradient-xy"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Main Chat Container */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-500">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to assist you
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Ask me anything! I can help with coding, writing, analysis, creative projects, and much more.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["💡 Get ideas", "🔍 Research topics", "⚡ Solve problems", "✨ Be creative"].map((item, i) => (
                    <div key={i} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white/90 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-white/20">
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
                        <div className="max-w-[85%] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-br-md shadow-lg backdrop-blur-sm">
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
                          <img 
                            src="/favicon.ico" 
                            alt="AI" 
                            className="w-6 h-6 rounded opacity-80"
                            onError={(e) => {
                              // Fallback to a div with initials if favicon fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold';
                              fallback.textContent = 'AI';
                              target.parentNode?.appendChild(fallback);
                            }}
                          />
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
                        <img 
                          src="/favicon.ico" 
                          alt="AI" 
                          className="w-6 h-6 rounded opacity-60"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-60';
                            fallback.textContent = 'AI';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>
                          ))}
                        </div>
                        <span className="text-sm text-white/70 font-medium">AI is thinking...</span>
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
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-end space-x-3 bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg hover:border-white/50 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all duration-200">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full resize-none border-0 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 max-h-32"
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
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-white/60 mt-2 px-1">
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
}