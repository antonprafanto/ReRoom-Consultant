
import React, { useState } from 'react';
import { Copy, Check, Palette } from 'lucide-react';

interface ColorPaletteProps {
  colors: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  if (colors.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
          <Palette size={18} />
        </div>
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          Suggested Palette
        </h4>
        <span className="text-xs text-gray-400 font-normal ml-auto">Click to copy hex</span>
      </div>
      
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(color)}
            className="group relative flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 focus:outline-none"
            title={`Copy ${color}`}
          >
            <div 
              className="w-14 h-14 rounded-full shadow-md border-2 border-white ring-1 ring-gray-100 relative flex items-center justify-center overflow-hidden transition-all group-hover:ring-indigo-200"
              style={{ backgroundColor: color }}
            >
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                {copiedColor === color ? <Check size={20} className="stroke-[3]" /> : <Copy size={20} />}
              </div>
            </div>
            
            <span className={`text-xs font-mono font-medium uppercase transition-colors ${copiedColor === color ? 'text-green-600' : 'text-gray-500 group-hover:text-indigo-600'}`}>
              {color}
            </span>
            
            {/* Tooltip for Copied */}
            {copiedColor === color && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl animate-in zoom-in duration-200 whitespace-nowrap z-10">
                Copied!
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
