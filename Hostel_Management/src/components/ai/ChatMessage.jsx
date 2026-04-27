import React from 'react';
import { Bot, User, ShieldCheck, AlertTriangle, BrainCircuit } from 'lucide-react';

/**
 * ChatMessage — renders a single conversation bubble.
 * Props:
 *   role: 'user' | 'assistant'
 *   text: string
 *   intent: string | null
 *   timestamp: Date
 *   confidence: number | null
 *   source: string | null
 *   safetyFlags: string[] | null
 */
export default function ChatMessage({ role, text, intent, timestamp, confidence, source, safetyFlags }) {
  const isUser = role === 'user';

  const intentColors = {
    FIND_VACANT_ROOMS:   'bg-green-100 text-green-700',
    VIEW_ALLOCATION:     'bg-blue-100 text-blue-700',
    PENDING_FEES:        'bg-yellow-100 text-yellow-700',
    MAINTENANCE_REQUEST: 'bg-orange-100 text-orange-700',
    GENERAL_INFO:        'bg-purple-100 text-purple-700',
    UNKNOWN:             'bg-gray-100 text-gray-600',
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.9) return 'High confidence';
    if (score >= 0.7) return 'Medium confidence';
    if (score > 0) return 'Low confidence';
    return null;
  };

  const confidenceLabel = getConfidenceLabel(confidence);

  const SourceIcon = ({ source }) => {
    switch (source) {
      case 'AI_MODEL':
        return <BrainCircuit className="w-3 h-3 text-gray-400" />;
      case 'FAQ_RULE':
      case 'FAQ_CACHE':
        return <ShieldCheck className="w-3 h-3 text-green-500" />;
      case 'SAFETY_GUARD':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const sourceLabel = source?.replace(/_/g, ' ') || '';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
        ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
          }`}>
          {text}
        </div>

        {/* Meta info: intent, confidence, source */}
        {!isUser && (
          <div className="flex items-center gap-2 flex-wrap">
            {intent && intent !== 'UNKNOWN' && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intentColors[intent] || 'bg-gray-100 text-gray-600'}`}>
                {intent.replace(/_/g, ' ')}
              </span>
            )}

            {confidenceLabel && (
              <span className="text-xs text-gray-400" title={`Confidence score: ${confidence?.toFixed(2)}`}>
                {confidenceLabel}
              </span>
            )}

            {source && (
              <div className="flex items-center gap-1 text-xs text-gray-400" title={`Source: ${sourceLabel}`}>
                <SourceIcon source={source} />
                <span>{sourceLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-400">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
