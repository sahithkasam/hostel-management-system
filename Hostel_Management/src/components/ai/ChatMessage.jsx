import React from 'react';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ role, text, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center self-end mb-4
        ${isUser
          ? 'bg-blue-600'
          : 'bg-gradient-to-br from-indigo-500 to-violet-600'
        }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-white" />
        }
      </div>

      {/* Bubble + timestamp */}
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
          }`}>
          {text}
        </div>
        {timestamp && (
          <span className="text-[11px] text-gray-400 px-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
