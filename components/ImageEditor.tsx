
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCw, Sun, Contrast as ContrastIcon, Undo2, Check, Crop as CropIcon, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export type ToolTab = 'adjust' | 'crop';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (newImageSrc: string) => void;
  onCancel: () => void;
  initialTab?: ToolTab;
}

interface CropRect {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
}

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '3:4', value: 3/4 },
  { label: '16:9', value: 16/9 },
  { label: '9:16', value: 9/16 },
];

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel, initialTab = 'adjust' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Ensure initialTab is valid, fallback to adjust if it was eraser
  const safeInitialTab = (initialTab === 'crop') ? 'crop' : 'adjust';

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<ToolTab>(safeInitialTab);

  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // View Transform State (Zoom/Pan)
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs for Panning Math
  const panStartRef = useRef({ x: 0, y: 0 });
  const translateStartRef = useRef({ x: 0, y: 0 });

  // Crop State
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Interaction State
  const [dragState, setDragState] = useState<{
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    startCrop: CropRect;
    containerW: number;
    containerH: number;
  } | null>(null);
  
  const [activeSlider, setActiveSlider] = useState<'brightness' | 'contrast' | null>(null);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => setImgElement(img);
  }, [imageSrc]);

  // Draw Base Image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90or270 = rotation % 180 !== 0;
    const originalWidth = imgElement.naturalWidth;
    const originalHeight = imgElement.naturalHeight;

    // Set canvas dimensions to match image natural size (swapped if rotated)
    if (isRotated90or270) {
      canvas.width = originalHeight;
      canvas.height = originalWidth;
    } else {
      canvas.width = originalWidth;
      canvas.height = originalHeight;
    }

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imgElement, -originalWidth / 2, -originalHeight / 2);
    ctx.restore();

  }, [imgElement, brightness, contrast, rotation]);

  // --- Zoom & Pan Handlers ---

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.deltaY !== 0) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setScale(prev => Math.max(0.5, Math.min(5, prev * (1 + delta * 2))));
    }
  };

  // --- Input Handlers (Unified) ---

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
     const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
     const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

     if (activeTab === 'crop' && crop) {
         setIsPanning(true);
         panStartRef.current = { x: clientX, y: clientY };
         translateStartRef.current = { ...translate };
     } else {
         // Default Pan
         setIsPanning(true);
         panStartRef.current = { x: clientX, y: clientY };
         translateStartRef.current = { ...translate };
     }
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    if (isPanning) {
      e.preventDefault();
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;
      setTranslate({
        x: translateStartRef.current.x + dx,
        y: translateStartRef.current.y + dy
      });
      return;
    }

    // Crop Resize Logic
    if (dragState && containerRef.current) {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const relX = clientX - rect.left;
        const relY = clientY - rect.top;
        
        const dxPx = relX - dragState.startX;
        const dyPx = relY - dragState.startY;

        const currentW = dragState.containerW;
        const currentH = dragState.containerH;
        
        const dx = (dxPx / currentW) * 100;
        const dy = (dyPx / currentH) * 100;

        let newCrop = { ...dragState.startCrop };
        const minSize = 5; 

        if (dragState.type === 'move') {
            newCrop.x = Math.min(Math.max(newCrop.x + dx, 0), 100 - newCrop.width);
            newCrop.y = Math.min(Math.max(newCrop.y + dy, 0), 100 - newCrop.height);
        } else {
             if (dragState.type.includes('w')) {
                 const maxDelta = newCrop.width - minSize;
                 const delta = Math.min(Math.max(dx, -newCrop.x), maxDelta);
                 newCrop.x += delta;
                 newCrop.width -= delta;
             }
             if (dragState.type.includes('e')) {
                 const maxDelta = 100 - newCrop.x - newCrop.width;
                 const delta = Math.min(dx, maxDelta);
                 newCrop.width = Math.max(newCrop.width + delta, minSize);
             }
             if (dragState.type.includes('n')) {
                 const maxDelta = newCrop.height - minSize;
                 const delta = Math.min(Math.max(dy, -newCrop.y), maxDelta);
                 newCrop.y += delta;
                 newCrop.height -= delta;
             }
             if (dragState.type.includes('s')) {
                 const maxDelta = 100 - newCrop.y - newCrop.height;
                 const delta = Math.min(dy, maxDelta);
                 newCrop.height = Math.max(newCrop.height + delta, minSize);
             }
        }
        setCrop(newCrop);
    }
  }, [isPanning, activeTab, dragState]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    setDragState(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);


  // --- Logic for Tabs ---
  
  const switchTab = (tab: ToolTab) => {
      setActiveTab(tab);
      if (tab === 'crop' && !crop) {
          handleRatioChange(null); // Init crop
      }
      if (tab !== 'crop') {
          setCrop(null); // Clear crop when leaving
      }
  };

  // --- Helper for Crop ---
  const handleRatioChange = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (!canvasRef.current) return;
    
    // Only init crop if not exists or if switching to a forced ratio
    if (ratio === null && crop) return;

    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;
    const canvasRatio = cw / ch;
    const effectiveRatio = ratio || canvasRatio;

    let w = 80, h = 80;
    if (effectiveRatio > canvasRatio) {
      w = 80; 
      h = ( (cw * 0.8) / effectiveRatio / ch ) * 100;
    } else {
      h = 80;
      w = ( (ch * 0.8) * effectiveRatio / cw ) * 100;
    }

    setCrop({
      x: (100 - w) / 2,
      y: (100 - h) / 2,
      width: w,
      height: h
    });
  };

  const handleCropDown = (e: React.MouseEvent | React.TouchEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    if (!crop || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const rect = containerRef.current.getBoundingClientRect();

    setDragState({
      type,
      startX: clientX - rect.left,
      startY: clientY - rect.top,
      startCrop: { ...crop },
      containerW: rect.width,
      containerH: rect.height
    });
  };

  // --- Final Save ---
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!crop) {
       onSave(canvas.toDataURL('image/jpeg', 0.95));
       return;
    }

    const tempCanvas = document.createElement('canvas');
    const sx = (crop.x / 100) * canvas.width;
    const sy = (crop.y / 100) * canvas.height;
    const sw = (crop.width / 100) * canvas.width;
    const sh = (crop.height / 100) * canvas.height;

    tempCanvas.width = sw;
    tempCanvas.height = sh;
    
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
       ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
       onSave(tempCanvas.toDataURL('image/jpeg', 0.95));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Edit Photo
          </h3>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:rotate-90 duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col items-center justify-center select-none touch-none">
           
           {/* Viewport for Zoom/Pan */}
           <div 
             ref={viewportRef}
             className={`w-full h-full flex items-center justify-center overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
             onWheel={handleWheel}
             onMouseDown={handlePointerDown}
             onTouchStart={handlePointerDown}
           >
             <div 
                ref={containerRef} 
                className="relative shadow-2xl inline-block transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transformOrigin: 'center center'
                }}
             >
                <canvas ref={canvasRef} className="block max-w-[80vw] max-h-[60vh] object-contain" />
                
                {/* Overlay for Crop */}
                {activeTab === 'crop' && crop && (
                  <div 
                    className={`absolute border-2 z-20 transition-colors duration-150 ${dragState?.type === 'move' ? 'border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]' : 'border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]'}`}
                    style={{
                      left: `${crop.x}%`,
                      top: `${crop.y}%`,
                      width: `${crop.width}%`,
                      height: `${crop.height}%`,
                      cursor: 'move',
                      touchAction: 'none'
                    }}
                    onMouseDown={(e) => handleCropDown(e, 'move')}
                    onTouchStart={(e) => handleCropDown(e, 'move')}
                  >
                     <div className={`absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none transition-opacity duration-200 ${dragState ? 'opacity-80' : 'opacity-30'}`}>
                        <div className="border-r border-white/50" />
                        <div className="border-r border-white/50" />
                        <div className="border-t border-white/50 col-span-3 row-start-2" />
                        <div className="border-t border-white/50 col-span-3 row-start-3" />
                     </div>
                     {[
                       { type: 'nw', cursor: 'cursor-nw-resize', pos: '-left-3 -top-3' },
                       { type: 'ne', cursor: 'cursor-ne-resize', pos: '-right-3 -top-3' },
                       { type: 'sw', cursor: 'cursor-sw-resize', pos: '-left-3 -bottom-3' },
                       { type: 'se', cursor: 'cursor-se-resize', pos: '-right-3 -bottom-3' }
                     ].map((handle) => (
                       <div 
                          key={handle.type}
                          className={`absolute w-6 h-6 bg-indigo-600 border-2 border-white rounded-full ${handle.cursor} z-30 ${handle.pos} transition-transform duration-200 shadow-sm ${dragState?.type === handle.type ? 'scale-125' : 'hover:scale-110'}`}
                          style={{ transform: `scale(${1/scale})` }} 
                          onMouseDown={(e) => { handleCropDown(e, handle.type as any); }} 
                          onTouchStart={(e) => { handleCropDown(e, handle.type as any); }} 
                       />
                     ))}
                  </div>
                )}
             </div>
           </div>
           
           {/* Floating Zoom Controls */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-lg border border-gray-200 rounded-full px-4 py-2 flex items-center gap-4 z-40">
              <button onClick={() => handleZoom(-0.25)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-indigo-600 transition-colors" title="Zoom Out">
                 <ZoomOut size={18} />
              </button>
              <span className="text-xs font-mono font-medium text-gray-500 min-w-[3rem] text-center">
                 {Math.round(scale * 100)}%
              </span>
              <button onClick={() => handleZoom(0.25)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-indigo-600 transition-colors" title="Zoom In">
                 <ZoomIn size={18} />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button onClick={resetView} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-indigo-600 transition-colors" title="Fit to Screen">
                 <Maximize size={18} />
              </button>
           </div>

        </div>

        {/* Toolbar Tabs */}
        <div className="bg-white border-t z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => switchTab('adjust')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'adjust' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    <Sun size={16} /> Adjust
                </button>
                <button 
                  onClick={() => switchTab('crop')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'crop' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    <CropIcon size={16} /> Crop & Rotate
                </button>
            </div>

            <div className="p-6 h-40">
                {activeTab === 'adjust' && (
                    <div className="grid grid-cols-2 gap-4 h-full items-center">
                        {/* Brightness */}
                        <div className={`space-y-2 p-3 rounded-xl transition-all duration-200 border ${activeSlider === 'brightness' || brightness !== 100 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                            <div className="flex justify-between text-xs font-medium">
                            <span className={`flex items-center gap-1.5 transition-colors ${brightness !== 100 ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                                <Sun size={14} className={brightness !== 100 ? "fill-indigo-300 stroke-indigo-600" : ""} /> Brightness
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${brightness !== 100 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                {brightness}%
                            </span>
                            </div>
                            <input 
                            type="range" min="50" max="150" value={brightness} 
                            onMouseDown={() => setActiveSlider('brightness')} onMouseUp={() => setActiveSlider(null)}
                            onTouchStart={() => setActiveSlider('brightness')} onTouchEnd={() => setActiveSlider(null)}
                            onChange={(e) => setBrightness(Number(e.target.value))} 
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                            />
                        </div>
                        {/* Contrast */}
                        <div className={`space-y-2 p-3 rounded-xl transition-all duration-200 border ${activeSlider === 'contrast' || contrast !== 100 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                            <div className="flex justify-between text-xs font-medium">
                            <span className={`flex items-center gap-1.5 transition-colors ${contrast !== 100 ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                                <ContrastIcon size={14} className={contrast !== 100 ? "fill-indigo-300 stroke-indigo-600" : ""} /> Contrast
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${contrast !== 100 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                {contrast}%
                            </span>
                            </div>
                            <input 
                            type="range" min="50" max="150" value={contrast} 
                            onMouseDown={() => setActiveSlider('contrast')} onMouseUp={() => setActiveSlider(null)}
                            onTouchStart={() => setActiveSlider('contrast')} onTouchEnd={() => setActiveSlider(null)}
                            onChange={(e) => setContrast(Number(e.target.value))} 
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'crop' && (
                    <div className="flex items-center gap-6 h-full">
                        <div className="flex-1 overflow-x-auto no-scrollbar pb-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-2">
                                Ratio
                            </label>
                            <div className="flex gap-2">
                                {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.label}
                                    onClick={() => handleRatioChange(ratio.value)}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg flex-1 whitespace-nowrap transition-all duration-200 ${
                                    (ratio.value === aspectRatio) || (ratio.value === null && aspectRatio === null && !crop)
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                                    }`}
                                >
                                    {ratio.label}
                                </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={() => { setRotation((prev) => (prev + 90) % 360); setCrop(null); }} 
                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                        >
                            <RotateCw size={18} /> Rotate
                        </button>
                    </div>
                )}
            </div>
            
             {/* Footer Actions */}
             <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                 <button 
                    onClick={() => {
                        setBrightness(100); setContrast(100); setRotation(0); setCrop(null); setAspectRatio(null); resetView();
                    }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-all"
                >
                    <Undo2 size={16} /> Reset All
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Check size={18} /> Apply Changes
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
