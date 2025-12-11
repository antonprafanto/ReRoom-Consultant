
import React, { useState, useEffect } from 'react';
import { Home, Scan, Search, Sparkles } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

const RoomDetectionLoader: React.FC = () => {
  const { t, language } = useUI();
  const [stepIndex, setStepIndex] = useState(0);

  // Get localized steps
  // We match the translations.ts file update here
  
  const loadingSteps = language === 'id' 
    ? [
        "Mengintip dari lubang kunci...",
        "Menganalisa furnitur...",
        "Mengukur dinding...",
        "Hmm, apakah itu kursi antik?",
        "Memeriksa pencahayaan...",
        "Sedikit lagi..."
      ]
    : [
        "Peeking through the keyhole...",
        "Identifying furniture...",
        "Measuring the walls...",
        "Is that a vintage chair?",
        "Checking lighting sources...",
        "Almost there..."
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1800); // Change text every 1.8 seconds

    return () => clearInterval(interval);
  }, [loadingSteps.length]);

  return (
    <div className="fixed inset-0 z-[90] bg-white/80 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Animation Container */}
      <div className="relative w-32 h-32 mb-8">
        
        {/* House Icon (Base) */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-slate-700">
          <Home size={64} strokeWidth={1.5} />
        </div>

        {/* Scanning Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full animate-pulse">
           <div className="w-full h-full bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent absolute top-0 -translate-y-full animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        {/* Magnifying Glass (Moving) */}
        <div className="absolute inset-0 flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
             <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
                <Search size={32} />
             </div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2">
                <Sparkles size={16} className="text-amber-400 fill-amber-200" />
            </div>
        </div>
      </div>

      {/* Text Container */}
      <div className="text-center max-w-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('loading.detecting')}
        </h3>
        
        {/* Animated Funny Text */}
        <div className="h-8 relative overflow-hidden">
             <p 
                key={stepIndex} 
                className="text-indigo-600 dark:text-indigo-400 font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 absolute w-full left-0 right-0"
             >
                {loadingSteps[stepIndex]}
             </p>
        </div>
      </div>

      {/* Styles for custom keyframes that Tailwind might not have by default */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default RoomDetectionLoader;
