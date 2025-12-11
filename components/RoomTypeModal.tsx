
import React, { useState } from 'react';
import { Home, Tag, ChevronRight, RefreshCw } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface RoomTypeModalProps {
  isOpen: boolean;
  onSubmit: (type: string) => void;
  onRetake?: () => void; // Added onRetake prop
}

const RoomTypeModal: React.FC<RoomTypeModalProps> = ({ isOpen, onSubmit, onRetake }) => {
  const { t } = useUI();
  const [customType, setCustomType] = useState('');

  if (!isOpen) return null;

  const commonTypes = [
    "Living Room", "Bedroom", "Kitchen", 
    "Dining Room", "Home Office", "Bathroom",
    "Studio", "Attic", "Garage"
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (customType.trim()) {
      onSubmit(customType.trim());
      setCustomType('');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 transition-colors">
        
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Home size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('roomDetection.title')}</h3>
            </div>
            
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
               {t('roomDetection.description')}
            </p>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                {commonTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => onSubmit(type)}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                        <Tag size={12} /> {type}
                    </button>
                ))}
            </div>

            {/* Manual Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-2 block">
                        {t('roomDetection.label')}
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            placeholder={t('roomDetection.placeholder')}
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!customType.trim()}
                            className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Retake Button for invalid photos - ENLARGED */}
                {onRetake && (
                    <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onRetake}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/30 transition-all text-sm"
                        >
                            <RefreshCw size={18} />
                            {t('preview.retake')}
                        </button>
                    </div>
                )}
            </form>
        </div>

      </div>
    </div>
  );
};

export default RoomTypeModal;
