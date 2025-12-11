
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Bot, User, Loader2, ShoppingBag, ExternalLink, Search, Calculator, DollarSign } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const { t } = useUI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white">{t('chat.title')}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t('chat.subtitle')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-950">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-slate-500 p-8">
            <SparklesIcon />
            <p className="mt-2 text-sm">{t('chat.emptyState')}</p>
            <p className="text-xs opacity-70">{t('chat.emptyStateSub')}</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Text Bubble */}
            {msg.text && (
              <div
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                  }
                  ${msg.isError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                `}
              >
                {msg.text}
              </div>
            )}

            {/* Shoppable Items Section */}
            {msg.shoppableItems && msg.shoppableItems.length > 0 && (
              <div className="mt-2 w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-xl p-3 shadow-md shadow-indigo-100/50 dark:shadow-none">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-700">
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-md text-indigo-600 dark:text-indigo-400">
                        <ShoppingBag size={14} />
                     </div>
                     <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">{t('chat.shoppable')}</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {msg.shoppableItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:border-indigo-100 dark:hover:border-slate-600 border border-transparent transition-all group">
                          <div>
                             <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{item.name}</div>
                             <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-snug">{item.description}</div>
                          </div>
                          
                          <div className="flex gap-2 mt-1">
                              <a 
                                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.name)}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-700 dark:text-slate-200 py-1.5 rounded hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                <Search size={12} /> Google
                              </a>
                              <a 
                                href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-700 dark:text-slate-200 py-1.5 rounded hover:border-orange-300 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                              >
                                <ExternalLink size={12} /> Amazon
                              </a>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Budget Estimate Section */}
            {msg.budgetEstimate && (
              <div className="mt-2 w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-0 shadow-md shadow-emerald-100/50 dark:shadow-none overflow-hidden">
                   <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-100 dark:bg-emerald-800 p-1.5 rounded-md text-emerald-700 dark:text-emerald-300">
                          <Calculator size={16} />
                        </div>
                        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{t('chat.estimate')}</span>
                      </div>
                      <div className="text-xs font-mono text-emerald-800 dark:text-emerald-200 bg-emerald-200/50 dark:bg-emerald-800/50 px-2 py-0.5 rounded">
                         {msg.budgetEstimate.currency}{msg.budgetEstimate.totalCostLow.toLocaleString()} - {msg.budgetEstimate.currency}{msg.budgetEstimate.totalCostHigh.toLocaleString()}
                      </div>
                   </div>

                   <div className="p-4 space-y-4">
                      {msg.budgetEstimate.categories.map((cat, idx) => (
                        <div key={idx} className="text-sm">
                           <div className="flex justify-between mb-1">
                              <span className="font-semibold text-gray-800 dark:text-slate-200">{cat.categoryName}</span>
                              <span className="text-gray-600 dark:text-slate-400 font-mono text-xs">{msg.budgetEstimate?.currency}{cat.estimatedCostLow} - {cat.estimatedCostHigh}</span>
                           </div>
                           <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full opacity-60" 
                                style={{ width: `${(cat.estimatedCostHigh / (msg.budgetEstimate?.totalCostHigh || 1)) * 100}%`}}
                              ></div>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-slate-500 leading-snug">
                             {t('budget.included')}: {cat.items.join(', ')}
                           </p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/30 border-t dark:border-slate-800 text-[10px] text-gray-400 italic text-center">
                     {msg.budgetEstimate.disclaimer}
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={18} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={isProcessing}
            className="flex-1 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

const SparklesIcon = () => (
  <svg 
    className="w-12 h-12 text-gray-300 dark:text-slate-600" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" />
  </svg>
);

export default ChatInterface;
