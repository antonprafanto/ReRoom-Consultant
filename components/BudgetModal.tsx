
import React from 'react';
import { X, Calculator, AlertCircle } from 'lucide-react';
import { BudgetEstimate } from '../types';
import { useUI } from '../contexts/UIContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BudgetEstimate | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, data }) => {
  const { t } = useUI();
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                        <Calculator size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('budget.title')}</h3>
                        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            Total: {data.currency}{data.totalCostLow.toLocaleString()} - {data.currency}{data.totalCostHigh.toLocaleString()}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {data.categories.map((cat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-800 dark:text-white text-lg">{cat.categoryName}</h4>
                                <span className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-mono font-medium">
                                    {data.currency}{cat.estimatedCostLow} - {data.currency}{cat.estimatedCostHigh}
                                </span>
                            </div>
                            
                            {/* Visual Bar */}
                            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, (cat.estimatedCostHigh / (data.totalCostHigh * 0.5 || 1)) * 100)}%`}}
                            ></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wide font-bold mb-1">{t('budget.included')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {cat.items.map((item, i) => (
                                        <span key={i} className="text-sm text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded-md">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                    </div>
                ))}
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-400">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>{data.disclaimer}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BudgetModal;
