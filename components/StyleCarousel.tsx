
import React, { useRef } from 'react';
import { DesignStyle } from '../types';
import { 
  Armchair, Sparkles, ChevronLeft, ChevronRight, 
  Home, Anchor, Palette, Gem, Mountain, Sprout, 
  Sun, Zap, Landmark, Factory, Feather, Box,
  Leaf, Loader2, Clock, BookOpen, Map, Crown, 
  Moon, Shuffle, Trees, Flower2, Shapes, BrickWall, 
  Clapperboard, Wheat, Cog,
  // New Icons
  Rocket, Tv, Music, Heart, Coffee, Award, Wind, Triangle, Utensils, Circle,
  // Even Newer Icons
  Tent, Snowflake, Hammer, CloudRain, Aperture, Droplet, Scroll, Radio, Activity, Diamond
} from 'lucide-react';

interface StyleCarouselProps {
  onSelectStyle: (style: DesignStyle) => void;
  selectedStyle?: string;
  disabled?: boolean;
  stylePreviews?: Record<string, string>;
}

const styles = Object.values(DesignStyle);

const getStyleIcon = (style: DesignStyle) => {
  switch (style) {
    case DesignStyle.Modern: return <Sparkles size={24} />;
    case DesignStyle.MidCenturyModern: return <Armchair size={24} />;
    case DesignStyle.Scandinavian: return <Feather size={24} />;
    case DesignStyle.Industrial: return <Factory size={24} />;
    case DesignStyle.Bohemian: return <Palette size={24} />;
    case DesignStyle.Minimalist: return <Box size={24} />;
    case DesignStyle.ArtDeco: return <Gem size={24} />;
    case DesignStyle.Coastal: return <Anchor size={24} />;
    case DesignStyle.Japandi: return <Sprout size={24} />;
    case DesignStyle.Farmhouse: return <Home size={24} />;
    case DesignStyle.Rustic: return <Mountain size={24} />;
    case DesignStyle.Glam: return <Gem size={24} />;
    case DesignStyle.Mediterranean: return <Sun size={24} />;
    case DesignStyle.Transitional: return <Armchair size={24} />;
    case DesignStyle.Maximalist: return <Palette size={24} />;
    case DesignStyle.Cyberpunk: return <Zap size={24} />;
    case DesignStyle.Neoclassic: return <Landmark size={24} />;
    case DesignStyle.Zen: return <Leaf size={24} />;
    // New Styles Icons
    case DesignStyle.Contemporary: return <Clock size={24} />;
    case DesignStyle.Traditional: return <BookOpen size={24} />;
    case DesignStyle.Southwestern: return <Map size={24} />;
    case DesignStyle.Victorian: return <Crown size={24} />;
    case DesignStyle.Gothic: return <Moon size={24} />;
    case DesignStyle.Eclectic: return <Shuffle size={24} />;
    case DesignStyle.Tropical: return <Trees size={24} />;
    case DesignStyle.ShabbyChic: return <Flower2 size={24} />;
    case DesignStyle.Bauhaus: return <Shapes size={24} />;
    case DesignStyle.Brutalist: return <BrickWall size={24} />;
    case DesignStyle.HollywoodRegency: return <Clapperboard size={24} />;
    case DesignStyle.FrenchCountry: return <Wheat size={24} />;
    case DesignStyle.Steampunk: return <Cog size={24} />;
    case DesignStyle.Biophilic: return <Trees size={24} />;
    // Newer Styles
    case DesignStyle.Cottagecore: return <Coffee size={24} />;
    case DesignStyle.Baroque: return <Music size={24} />;
    case DesignStyle.Rococo: return <Heart size={24} />;
    case DesignStyle.ArtNouveau: return <Wind size={24} />;
    case DesignStyle.Memphis: return <Triangle size={24} />;
    case DesignStyle.Vaporwave: return <Tv size={24} />;
    case DesignStyle.WabiSabi: return <Circle size={24} />;
    case DesignStyle.Preppy: return <Award size={24} />;
    case DesignStyle.SpaceAge: return <Rocket size={24} />;
    case DesignStyle.Tuscan: return <Utensils size={24} />;
    // Even Newer Styles
    case DesignStyle.Moroccan: return <Tent size={24} />;
    case DesignStyle.Chalet: return <Snowflake size={24} />;
    case DesignStyle.Craftsman: return <Hammer size={24} />;
    case DesignStyle.Noir: return <CloudRain size={24} />;
    case DesignStyle.PopArt: return <Aperture size={24} />;
    case DesignStyle.OrganicModern: return <Droplet size={24} />;
    case DesignStyle.DarkAcademia: return <Scroll size={24} />;
    case DesignStyle.Retro: return <Radio size={24} />;
    case DesignStyle.Parametric: return <Activity size={24} />;
    case DesignStyle.Luxe: return <Diamond size={24} />;
    default: return <Sparkles size={24} />;
  }
};

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onSelectStyle, selectedStyle, disabled, stylePreviews = {} }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Increased scroll amount for efficiency with larger list (approx 4 items)
      const scrollAmount = 600;
      const container = scrollContainerRef.current;
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full group/carousel">
      {/* Gradient Mask Left */}
      <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#F8FAFC] dark:from-slate-950 to-transparent z-10 pointer-events-none md:hidden" />
      
      {/* Left Button (Desktop) */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white dark:bg-slate-800 shadow-lg rounded-full text-gray-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 focus:opacity-100 -ml-3 border border-gray-100 dark:border-slate-700 hidden md:flex items-center justify-center transform hover:scale-110 active:scale-95"
        aria-label="Scroll left"
        type="button"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto py-2 no-scrollbar scroll-smooth px-1"
      >
        {styles.map((style) => {
          const isLoading = disabled && selectedStyle === style;
          const previewImage = stylePreviews[style];
          const isSelected = selectedStyle === style;

          return (
            <button
              key={style}
              onClick={() => onSelectStyle(style)}
              disabled={disabled}
              className={`
                relative group flex flex-col items-center rounded-xl border-2 transition-all duration-300 min-w-[140px] w-[140px] h-36 flex-shrink-0 overflow-hidden
                ${isSelected 
                  ? 'border-indigo-600 shadow-md transform scale-105 z-10' 
                  : 'border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-600 hover:shadow-sm'
                }
                ${!previewImage && !isSelected ? 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800' : 'bg-white dark:bg-slate-900'}
                ${disabled && !isLoading ? 'opacity-40 cursor-not-allowed' : ''}
                ${isLoading ? 'cursor-wait opacity-100' : (!disabled ? 'cursor-pointer' : '')}
              `}
            >
              {previewImage ? (
                <>
                  <img 
                    src={previewImage} 
                    alt={style} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isSelected ? 'opacity-80' : 'opacity-60 group-hover:opacity-80'}`} />
                  
                  {/* Content for Preview Mode */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-3 z-10">
                     {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                           <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                     )}
                     <span className="text-white font-semibold text-sm text-center leading-tight drop-shadow-md">
                        {style}
                     </span>
                  </div>
                  
                  {isSelected && !isLoading && (
                     <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,1)] animate-pulse" />
                  )}
                </>
              ) : (
                /* Standard Mode (No Preview) */
                <div className={`flex flex-col items-center justify-center w-full h-full p-3 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                   <div className={`
                    p-3 rounded-full mb-3 transition-colors duration-200 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-white'
                    }
                  `}>
                   {isLoading ? <Loader2 size={24} className="animate-spin" /> : getStyleIcon(style)}
                  </div>
                  <span className={`font-medium text-sm text-center leading-tight ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-slate-300'}`}>
                    {style}
                  </span>
                  
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                  
                  {isLoading && (
                     <span className="absolute bottom-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider animate-pulse">
                        Creating...
                     </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
        {/* Spacer for right padding */}
        <div className="w-2 flex-shrink-0" />
      </div>

      {/* Right Button (Desktop) */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white dark:bg-slate-800 shadow-lg rounded-full text-gray-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 focus:opacity-100 -mr-3 border border-gray-100 dark:border-slate-700 hidden md:flex items-center justify-center transform hover:scale-110 active:scale-95"
        aria-label="Scroll right"
        type="button"
      >
        <ChevronRight size={20} />
      </button>
      
      {/* Gradient Mask Right */}
      <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F8FAFC] dark:from-slate-950 to-transparent z-10 pointer-events-none md:hidden" />
    </div>
  );
};

export default StyleCarousel;
