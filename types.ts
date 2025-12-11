
export interface ShoppableItem {
  name: string;
  description: string;
}

export interface BudgetCategory {
  categoryName: string;
  items: string[];
  estimatedCostLow: number;
  estimatedCostHigh: number;
}

export interface BudgetEstimate {
  currency: string;
  totalCostLow: number;
  totalCostHigh: number;
  categories: BudgetCategory[];
  disclaimer: string;
}

export interface RoomAnalysis {
  lightingScore: number;
  layoutScore: number;
  colorHarmonyScore: number;
  pros: string[];
  cons: string[];
  quickTips: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  shoppableItems?: ShoppableItem[];
  budgetEstimate?: BudgetEstimate;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  styleName: string;
  prompt: string;
}

export interface SavedDesign {
  id: string;
  timestamp: number;
  originalImage: string;
  generatedImage: string | null;
  selectedStyle: string;
  palette: string[];
  chatMessages: Message[];
  analysis?: RoomAnalysis;
  budgetEstimate?: BudgetEstimate; // Added budgetEstimate
}

export enum DesignStyle {
  Modern = 'Modern',
  MidCenturyModern = 'Mid-Century Modern',
  Scandinavian = 'Scandinavian',
  Industrial = 'Industrial',
  Bohemian = 'Bohemian',
  Minimalist = 'Minimalist',
  ArtDeco = 'Art Deco',
  Coastal = 'Coastal',
  Japandi = 'Japandi',
  Farmhouse = 'Farmhouse',
  Rustic = 'Rustic',
  Glam = 'Glam',
  Mediterranean = 'Mediterranean',
  Transitional = 'Transitional',
  Maximalist = 'Maximalist',
  Cyberpunk = 'Cyberpunk',
  Neoclassic = 'Neoclassic',
  Zen = 'Zen',
  // New Styles
  Contemporary = 'Contemporary',
  Traditional = 'Traditional',
  Southwestern = 'Southwestern',
  Victorian = 'Victorian',
  Gothic = 'Gothic',
  Eclectic = 'Eclectic',
  Tropical = 'Tropical',
  ShabbyChic = 'Shabby Chic',
  Bauhaus = 'Bauhaus',
  Brutalist = 'Brutalist',
  HollywoodRegency = 'Hollywood Regency',
  FrenchCountry = 'French Country',
  Steampunk = 'Steampunk',
  Biophilic = 'Biophilic',
  // Newer Styles
  Cottagecore = 'Cottagecore',
  Baroque = 'Baroque',
  Rococo = 'Rococo',
  ArtNouveau = 'Art Nouveau',
  Memphis = 'Memphis',
  Vaporwave = 'Vaporwave',
  WabiSabi = 'Wabi-Sabi',
  Preppy = 'Preppy',
  SpaceAge = 'Space Age',
  Tuscan = 'Tuscan',
  // Even Newer Styles
  Moroccan = 'Moroccan',
  Chalet = 'Chalet',
  Craftsman = 'Craftsman',
  Noir = 'Noir',
  PopArt = 'Pop Art',
  OrganicModern = 'Organic Modern',
  DarkAcademia = 'Dark Academia',
  Retro = 'Retro',
  Parametric = 'Parametric',
  Luxe = 'Luxe'
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
