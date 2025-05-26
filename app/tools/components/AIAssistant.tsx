"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

// Safe text processor that returns React elements
const processText = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  
  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(<ul key={`list-${elements.length}`} className="my-2 ml-4">{currentList}</ul>);
      } else if (listType === 'ol') {
        elements.push(<ol key={`list-${elements.length}`} className="my-2 ml-4 list-decimal">{currentList}</ol>);
      }
      currentList = [];
      listType = null;
    }
  };

  const processInlineText = (text: string): React.ReactNode => {
    // Split by various patterns and process each part
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    
    return parts.map((part, index) => {
      // Bold text **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      // Italic text *text*
      else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      // Inline code `code`
      else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      // URLs
      else if (part.startsWith('http://') || part.startsWith('https://')) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{part}</a>;
      }
      // Email addresses
      else if (part.includes('@') && part.includes('.')) {
        return <a key={index} href={`mailto:${part}`} className="text-blue-600 hover:text-blue-800 underline">{part}</a>;
      }
      // Regular text
      else {
        return part;
      }
    });
  };

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith('```') && line.endsWith('```')) {
      flushList();
      const code = line.slice(3, -3);
      elements.push(
        <pre key={`code-${index}`} className="bg-gray-100 p-3 rounded-md my-2 overflow-x-auto">
          <code>{code}</code>
        </pre>
      );
    }
    // Headers
    else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={`h1-${index}`} className="text-2xl font-bold mb-2 mt-4">{processInlineText(line.slice(2))}</h1>);
    }
    else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${index}`} className="text-xl font-semibold mb-2 mt-3">{processInlineText(line.slice(3))}</h2>);
    }
    else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${index}`} className="text-lg font-medium mb-1 mt-2">{processInlineText(line.slice(4))}</h3>);
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(<li key={`li-${index}`}>{processInlineText(line.slice(2))}</li>);
    }
    // Numbered lists
    else if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(<li key={`li-${index}`}>{processInlineText(line.replace(/^\d+\. /, ''))}</li>);
    }
    // Regular text
    else if (line.trim()) {
      flushList();
      elements.push(<p key={`p-${index}`} className="mb-2">{processInlineText(line)}</p>);
    }
    // Empty line
    else if (line === '') {
      flushList();
      elements.push(<br key={`br-${index}`} />);
    }
  });

  flushList();
  return elements;
};

const MessageContent = ({ content }: { content: string }) => {
  const processedContent = processText(content);
  
  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      {processedContent}
    </div>
  );
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            {
              role: "user",
              content: userMessage.content
            }
          ]
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response text:", responseText);
        
        // Try to parse as JSON first, fallback to text
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response that failed to parse:", responseText);
        throw new Error("Server returned invalid JSON response");
      }

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "bot",
        content: data.message || "Sorry, I didn't understand that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: `Error: ${error instanceof Error ? error.message : "Something went wrong. Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">How can I help you today?</h2>
              <p className="text-gray-600 text-lg">Start a conversation by typing a message below.</p>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map(({ id, role, content }) => (
              <div key={id} className="group">
                {role === "user" ? (
                  // User message in a box
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-3">
                      <div className="text-gray-900 whitespace-pre-wrap break-words">
                        {content}
                      </div>
                    </div>
                  </div>
                ) : (
                  // AI message with no background (blends with page background)
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 max-w-[85%]">
                      <div className="text-gray-800">
                        <MessageContent content={content} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="group">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex items-end space-x-3 bg-white border border-gray-300 rounded-2xl shadow-sm hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
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
                  aria-label="Send message"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Supports **bold**, *italic*, `code`, and links</span>
          </div>
        </div>
      </div>
    </div>
  );
}