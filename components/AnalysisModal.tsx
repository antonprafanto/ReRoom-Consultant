
import React from 'react';
import { X, ScanEye, CheckCircle2, XCircle, Lightbulb, MoveRight } from 'lucide-react';
import { RoomAnalysis } from '../types';
import { useUI } from '../contexts/UIContext';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RoomAnalysis | null;
  onAskAI?: (question: string) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, data, onAskAI }) => {
  const { t } = useUI();
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-sm">
                    <ScanEye size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{t('analysis.title')}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t('analysis.subtitle')}</p>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950 p-8">
            
            {/* 1. Scores Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { label: t('analysis.lighting'), score: data.lightingScore, color: '#F59E0B' }, // Amber
                  { label: t('analysis.layout'), score: data.layoutScore, color: '#3B82F6' }, // Blue
                  { label: t('analysis.harmony'), score: data.colorHarmonyScore, color: '#EC4899' }, // Pink
                ].map((item, i) => {
                   // SVG Circle Logic
                   const radius = 42;
                   const circumference = 2 * Math.PI * radius;
                   const strokeDashoffset = circumference - (item.score / 10) * circumference;
                   
                   return (
                      <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                         <div className="relative w-32 h-32 mb-4">
                             <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                                {/* Track */}
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  stroke="#F3F4F6" 
                                  className="dark:stroke-slate-800"
                                  strokeWidth="8" 
                                  fill="transparent" 
                                />
                                {/* Indicator */}
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  stroke={item.color} 
                                  strokeWidth="8" 
                                  fill="transparent" 
                                  strokeDasharray={circumference} 
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-3xl font-bold text-gray-800 dark:text-white leading-none">{item.score}</span>
                                 <span className="text-[10px] text-gray-400 font-medium uppercase mt-1">/ 10</span>
                             </div>
                         </div>
                         <h4 className="text-base font-semibold text-gray-700 dark:text-slate-300">{item.label}</h4>
                      </div>
                   );
                })}
            </div>

            {/* 2. Detailed Pros & Cons */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* What Works */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50" />
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{t('analysis.works')}</h4>
                   </div>
                   <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 overflow-hidden">
                      {data.pros.map((pro, i) => (
                        <div key={i} className="p-4 border-b border-gray-50 dark:border-slate-800 last:border-0 flex gap-3 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                           <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                           <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{pro}</p>
                        </div>
                      ))}
                   </div>
                </div>

                {/* To Improve */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <XCircle size={20} className="text-rose-500 fill-rose-50" />
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{t('analysis.improve')}</h4>
                   </div>
                   <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/50 overflow-hidden">
                      {data.cons.map((con, i) => (
                        <div key={i} className="p-4 border-b border-gray-50 dark:border-slate-800 last:border-0 flex gap-3 hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                           <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                           <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{con}</p>
                        </div>
                      ))}
                   </div>
                </div>
            </div>

            {/* 3. Quick Wins */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                     <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                         <Lightbulb size={20} className="fill-amber-400 stroke-amber-600 dark:stroke-amber-400" />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-900 dark:text-white text-lg">{t('analysis.quickWins')}</h4>
                         <p className="text-xs text-gray-500 dark:text-slate-400">High impact changes with low effort</p>
                     </div>
                </div>
                
                <div className="grid gap-4">
                   {data.quickTips.map((tip, i) => (
                      <div key={i} className="group bg-gradient-to-r from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4 transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center flex-shrink-0 shadow-sm text-sm">
                              {i + 1}
                          </div>
                          <div className="flex-1">
                              <p className="text-gray-800 dark:text-slate-200 font-medium leading-relaxed">{tip}</p>
                              {onAskAI && (
                                <button 
                                  onClick={() => {
                                      onClose();
                                      onAskAI(`How do I implement this tip: "${tip}"?`);
                                  }}
                                  className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                >
                                   Ask AI how to do this <MoveRight size={12} />
                                </button>
                              )}
                          </div>
                      </div>
                   ))}
                </div>
            </div>
            
            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-center">
                <p className="text-xs text-gray-400 italic">Generated by Gemini 2.5 Flash • Analysis based on visual elements only</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
