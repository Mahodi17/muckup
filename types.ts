
export interface DesignAnalysis {
  productTitle: string;
  category: string;
  targetAudience: string;
  psychologicalProfile: {
    mood: string;
    colorPalette: string[];
    emotionalImpact: string;
  };
  designStrategy: {
    lighting: string;
    background: string;
    composition: string;
    style: 'Minimalist' | 'Luxury' | 'Vibrant' | 'Corporate' | 'Organic';
  };
  imagePrompt: string;
}

export interface AppState {
  images: string[];
  isAnalyzing: boolean;
  isGeneratingImage: boolean;
  analysis: DesignAnalysis | null;
  generatedImage: string | null;
  error: string | null;
}
