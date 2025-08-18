// --- src/services/PestPredictionService.ts ---
import { collection, addDoc, Firestore } from 'firebase/firestore';

export interface PredictionResult {
  prediction: string;
  confidence?: number; // optional, since backend does not send confidence
  explanation?: string; // backend response from LLM
}

export interface HistoryData {
  prediction: string;
  confidence?: number;
  explanation?: string;
  textInput?: string;
  imagePreviewUrl?: string;
  createdAt?: Date;
}

// Only the base server URL here
const API_BASE_URL = "http://127.0.0.1:8000";

const PestPredictionService = {
  /**
   * Calls FastAPI backend to predict pest type and get LLM explanation.
   */
  predict: async (imageFile: File, textInput: string): Promise<PredictionResult> => {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (textInput.trim() !== "") {
      formData.append("query", textInput);
    }

    const response = await fetch(`${API_BASE_URL}/predict-all/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch prediction");
    }

    const data = await response.json();
    return {
      prediction: data.prediction,
      confidence: 1.0, // backend doesn't send confidence explicitly
      explanation: data.explanation,
    };
  },

  /**
   * Saves prediction result into Firestore.
   */
  savePredictionToHistory: async (
    db: Firestore,
    userId: string,
    appId: string,
    predictionData: Omit<HistoryData, 'timestamp'>
  ): Promise<void> => {
    try {
      if (!db || !userId) {
        console.error("Firestore DB or User ID not available for saving history.");
        return;
      }
      const collectionPath: string = `/artifacts/${appId}/users/${userId}/pest_predictions`;
      await addDoc(collection(db, collectionPath), {
        ...predictionData,
        timestamp: new Date().toISOString(),
      });
      console.log("Prediction saved to history successfully!");
    } catch (error) {
      console.error("Error saving prediction to history:", error);
    }
  }
};

export default PestPredictionService;
