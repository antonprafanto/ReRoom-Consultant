
import React from 'react';
import { X, Upload, Palette, MessageSquareText, Zap } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useUI();

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Upload size={24} />,
      title: t('help.step1Title'),
      desc: t('help.step1Desc'),
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
    },
    {
      icon: <Palette size={24} />,
      title: t('help.step2Title'),
      desc: t('help.step2Desc'),
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
    },
    {
      icon: <MessageSquareText size={24} />,
      title: t('help.step3Title'),
      desc: t('help.step3Desc'),
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
    },
    {
      icon: <Zap size={24} />,
      title: t('help.step4Title'),
      desc: t('help.step4Desc'),
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 transition-colors">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('help.title')}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-slate-950">
           {steps.map((step, idx) => (
             <div key={idx} className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                   {step.icon}
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                   <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
           >
             Got it
           </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;
