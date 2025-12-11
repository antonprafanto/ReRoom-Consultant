
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Camera, ArrowRight, Wand2, Sparkles, SlidersHorizontal, Image as ImageIcon, Plus, X, Trash2, AlertCircle, RefreshCw, Dice5, Save, FolderOpen, Calendar, Clock, Download, FileImage, Columns, ChevronDown, Calculator, DollarSign, ScanEye, CheckCircle2, XCircle, Lightbulb, MoveRight, Palette, FileText, Settings, Globe, Moon, Sun, Map, HelpCircle, Pencil, Heart, MessageSquareText, Ruler, Wallet, Banknote, HardHat, Eye } from 'lucide-react';
import { Message, DesignStyle, ShoppableItem, SavedDesign, BudgetEstimate, RoomAnalysis, ProjectSpecs } from './types';
import CompareSlider from './components/CompareSlider';
import StyleCarousel from './components/StyleCarousel';
import ChatInterface from './components/ChatInterface';
import LoadingSpinner from './components/LoadingSpinner';
import ImageEditor, { ToolTab } from './components/ImageEditor';
import ColorPalette from './components/ColorPalette';
import AnalysisModal from './components/AnalysisModal';
import BudgetModal from './components/BudgetModal';
import FloorPlanModal from './components/FloorPlanModal';
import SpecsModal from './components/SpecsModal';
import HelpModal from './components/HelpModal';
import RoomTypeModal from './components/RoomTypeModal'; 
import RoomDetectionLoader from './components/RoomDetectionLoader'; 
import { generateRoomDesign, editRoomDesign, createChatSession, analyzeRoomDesign, generateFloorPlan, detectRoomType, getQuickRoomInsights, generateProjectSpecs } from './services/geminiService';
import { extractPalette } from './utils/colorUtils';
import { downloadImage, createComparisonCollage } from './utils/downloadUtils';
import { generatePDFReport } from './utils/reportUtils';
import { Chat, Content } from '@google/genai';
import { useUI } from './contexts/UIContext';

const App: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useUI();

  // State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [stylePreviews, setStylePreviews] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: t('chat.welcome') }
  ]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  
  // New State for Preview Confirmation
  const [isImageConfirmed, setIsImageConfirmed] = useState(false);
  
  // Room Detection State
  const [detectedRoomType, setDetectedRoomType] = useState<string | null>(null);
  const [isDetectingRoom, setIsDetectingRoom] = useState(false);
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RoomAnalysis | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Floor Plan State
  const [isGeneratingFloorPlan, setIsGeneratingFloorPlan] = useState(false);
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);

  // Project Specs State
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);
  const [projectSpecs, setProjectSpecs] = useState<ProjectSpecs | null>(null);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // New Project Parameters
  const [projectBudget, setProjectBudget] = useState<string>('');
  const [floorPlanScale, setFloorPlanScale] = useState<string>('1:100');

  // Budget State
  const [budgetEstimateResult, setBudgetEstimateResult] = useState<BudgetEstimate | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Library Preview State
  const [previewData, setPreviewData] = useState<{
      type: 'analysis' | 'budget' | 'palette' | 'specs';
      data: any;
  } | null>(null);

  // Palette State
  const [palette, setPalette] = useState<string[]>([]);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<ToolTab>('adjust');

  // Library State
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Menus State
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Refs
  const chatSessionRef = useRef<Chat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  
  // Flag to prevent palette extraction overwriting loaded palette
  const isLoadingDesignRef = useRef(false);

  // Initialize Chat Session on Mount & Load Saved Designs
  useEffect(() => {
    // Initial creation of chat session
    chatSessionRef.current = createChatSession(undefined, language, projectBudget);
    
    // Load saved designs
    try {
        const saved = localStorage.getItem('lumina_saved_designs');
        if (saved) {
            setSavedDesigns(JSON.parse(saved));
        }
    } catch (e) {
        console.error("Failed to load saved designs", e);
    }

    // Close menus on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Run only once on mount

  // Update Chat Session and Text when Language Changes
  useEffect(() => {
    // 1. Update initial welcome message if it's the only message
    if (chatMessages.length === 1 && chatMessages[0].role === 'model') {
       // Only update if it doesn't have interactive elements like shoppable items yet
       if (!chatMessages[0].shoppableItems && !chatMessages[0].budgetEstimate) {
           setChatMessages([{ role: 'model', text: t('chat.welcome') }]);
       }
    }

    // 2. Re-create the Gemini Chat Session with the new Language System Instruction.
    // We must pass the existing history so the AI remembers context, but now knows to reply in the new language.
    const history: Content[] = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    chatSessionRef.current = createChatSession(history, language, projectBudget);

  }, [language, projectBudget]); // Also recreate if budget changes


  // Update palette when generated image changes
  useEffect(() => {
    // Skip extraction if we are currently loading a design (to preserve saved palette)
    if (isLoadingDesignRef.current) return;

    if (generatedImage) {
      extractPalette(generatedImage).then(setPalette);
    } else {
      setPalette([]);
    }
  }, [generatedImage]);

  // Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCameraClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering the parent container click
      cameraInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Simple validation
    if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
         if (typeof reader.result === 'string') {
             const base64Image = reader.result;
             setOriginalImage(base64Image);
             setGeneratedImage(null);
             setStylePreviews({});
             setChatMessages(prev => [...prev, { role: 'model', text: t('chat.uploadParams') }]);
             setAnalysisResult(null); // Reset analysis
             setBudgetEstimateResult(null); // Reset budget
             setFloorPlanImage(null); // Reset floor plan
             setProjectSpecs(null); // Reset specs
             setDetectedRoomType(null); // Reset room type
             setIsImageConfirmed(false); // Reset confirmation state
             setProjectBudget(''); // Reset budget on new image
             
             // Reset chat session on new upload with current language
             chatSessionRef.current = createChatSession(undefined, language, projectBudget);

             // Immediately detect room type
             setIsDetectingRoom(true);
             try {
                const detected = await detectRoomType(base64Image);
                if (detected === 'Unknown') {
                    setIsRoomTypeModalOpen(true);
                } else {
                    setDetectedRoomType(detected);
                }
             } catch (e) {
                console.error("Auto-detection failed", e);
                setIsRoomTypeModalOpen(true);
             } finally {
                setIsDetectingRoom(false);
             }
         }
    };
    reader.onerror = () => {
        alert("Failed to read file.");
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setStylePreviews({});
    setAnalysisResult(null);
    setBudgetEstimateResult(null);
    setFloorPlanImage(null);
    setProjectSpecs(null);
    setDetectedRoomType(null);
    setIsImageConfirmed(false);
    setIsRoomTypeModalOpen(false);
    setProjectBudget('');
    setChatMessages([{ role: 'model', text: t('chat.ready') }]);
    chatSessionRef.current = createChatSession(undefined, language);
  };

  const handleConfirmImage = async () => {
      setIsImageConfirmed(true);
      
      // TRIGGER AUTO-ANALYSIS (Quick Insights)
      if (originalImage) {
          try {
             const insights = await getQuickRoomInsights(originalImage, detectedRoomType || "Room");
             setChatMessages(prev => [...prev, { 
                 role: 'model', 
                 text: `${t('analysis.autoInsight')}${insights}` 
             }]);
          } catch (e) {
              console.error("Quick analysis failed", e);
          }
      }
  };

  const handleSaveEdit = (newImage: string) => {
    setOriginalImage(newImage);
    setGeneratedImage(null); // Clear previous generation as source changed
    setStylePreviews({}); // Reset previews
    setIsEditing(false);
    setChatMessages(prev => [...prev, { role: 'model', text: t('chat.uploadParams') }]);
  };

  const openEditor = (tab: ToolTab) => {
    setEditorInitialTab(tab);
    setIsEditing(true);
  };

  const handleRoomTypeSubmit = (type: string) => {
      setDetectedRoomType(type);
      setIsRoomTypeModalOpen(false);
  };

  const handleAnalyzeRoom = async () => {
    if (!originalImage) return;
    
    // If we already have results, just open the modal
    if (analysisResult) {
        setIsAnalysisModalOpen(true);
        return;
    }

    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeRoomDesign(originalImage);
      setAnalysisResult(result);
      setIsAnalysisModalOpen(true);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Could not analyze the room.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateFloorPlan = async () => {
      if (!originalImage) return;

      if (floorPlanImage) {
          setIsFloorPlanModalOpen(true);
          return;
      }

      if (isGeneratingFloorPlan) return;

      setIsGeneratingFloorPlan(true);
      try {
          // Pass the known room type AND scale to helper function
          const result = await generateFloorPlan(originalImage, detectedRoomType || undefined, floorPlanScale);
          setFloorPlanImage(result);
          setIsFloorPlanModalOpen(true);
      } catch (error) {
          console.error("Floor plan generation failed", error);
          alert("Could not generate floor plan.");
      } finally {
          setIsGeneratingFloorPlan(false);
      }
  };
  
  const handleGenerateSpecs = async () => {
      if (!generatedImage && !originalImage) return;
      const targetImage = generatedImage || originalImage;

      if (projectSpecs) {
          setIsSpecsModalOpen(true);
          return;
      }

      if (isGeneratingSpecs) return;

      setIsGeneratingSpecs(true);
      try {
          const result = await generateProjectSpecs(targetImage!);
          setProjectSpecs(result);
          setIsSpecsModalOpen(true);
      } catch (error) {
          console.error("Specs generation failed", error);
          alert("Could not generate project specifications.");
      } finally {
          setIsGeneratingSpecs(false);
      }
  };

  // --- Download Logic ---
  const handleDownloadResult = () => {
    if (!generatedImage) return;
    const filename = `reroom-design-${selectedStyle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    downloadImage(generatedImage, filename);
    setIsDownloadMenuOpen(false);
  };

  const handleDownloadCollage = async () => {
    if (!originalImage || !generatedImage) return;
    try {
      const collageUrl = await createComparisonCollage(originalImage, generatedImage, selectedStyle);
      const filename = `reroom-before-after-${selectedStyle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      downloadImage(collageUrl, filename);
      setIsDownloadMenuOpen(false);
    } catch (error) {
      console.error("Failed to create collage", error);
      alert("Could not generate comparison image.");
    }
  };

  const handleExportPDF = () => {
    if (!originalImage || !generatedImage) return;
    generatePDFReport({
      originalImage,
      generatedImage,
      selectedStyle: selectedStyle || 'Custom',
      palette,
      analysis: analysisResult,
      budget: budgetEstimateResult,
      specs: projectSpecs // Passed here
    });
    setIsDownloadMenuOpen(false);
  };

  // --- Save & Load Logic ---
  
  const handleSaveDesign = () => {
      if (!originalImage) return;

      const newDesign: SavedDesign = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          originalImage,
          generatedImage,
          selectedStyle: selectedStyle || 'Original',
          palette,
          chatMessages,
          analysis: analysisResult || undefined,
          budgetEstimate: budgetEstimateResult || undefined,
          projectSpecs: projectSpecs || undefined
      };

      try {
          const updatedDesigns = [newDesign, ...savedDesigns];
          setSavedDesigns(updatedDesigns);
          localStorage.setItem('lumina_saved_designs', JSON.stringify(updatedDesigns));
          alert("Design saved to library!");
      } catch (e) {
          console.error(e);
          alert("Failed to save design. Local storage might be full.");
      }
  };

  const handleLoadDesign = (design: SavedDesign) => {
      if (!confirm("Loading this design will replace your current workspace. Continue?")) return;
      
      isLoadingDesignRef.current = true; // Prevent useEffect from overwriting palette

      setOriginalImage(design.originalImage);
      setGeneratedImage(design.generatedImage);
      setSelectedStyle(design.selectedStyle);
      setPalette(design.palette || []); // Explicitly set loaded palette
      setChatMessages(design.chatMessages);
      setAnalysisResult(design.analysis || null);
      setBudgetEstimateResult(design.budgetEstimate || null);
      setProjectSpecs(design.projectSpecs || null);
      setFloorPlanImage(null); // Saved designs don't currently support floor plan storage in type, so reset
      setDetectedRoomType(null); // Reset room type on load as it isn't saved in schema yet
      setProjectBudget(''); // Reset budget
      
      setIsImageConfirmed(true); // Auto confirm loaded designs

      // Re-initialize Chat with History
      // Convert app Messages to Gemini Content
      const history: Content[] = design.chatMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));
      
      chatSessionRef.current = createChatSession(history, language);

      setIsLibraryOpen(false);
      
      // Reset loading flag after a short delay
      setTimeout(() => {
          isLoadingDesignRef.current = false;
      }, 500);
  };

  const handleDeleteDesign = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this design?")) return;

      const updatedDesigns = savedDesigns.filter(d => d.id !== id);
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('lumina_saved_designs', JSON.stringify(updatedDesigns));
  };

  const handleEstimateBudget = () => {
    if (!generatedImage) return;
    
    // If we already have a budget, just show it
    if (budgetEstimateResult) {
        setIsBudgetModalOpen(true);
        return;
    }

    // We send a hidden system-like message to trigger the tool
    handleSendMessage("Analyze the generated design and provide a detailed renovation cost estimation using the estimateRenovationCost tool.");
  };

  const handleStyleSelect = async (style: DesignStyle) => {
    if (!originalImage || isGenerating) return;

    setSelectedStyle(style);
    setAnalysisResult(null);
    setBudgetEstimateResult(null);
    setFloorPlanImage(null);
    setProjectSpecs(null);

    // Check if we already have this style generated
    if (stylePreviews[style]) {
      setGeneratedImage(stylePreviews[style]);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Pass the detected room type AND BUDGET to the service
      const result = await generateRoomDesign(originalImage, style, detectedRoomType || undefined, projectBudget);
      setGeneratedImage(result);
      setStylePreviews(prev => ({ ...prev, [style]: result }));
      setChatMessages(prev => [...prev, { role: 'model', text: `Here is your ${detectedRoomType || 'room'} reimagined in ${style} style! You can use the slider to compare, or chat with me to adjust specifics like colors or furniture.` }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error generating the design. Please try again.", isError: true }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const styles = Object.values(DesignStyle);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    handleStyleSelect(randomStyle);
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setIsChatProcessing(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: text });
      
      let finalResponseText = result.text || '';
      const toolCalls = result.functionCalls;
      let shoppableItems: ShoppableItem[] = [];
      let budgetEstimate: BudgetEstimate | undefined;

      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          
          if (call.name === 'editRoom') {
            const args = call.args as unknown as { instruction: string };
            setChatMessages(prev => [...prev, { role: 'model', text: `Working on it: ${args.instruction}...` }]);
            
            const baseImage = generatedImage || originalImage;
            if (baseImage) {
              try {
                const newImage = await editRoomDesign(baseImage, args.instruction);
                setGeneratedImage(newImage);
                const toolResponse = await chatSessionRef.current.sendMessage({
                    message: [{ functionResponse: { name: 'editRoom', response: { result: 'Image updated successfully.' } } }]
                });
                if (toolResponse.text) finalResponseText += (finalResponseText ? '\n\n' : '') + toolResponse.text;
              } catch (err) {
                 finalResponseText += "\n\nI tried to edit the image but something went wrong.";
              }
            } else {
               finalResponseText += "\nPlease upload an image first so I can edit it.";
            }
          } 
          else if (call.name === 'suggestItems') {
            const args = call.args as unknown as { items: ShoppableItem[] };
            shoppableItems = args.items;
            const toolResponse = await chatSessionRef.current.sendMessage({
                message: [{ functionResponse: { name: 'suggestItems', response: { result: 'Items displayed to user.' } } }]
            });
             if (toolResponse.text) finalResponseText += (finalResponseText ? '\n\n' : '') + toolResponse.text;
          }
          else if (call.name === 'estimateRenovationCost') {
            const args = call.args as unknown as BudgetEstimate;
            budgetEstimate = args;
            setBudgetEstimateResult(args); 
             const toolResponse = await chatSessionRef.current.sendMessage({
                message: [{ functionResponse: { name: 'estimateRenovationCost', response: { result: 'Budget displayed to user.' } } }]
            });
            if (toolResponse.text) finalResponseText += (finalResponseText ? '\n\n' : '') + toolResponse.text;
          }
        }
      }
      
      if (finalResponseText || shoppableItems.length > 0 || budgetEstimate) {
          setChatMessages(prev => [...prev, { 
            role: 'model', 
            text: finalResponseText,
            shoppableItems: shoppableItems.length > 0 ? shoppableItems : undefined,
            budgetEstimate: budgetEstimate
          }]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now.", isError: true }]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Preview Helpers
  const openLibraryPreview = (type: 'analysis' | 'budget' | 'palette' | 'specs', data: any) => {
      setPreviewData({ type, data });
  };
  
  const closeLibraryPreview = () => {
      setPreviewData(null);
  };

  const activeAnalysisData = (previewData?.type === 'analysis' ? previewData.data : analysisResult);
  const isAnalysisModalVisible = isAnalysisModalOpen || (previewData?.type === 'analysis');
  
  const activeBudgetData = (previewData?.type === 'budget' ? previewData.data : budgetEstimateResult);
  const isBudgetModalVisible = isBudgetModalOpen || (previewData?.type === 'budget');

  const activeSpecsData = (previewData?.type === 'specs' ? previewData.data : projectSpecs);
  const isSpecsModalVisible = isSpecsModalOpen || (previewData?.type === 'specs');

  const activePaletteData = (previewData?.type === 'palette' ? previewData.data : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      
      {/* Loading Overlay for Room Detection - Shows during detection */}
      {isDetectingRoom && <RoomDetectionLoader />}
      
      {/* Room Type Modal for Manual Input - Shows if Unknown is detected */}
      <RoomTypeModal 
        isOpen={isRoomTypeModalOpen} 
        onSubmit={handleRoomTypeSubmit} 
        onRetake={handleReset} // Pass handleReset for the new Retake button
      />

      {/* Editor Modal */}
      {isEditing && originalImage && (
        <ImageEditor 
          imageSrc={originalImage} 
          onSave={handleSaveEdit} 
          onCancel={() => setIsEditing(false)}
          initialTab={editorInitialTab}
        />
      )}

      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={isAnalysisModalVisible}
        onClose={() => {
            setIsAnalysisModalOpen(false);
            closeLibraryPreview();
        }}
        data={activeAnalysisData}
        onAskAI={(question) => {
            if (previewData) {
                alert("Please load this design to chat with AI about it.");
                closeLibraryPreview();
            } else {
                handleSendMessage(question);
            }
        }}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalVisible}
        onClose={() => {
            setIsBudgetModalOpen(false);
            closeLibraryPreview();
        }}
        data={activeBudgetData}
      />

      {/* Specs Modal */}
      <SpecsModal
        isOpen={isSpecsModalVisible}
        onClose={() => {
            setIsSpecsModalOpen(false);
            closeLibraryPreview();
        }}
        data={activeSpecsData}
      />

      {/* Floor Plan Modal */}
      <FloorPlanModal
        isOpen={isFloorPlanModalOpen}
        onClose={() => setIsFloorPlanModalOpen(false)}
        floorPlanImage={floorPlanImage}
      />
      
      {/* Palette Preview Modal */}
      {previewData?.type === 'palette' && activePaletteData && (
          <div className="fixed inset-0 z-[70] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-lg w-full relative">
                 <button onClick={closeLibraryPreview} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400"><X size={20}/></button>
                 <h3 className="text-lg font-bold mb-4 dark:text-white">{t('palette.title')}</h3>
                 <ColorPalette colors={activePaletteData} />
             </div>
          </div>
      )}

      {/* Library Modal */}
      {isLibraryOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 transition-colors">
                  <div className="flex items-center justify-between px-6 py-5 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                              <FolderOpen size={20} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('nav.library')}</h3>
                      </div>
                      <button 
                        onClick={() => setIsLibraryOpen(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                          <X size={20} className="text-gray-500 dark:text-slate-400" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-950">
                      {savedDesigns.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                              <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-50" />
                              <p className="text-lg font-medium">No saved designs yet</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {savedDesigns.map((design) => (
                                  <div 
                                    key={design.id} 
                                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                                    onClick={() => handleLoadDesign(design)}
                                  >
                                      <div className="aspect-video relative bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                          <img 
                                            src={design.generatedImage || design.originalImage} 
                                            alt={design.selectedStyle}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                              {design.generatedImage ? 'Redesigned' : 'Original'}
                                          </div>
                                      </div>
                                      <div className="p-4 flex-1 flex flex-col">
                                          <div className="flex justify-between items-start mb-3">
                                              <div>
                                                  <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{design.selectedStyle} Room</h4>
                                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                                                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(design.timestamp).toLocaleDateString()}</span>
                                                  </div>
                                              </div>
                                              <button 
                                                onClick={(e) => handleDeleteDesign(e, design.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete Design"
                                              >
                                                  <Trash2 size={16} />
                                              </button>
                                          </div>
                                          
                                          {/* Data Indicators - Interactive Buttons */}
                                          <div className="mt-auto flex gap-2 pt-3 border-t border-gray-50 dark:border-slate-800 flex-wrap">
                                               {design.analysis && (
                                                   <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openLibraryPreview('analysis', design.analysis);
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-100 dark:border-blue-900/50"
                                                        title="View Analysis"
                                                    >
                                                       <ScanEye size={12} /> Analysis
                                                   </button>
                                               )}
                                               {design.projectSpecs && (
                                                   <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openLibraryPreview('specs', design.projectSpecs);
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                                                        title="View Technical Specs"
                                                    >
                                                       <HardHat size={12} /> Specs
                                                   </button>
                                               )}
                                               {design.budgetEstimate && (
                                                   <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openLibraryPreview('budget', design.budgetEstimate);
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 px-2 py-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-100 dark:border-emerald-900/50"
                                                        title="View Cost Estimate"
                                                   >
                                                       <Calculator size={12} /> Cost
                                                   </button>
                                               )}
                                               {design.palette && design.palette.length > 0 && (
                                                   <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openLibraryPreview('palette', design.palette);
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-2 py-1.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors border border-purple-100 dark:border-purple-900/50"
                                                        title="View Color Palette"
                                                   >
                                                       <Palette size={12} /> Colors
                                                   </button>
                                               )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Wand2 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ReRoom<span className="text-indigo-600 dark:text-indigo-400"> Consultant</span></span>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={t('nav.help')}
              >
                  <HelpCircle size={18} />
                  <span>{t('nav.help')}</span>
              </button>

              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="sm:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={t('nav.help')}
              >
                  <HelpCircle size={20} />
              </button>

              <button 
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                  <FolderOpen size={18} />
                  <span className="hidden sm:inline">{t('nav.library')}</span>
              </button>

               {/* Settings Dropdown */}
               <div className="relative" ref={settingsMenuRef}>
                    <button
                        onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                        className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('nav.settings')}
                    >
                        <Settings size={20} />
                    </button>
                    
                    {isSettingsMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             <div className="px-4 py-2 border-b dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('nav.theme')}
                             </div>
                             <button onClick={toggleTheme} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                 <span className="flex items-center gap-2">
                                     {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />} 
                                     {theme === 'light' ? t('nav.light') : t('nav.dark')}
                                 </span>
                                 {theme === 'dark' && <CheckCircle2 size={14} className="text-indigo-500" />}
                             </button>
                             
                             <div className="px-4 py-2 border-b border-t dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('nav.language')}
                             </div>
                             <button onClick={() => { setLanguage('en'); setIsSettingsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                 <span className="flex items-center gap-2"><Globe size={16}/> English</span>
                                 {language === 'en' && <CheckCircle2 size={14} className="text-indigo-500" />}
                             </button>
                             <button onClick={() => { setLanguage('id'); setIsSettingsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                 <span className="flex items-center gap-2"><Globe size={16}/> Indonesia</span>
                                 {language === 'id' && <CheckCircle2 size={14} className="text-indigo-500" />}
                             </button>
                        </div>
                    )}
                </div>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>

              {originalImage && (
                   <button 
                   onClick={handleSaveDesign}
                   className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                 >
                     <Save size={18} />
                     <span className="hidden sm:inline">{t('nav.save')}</span>
                 </button>
              )}
          </div>
        </div>
      </nav>

      {/* Hidden inputs to be accessible from both views */}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="hidden" 
        ref={fileInputRef}
      />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        onChange={handleImageUpload} 
        className="hidden" 
        ref={cameraInputRef}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {!originalImage ? (
            /* LANDING VIEW: Dedicated full-screen upload experience */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10 max-w-2xl relative">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-6 text-indigo-600 dark:text-indigo-400 relative z-10 border border-indigo-50 dark:border-slate-700">
                        <Wand2 size={48} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight relative z-10">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-slate-400 relative z-10 leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md relative z-10">
                    <button 
                        onClick={handleUploadClick}
                        className="flex flex-col items-center justify-center p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] group"
                    >
                        <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-lg font-bold">{t('hero.button')}</span>
                    </button>

                    <button 
                        onClick={handleCameraClick}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl transition-all hover:border-indigo-200 dark:hover:border-indigo-900 hover:scale-[1.02] group"
                    >
                        <Camera size={28} className="mb-2 group-hover:-translate-y-1 transition-transform text-indigo-500" />
                        <span className="text-lg font-bold">{t('hero.cameraButton')}</span>
                    </button>
                </div>

                {/* FEATURE SHOWCASE GRID (New "How it works/Value Prop") */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl px-4">
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 hover:border-indigo-100 dark:hover:border-slate-700 transition-colors">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-300 mb-3">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('features.visualizeTitle')}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t('features.visualizeDesc')}</p>
                     </div>

                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 hover:border-indigo-100 dark:hover:border-slate-700 transition-colors">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-300 mb-3">
                            <Wallet size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('features.budgetTitle')}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t('features.budgetDesc')}</p>
                     </div>

                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 hover:border-indigo-100 dark:hover:border-slate-700 transition-colors">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-300 mb-3">
                            <HardHat size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('features.specsTitle')}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t('features.specsDesc')}</p>
                     </div>

                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400 hover:border-indigo-100 dark:hover:border-slate-700 transition-colors">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-300 mb-3">
                            <Map size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('features.planTitle')}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{t('features.planDesc')}</p>
                     </div>
                </div>
            </div>
        ) : !isImageConfirmed ? (
            /* PREVIEW CONFIRMATION VIEW */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-lg w-full">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 mb-6">
                      <img src={originalImage} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="text-center space-y-2 mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('preview.title')}</h2>
                      <p className="text-gray-500 dark:text-slate-400">{t('preview.subtitle')}</p>
                      
                      {detectedRoomType && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mt-2">
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                              {t('preview.detected')} <strong>{detectedRoomType}</strong>
                            </span>
                             <button 
                                onClick={() => setIsRoomTypeModalOpen(true)}
                                className="p-1 bg-white dark:bg-slate-800 rounded-full text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                <Pencil size={12} />
                            </button>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={handleReset}
                         className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                         <RefreshCw size={18} /> {t('preview.retake')}
                      </button>
                      <button 
                         onClick={handleConfirmImage}
                         className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                      >
                         {t('preview.start')} <ArrowRight size={18} />
                      </button>
                  </div>
               </div>
            </div>
        ) : (
            /* WORKSPACE VIEW: Split screen with Visuals + Chat */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
                {/* Left Column: Visuals */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Style Selector & Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* First Time Tip: Show specific header when no style selected */}
                                {!generatedImage && !isGenerating ? (
                                    <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center gap-2">
                                        <MoveRight size={20} /> {t('style.title')}
                                    </h2>
                                ) : (
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('style.title')}</h2>
                                )}
                                
                                {detectedRoomType && !isDetectingRoom && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
                                        <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">{t('roomDetection.detected')}: <strong>{detectedRoomType}</strong></span>
                                        <button 
                                            onClick={() => setIsRoomTypeModalOpen(true)}
                                            className="p-0.5 bg-white dark:bg-slate-800 rounded-full text-gray-500 hover:text-indigo-600 transition-colors ml-1"
                                            title={t('roomDetection.change')}
                                        >
                                            <Pencil size={10} />
                                        </button>
                                    </div>
                                )}
                                {isDetectingRoom && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
                                        <LoadingSpinner /> {t('loading.detecting')}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {/* Reset / New Photo Button */}
                                <button 
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                                    title="Upload a new photo"
                                >
                                    <RefreshCw size={16} />
                                    <span className="hidden sm:inline">{t('actions.newPhoto')}</span>
                                </button>

                                {/* Edit Buttons */}
                                {!isGenerating && (
                                <>
                                    <button 
                                        onClick={() => openEditor('adjust')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                                    >
                                        <SlidersHorizontal size={16} />
                                        <span className="hidden sm:inline">{t('actions.editPhoto')}</span>
                                    </button>
                                    <button 
                                        onClick={handleSurpriseMe}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                                    >
                                        <Dice5 size={16} />
                                        <span className="hidden sm:inline">{t('actions.surprise')}</span>
                                    </button>
                                </>
                                )}
                            </div>
                        </div>

                        {/* Project Parameters (Budget & Scale) */}
                         <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                             <div>
                                 <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                    <Banknote size={12} /> {t('project.budgetLabel')}
                                 </label>
                                 <div className="relative">
                                    <input 
                                        type="text" 
                                        value={projectBudget}
                                        onChange={(e) => setProjectBudget(e.target.value)}
                                        placeholder={t('project.budgetPlaceholder')}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-8 transition-colors"
                                    />
                                    <Banknote size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                 </div>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                    <Ruler size={12} /> {t('project.scaleLabel')}
                                 </label>
                                 <div className="relative">
                                     <input
                                        type="text"
                                        value={floorPlanScale}
                                        onChange={(e) => setFloorPlanScale(e.target.value)}
                                        placeholder={t('project.scalePlaceholder')}
                                        list="scale-options"
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                     />
                                     <datalist id="scale-options">
                                         <option value="1:50" />
                                         <option value="1:100" />
                                         <option value="1:200" />
                                     </datalist>
                                 </div>
                             </div>
                         </div>

                        <StyleCarousel 
                            onSelectStyle={handleStyleSelect} 
                            selectedStyle={selectedStyle} 
                            disabled={isGenerating || isDetectingRoom}
                            stylePreviews={stylePreviews}
                        />
                    </div>

                    {/* Visualization Area */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 p-2 transition-colors">
                        {isGenerating ? (
                            <div className="aspect-video w-full rounded-xl bg-gray-100 dark:bg-slate-800 flex flex-col items-center justify-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium animate-pulse">{t('loading.generating')}</p>
                            </div>
                        ) : generatedImage ? (
                            <CompareSlider 
                                originalImage={originalImage} 
                                generatedImage={generatedImage} 
                            />
                        ) : (
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden group bg-gray-100 dark:bg-slate-800">
                                <img 
                                    src={originalImage} 
                                    alt="Original" 
                                    className="w-full h-full object-contain" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                {/* Overlay hint for new users */}
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in zoom-in duration-500 delay-500">
                                        <Sparkles className="text-indigo-500" size={20} />
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">Choose a style above to start</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toolbar below image: Download, Palette, Budget */}
                    {!isGenerating && (
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            {/* Palette (Only show if generated image exists) */}
                            {palette.length > 0 ? (
                                <div className="flex-1 min-w-[200px]">
                                    <ColorPalette colors={palette} />
                                </div>
                            ) : (
                                <div className="flex-1"></div>
                            )}

                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                {/* Analysis Button */}
                                <button
                                    onClick={handleAnalyzeRoom}
                                    disabled={isAnalyzing}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-wait ${analysisResult ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}
                                >
                                    {isAnalyzing ? <LoadingSpinner /> : <ScanEye size={18} />}
                                    {isAnalyzing ? t('analysis.analyzing') : analysisResult ? t('analysis.view') : t('analysis.button')}
                                </button>

                                {/* Specs Button */}
                                {(generatedImage || originalImage) && (
                                    <button
                                        onClick={handleGenerateSpecs}
                                        disabled={isGeneratingSpecs}
                                        className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-wait ${projectSpecs ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'}`}
                                    >
                                        {isGeneratingSpecs ? <LoadingSpinner /> : <HardHat size={18} />}
                                        {isGeneratingSpecs ? t('specs.generating') : projectSpecs ? t('specs.view') : t('specs.button')}
                                    </button>
                                )}

                                {/* Floor Plan Button */}
                                <button
                                    onClick={handleGenerateFloorPlan}
                                    disabled={isGeneratingFloorPlan}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-wait ${floorPlanImage ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-800' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40'}`}
                                >
                                    {isGeneratingFloorPlan ? <LoadingSpinner /> : <Map size={18} />}
                                    {isGeneratingFloorPlan ? t('floorPlan.generating') : floorPlanImage ? t('floorPlan.view') : t('floorPlan.button')}
                                </button>

                                {/* Budget Estimator Button (Only if generated) */}
                                {generatedImage && (
                                    <button
                                        onClick={handleEstimateBudget}
                                        className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap ${budgetEstimateResult ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                                    >
                                        <Calculator size={18} />
                                        {budgetEstimateResult ? t('budget.view') : t('budget.button')}
                                    </button>
                                )}

                                {/* Download Button (Only if generated) */}
                                {generatedImage && (
                                    <div className="relative" ref={downloadMenuRef}>
                                        <button
                                            onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm whitespace-nowrap"
                                        >
                                            <Download size={18} />
                                            {t('actions.download')}
                                            <ChevronDown size={16} className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {/* Dropdown */}
                                        {isDownloadMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <button onClick={handleDownloadResult} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                                    <FileImage size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                    <div>
                                                        <span className="font-semibold block">{t('actions.downloadResult')}</span>
                                                        <span className="text-xs text-gray-400">{t('actions.saveDesc')}</span>
                                                    </div>
                                                </button>
                                                <div className="h-px bg-gray-100 dark:bg-slate-800" />
                                                <button onClick={handleDownloadCollage} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                                    <Columns size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                    <div>
                                                        <span className="font-semibold block">{t('actions.downloadCollage')}</span>
                                                        <span className="text-xs text-gray-400">{t('actions.collageDesc')}</span>
                                                    </div>
                                                </button>
                                                <div className="h-px bg-gray-100 dark:bg-slate-800" />
                                                <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm text-gray-700 dark:text-slate-200 transition-colors">
                                                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                    <div>
                                                        <span className="font-semibold block">{t('actions.exportPdf')}</span>
                                                        <span className="text-xs text-gray-400">{t('actions.pdfDesc')}</span>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Info / Hint */}
                    {generatedImage && !isGenerating && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex items-start space-x-3">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-1.5 rounded-full text-indigo-600 dark:text-indigo-400 mt-0.5">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">{t('hints.title')}</h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                                    {t('hints.text')} <span className="font-mono bg-white/50 dark:bg-black/30 px-1 rounded text-xs">"Make the walls sage green"</span>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Chat */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24">
                        <ChatInterface 
                            messages={chatMessages} 
                            onSendMessage={handleSendMessage} 
                            isProcessing={isChatProcessing}
                        />
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-gray-500 dark:text-slate-500 border-t border-gray-100 dark:border-slate-800 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p>
          {t('footer.credit')}
        </p>
      </footer>
    </div>
  );
};

export default App;
