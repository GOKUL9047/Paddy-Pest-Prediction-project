// Define types for prediction result
export interface PredictionResult {
  prediction: string;
  confidence: number;
}

// Define type for data saved to history
export interface HistoryData {
  prediction: string;
  confidence: number;
  textInput: string;
  imagePreviewUrl: string | null;
  timestamp: string;
}

// History item interface for display
export interface HistoryItem {
  id: string;
  prediction: string;
  confidence: number;
  textInput?: string;
  imagePreviewUrl?: string;
  timestamp: string;
}

// Component prop interfaces
export interface NavbarProps {
  setCurrentPage: (page: string) => void;
}

export interface PredictPageProps {
  db: any | null;
  userId: string | null;
  isAuthReady: boolean;
}

export interface HistoryPageProps {
  db: any | null;
  userId: string | null;
  isAuthReady: boolean;
}