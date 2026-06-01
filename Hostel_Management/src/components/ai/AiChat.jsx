import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, ChevronDown, LayoutGrid, Building2,
  DollarSign, Wrench, Info, Users, Trash2, ChevronRight
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import ChatMessage from './ChatMessage';

const QUERY_MENU = {
  student: [
    {
      id: 'room',
      label: 'My Room',
      Icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      prompts: [
        'What room am I allocated to?',
        'When did I check in?',
        'What amenities does my room have?',
        'What floor is my room on?',
      ],
    },
    {
      id: 'fees',
      label: 'Fees & Rent',
      Icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      prompts: [
        'What is my monthly rent?',
        'How much do I owe in total?',
        'What fees are currently due?',
      ],
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      Icon: Wrench,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      prompts: [
        'How do I request a maintenance fix?',
        'Who do I contact for repairs?',
        'What is the maintenance process?',
      ],
    },
    {
      id: 'general',
      label: 'General',
      Icon: Info,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      prompts: [
        'What are the hostel visiting hours?',
        'What is the WiFi policy?',
        'How do I contact the hostel admin?',
      ],
    },
  ],
  admin: [
    {
      id: 'rooms',
      label: 'Rooms',
      Icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      prompts: [
        'How many rooms are currently vacant?',
        'Show available single rooms',
        'Show available double rooms',
        'List rooms available on floor 1',
      ],
    },
    {
      id: 'allocations',
      label: 'Allocations',
      Icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      prompts: [
        'How many active allocations are there?',
        'Show total active student count',
        'Give me an allocation summary',
      ],
    },
    {
      id: 'finances',
      label: 'Finances',
      Icon: DollarSign,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      prompts: [
        'What is the total monthly rent roll?',
        'Show overall revenue summary',
        'How much rent is collected monthly?',
      ],
    },
    {
      id: 'general',
      label: 'General',
      Icon: Info,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      prompts: [
        'What are the hostel visiting hours?',
        'What is the WiFi policy for residents?',
        'Show hostel contact information',
      ],
    },
  ],
};

function buildGreeting(user) {
  if (!user) return "Hello! I'm your Hostel Assistant. How can I help you today?";
  if (user.role === 'admin') {
    return `Hello, ${user.name}! I'm your Hostel Admin Assistant. I can help you check room availability, review allocations, view financial summaries, and more. What would you like to know?`;
  }
  return `Hello, ${user.name}! I'm your Hostel Assistant. I can help you with your room details, rent information, maintenance requests, and general hostel info. What can I help you with?`;
}

export default function AiChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showQueryMenu, setShowQueryMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || 'student';
  const categories = QUERY_MENU[role];
  const quickPrompts = [
    categories[0].prompts[0],
    categories[1].prompts[0],
    categories[2].prompts[0],
    categories[3].prompts[0],
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      if (messages.length === 0 && user) {
        setMessages([{ role: 'assistant', text: buildGreeting(user), timestamp: new Date() }]);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, user]);

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    setShowQueryMenu(false);
  };

  const clearConversation = () => {
    setMessages(user ? [{ role: 'assistant', text: buildGreeting(user), timestamp: new Date() }] : []);
    setShowQueryMenu(false);
    setActiveCategory(null);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setShowQueryMenu(false);
    setActiveCategory(null);
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const { data } = await api.post('/api/ai/chat', { message: userText });
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.reply,
        timestamp: new Date(),
      }]);
    } catch (err) {
      const errText = err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: errText, timestamp: new Date() }]);
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

  const activePrompts = categories.find(c => c.id === activeCategory)?.prompts ?? [];

  return (
    <>
      {/* ── Floating toggle button ───────────────────────────────────── */}
      <button
        onClick={handleToggle}
        title="Hostel Assistant"
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isOpen
            ? 'bg-slate-700 scale-95'
            : 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:scale-110 hover:shadow-indigo-200 hover:shadow-2xl'
          }
        `}
      >
        {isOpen
          ? <ChevronDown className="w-6 h-6 text-white" />
          : <Bot className="w-6 h-6 text-white" />
        }
        {hasUnread && !isOpen && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-24 right-6 z-50
          w-[400px] flex flex-col
          bg-white rounded-2xl shadow-2xl border border-gray-200
          transition-all duration-300 ease-in-out origin-bottom-right overflow-hidden
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ height: '600px', maxHeight: 'calc(100vh - 140px)' }}
      >

        {/* Header */}
        <div className="flex-none bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Hostel Assistant</p>
            <p className="text-indigo-200 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              {role === 'admin' ? 'Admin mode · Powered by Groq' : 'Student mode · Powered by Groq'}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={clearConversation}
              title="Clear conversation"
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggle}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 min-h-0 space-y-3">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Quick prompts — visible only on the opening greeting */}
          {messages.length === 1 && !isLoading && !showQueryMenu && (
            <div className="pt-1">
              <p className="text-xs text-gray-400 font-medium mb-2">Try asking:</p>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-sm bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2
                      hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700
                      transition-colors text-left leading-snug"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query menu panel */}
        {showQueryMenu && (
          <div className="flex-none border-t border-gray-100 bg-white">
            {/* Category tabs */}
            <div className="flex gap-1 px-2 pt-2 overflow-x-auto scrollbar-none">
              {categories.map(({ id, label, Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(prev => prev === id ? null : id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                    whitespace-nowrap border transition-colors flex-shrink-0
                    ${activeCategory === id
                      ? color
                      : 'text-gray-500 bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Sub-prompts */}
            {activeCategory ? (
              <div className="px-2 pt-1 pb-2 space-y-0.5 max-h-44 overflow-y-auto">
                {activePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="w-full flex items-center gap-2 text-sm text-gray-700 text-left px-3 py-2
                      rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-3">Select a category above</p>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex-none px-3 pt-2 pb-2.5 bg-white border-t border-gray-100">
          <div className="flex items-end gap-2">
            <button
              onClick={() => { setShowQueryMenu(prev => !prev); setActiveCategory(null); }}
              title="Browse topics"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0
                ${showQueryMenu
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
            >
              <LayoutGrid className="w-[18px] h-[18px]" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your hostel…"
              rows={1}
              maxLength={500}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                disabled:opacity-50 bg-gray-50 placeholder-gray-400 text-gray-800 leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '112px', overflowY: 'auto' }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600
                flex items-center justify-center text-white flex-shrink-0
                hover:opacity-90 transition-opacity shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-1.5">
            AI may make mistakes · verify important info with admin
          </p>
        </div>

      </div>
    </>
  );
}
