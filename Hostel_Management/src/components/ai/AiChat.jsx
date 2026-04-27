import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ChatMessage from './ChatMessage';

/**
 * AiChat — Floating AI Hostel Assistant widget.
 * Renders as a button in the bottom-right corner of the screen.
 * Opens into a full chat panel when clicked.
 *
 * The component uses the axios instance from AuthContext (token already set globally).
 */
export default function AiChat() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Greeting shown when the chat is first opened
  const GREETING = {
    role: 'assistant',
    text: "Hello! 👋 I'm your AI Hostel Assistant. You can ask me about your room allocation, available rooms, pending fees, or maintenance guidance.",
    intent: 'GENERAL_INFO',
    timestamp: new Date()
  };

  // Suggested quick-prompts based on common queries
  const QUICK_PROMPTS = [
    'What room am I allocated to?',
    'Are there any vacant rooms?',
    'What is my monthly rent?',
    'How do I request maintenance?'
  ];

  // Scroll to the latest message whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens; show greeting on first open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasUnread(false);
      if (messages.length === 0) {
        setMessages([GREETING]);
      }
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen(prev => !prev);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    const userMsg = { role: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/ai/chat', {
        message: userText
      });

      const assistantMsg = {
        role: 'assistant',
        text: response.data.reply,
        intent: response.data.intent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If chat is minimised, show unread indicator
      if (!isOpen) setHasUnread(true);

    } catch (error) {
      const errText = error.response?.data?.message || 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: errText,
        intent: 'UNKNOWN',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────── */}
      <button
        id="ai-chat-toggle"
        onClick={handleToggle}
        title="AI Hostel Assistant"
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isOpen
            ? 'bg-gray-700 rotate-0 scale-95'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-110 hover:shadow-indigo-200 hover:shadow-2xl'
          }
        `}
      >
        {isOpen
          ? <ChevronDown className="w-6 h-6 text-white" />
          : <Bot className="w-7 h-7 text-white" />
        }
        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Chat panel ────────────────────────────────────────────────── */}
      <div className={`
        fixed bottom-24 right-6 z-50
        w-[380px] max-h-[600px]
        bg-white rounded-2xl shadow-2xl border border-gray-100
        flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out origin-bottom-right
        ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
      `}>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Hostel Assistant</p>
              <p className="text-indigo-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                Powered by Groq
              </p>
            </div>
          </div>
          <button
            id="ai-chat-close"
            onClick={handleToggle}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0" style={{ maxHeight: '380px' }}>
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              text={msg.text}
              intent={msg.intent}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-sm text-gray-500">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts — shown only when it's just the greeting */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 pb-2 bg-gray-50 border-t border-gray-100 pt-2">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs bg-white border border-indigo-100 text-indigo-600 rounded-full px-3 py-1
                    hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-end">
          <textarea
            id="ai-chat-input"
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your hostel…"
            rows={1}
            maxLength={500}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
              disabled:opacity-50 bg-gray-50 placeholder-gray-400 text-gray-800
              max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            id="ai-chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600
              flex items-center justify-center text-white flex-shrink-0
              hover:opacity-90 transition-opacity
              disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer disclaimer */}
        <div className="px-4 pb-2 bg-white">
          <p className="text-center text-xs text-gray-400">
            AI may make mistakes. Always verify critical information.
          </p>
        </div>
      </div>
    </>
  );
}
