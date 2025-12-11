
import React from 'react';
import { X, HardHat, Calendar, Hammer, AlertTriangle, Layers, Clock } from 'lucide-react';
import { ProjectSpecs } from '../types';
import { useUI } from '../contexts/UIContext';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProjectSpecs | null;
}

const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose, data }) => {
  const { t } = useUI();
  if (!isOpen || !data) return null;

  const difficultyColor = {
    'Low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'High': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="fixed inset-0 z-[70] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center">
                        <HardHat size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('specs.title')}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t('specs.subtitle')}</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* 1. Overview Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                            <Clock size={24} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data.totalDurationWeeks} <span className="text-sm font-normal text-gray-500">{t('specs.weeks')}</span>
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">{t('specs.timeline')}</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                            <AlertTriangle size={24} />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold mb-1 ${difficultyColor[data.difficultyLevel]}`}>
                            {data.difficultyLevel}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-bold">{t('specs.difficulty')}</div>
                    </div>
                </div>

                {/* 2. Materials List */}
                <div>
                     <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-gray-800 dark:text-white uppercase tracking-wide text-sm">{t('specs.materials')}</h4>
                    </div>
                    <div className="space-y-3">
                        {data.materials.map((mat, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                                <div>
                                    <span className="font-semibold text-gray-800 dark:text-slate-200 block">{mat.item}</span>
                                    <span className="text-sm text-gray-500 dark:text-slate-400">{mat.specification}</span>
                                </div>
                                {mat.quantityEst && (
                                    <span className="mt-1 sm:mt-0 text-xs font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded self-start sm:self-center text-gray-600 dark:text-slate-300 whitespace-nowrap">
                                        {mat.quantityEst}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Work Schedule Timeline */}
                <div>
                     <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-gray-800 dark:text-white uppercase tracking-wide text-sm">{t('specs.timeline')}</h4>
                    </div>
                    <div className="relative border-l-2 border-indigo-100 dark:border-slate-700 ml-3 space-y-6 pb-2">
                        {data.workSteps.map((step, i) => (
                            <div key={i} className="relative pl-6">
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500"></div>
                                
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                     <h5 className="font-bold text-gray-900 dark:text-white text-base">{step.phase}</h5>
                                     <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                        {step.durationDays} {t('specs.days')}
                                     </span>
                                </div>
                                
                                <ul className="space-y-1">
                                    {step.tasks.map((task, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600 flex-shrink-0"></span>
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Contractor Note */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-400">
                    <Hammer size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="block mb-1 font-semibold">{t('specs.contractorNote')}:</strong>
                        {data.contractorNote}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default SpecsModal;
