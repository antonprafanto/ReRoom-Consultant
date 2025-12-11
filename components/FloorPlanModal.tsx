
import React from 'react';
import { X, Map, Download, AlertCircle } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { downloadImage } from '../utils/downloadUtils';

interface FloorPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlanImage: string | null;
}

const FloorPlanModal: React.FC<FloorPlanModalProps> = ({ isOpen, onClose, floorPlanImage }) => {
  const { t } = useUI();
  
  if (!isOpen || !floorPlanImage) return null;

  const handleDownload = () => {
    downloadImage(floorPlanImage, `reroom-floorplan-${Date.now()}.jpg`);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                        <Map size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           {t('floorPlan.title')} 
                           <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full uppercase tracking-wide border border-orange-200 dark:border-orange-800">Beta</span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t('floorPlan.subtitle')}</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 dark:bg-slate-950 flex flex-col items-center">
                <div className="relative w-full aspect-square md:aspect-video bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-6">
                    <img 
                        src={floorPlanImage} 
                        alt="Floor Plan" 
                        className="w-full h-full object-contain p-4" 
                    />
                </div>
                
                <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300 mb-6">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>{t('floorPlan.description')}</p>
                </div>

                <button 
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                >
                    <Download size={18} />
                    {t('floorPlan.download')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default FloorPlanModal;
