
export interface DesignAnalysis {
  productTitle: string;
  category: string;
  targetAudience: string;
  psychologicalProfile: {
    mood: string;
    colorPalette: string[];
    lightingAtmosphere: string;
    emotionalImpact: string;
  };
  designStrategy: {
    backgroundConcept: string;
    compositionRule: string;
    materialTextureFocus: string;
    style: 'Streetwear' | 'Editorial' | 'Magazine' | 'Urban';
  };
  imagePrompt: string;
}

export type PosterTheme = 'Streetwear' | 'Editorial' | 'Magazine' | 'Urban';

export interface AppState {
  productImages: string[];
  referenceImages: string[];
  aspectRatio: string;
  customInstructions: string;
  posterInstructions: string;
  posterTheme: PosterTheme;
  isAnalyzing: boolean;
  isGeneratingImage: boolean;
  isGeneratingPoster: boolean;
  analysis: DesignAnalysis | null;
  generatedImage: string | null;
  generatedPoster: string | null;
  error: string | null;
}
