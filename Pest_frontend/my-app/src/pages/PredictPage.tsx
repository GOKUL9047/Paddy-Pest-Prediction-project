// --- src/pages/PredictPage.tsx ---
import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { Firestore } from 'firebase/firestore';
import PestPredictionService from '../services/PestPredictionService';
import type { PredictionResult } from '../services/PestPredictionService';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PredictPageProps {
  db: Firestore | null;
  userId: string | null;
  isAuthReady: boolean;
  appId: string;
}

const PredictPage: React.FC<PredictPageProps> = ({ db, userId, isAuthReady, appId }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // for clearing the native file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage('');
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setErrorMessage('Please upload an image to predict.');
      return;
    }
    if (!isAuthReady || !db || !userId) {
      setErrorMessage('Authentication not ready. Please wait a moment.');
      return;
    }

    setLoading(true);
    setPredictionResult(null);
    setErrorMessage('');

    try {
      const result = await PestPredictionService.predict(imageFile, textInput);
      
      // Set result first, then clear loading
      setPredictionResult(result);
      setLoading(false);

      // Save to history after setting result
      await PestPredictionService.savePredictionToHistory(db, userId, appId, {
        prediction: result.prediction,
        confidence: result.confidence,
        explanation: result.explanation,
        textInput,
        imagePreviewUrl: imagePreview || undefined,
      });
    } catch (error) {
      console.error('Prediction failed:', error);
      setErrorMessage('Failed to get prediction. Please try again.');
      setLoading(false);
    }
  };

  // Clean reset function without page reload
  const handleReset = () => {
    setPredictionResult(null);
    setImageFile(null);
    setImagePreview(null);
    setTextInput('');
    setErrorMessage('');
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // optional: scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' as ScrollBehavior });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-green-800 mb-8 text-center font-inter">
          Pest Prediction
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-6">
            <label className="block text-gray-700 text-lg font-semibold">
              Upload Plant Image:
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-green-500 transition duration-300 ease-in-out">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-lg shadow-md" />
                ) : (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a2 2 0 00-2 2v20m32-12v8m0 0v8a2 2 0 01-2 2H12a2 2 0 01-2-2v-8m0 0l3.187-3.187a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-green-600 hover:text-green-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            <label className="block text-gray-700 text-lg font-semibold mt-6">
              Optional Text Input (e.g., symptoms):
            </label>
            <textarea
              value={textInput}
              onChange={handleTextChange}
              rows={4}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 text-gray-800"
              placeholder="Describe any symptoms or observations..."
            ></textarea>

            {errorMessage && (
              <p className="text-red-600 text-sm mt-2 text-center">{errorMessage}</p>
            )}

            {/* Button: Get Prediction → Predicting… → Predict Another */}
            <button
              onClick={predictionResult ? handleReset : handleSubmit}
              disabled={loading || (!imageFile && !predictionResult) || !isAuthReady}
              className={`w-full py-3 px-6 rounded-full text-white font-bold shadow-lg transform transition duration-300 ease-in-out
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : predictionResult && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                }`}
            >
              {loading
                ? 'Predicting...'
                : predictionResult && !loading
                ? 'Predict Another'
                : 'Get Prediction'}
            </button>
          </div>

          {/* Results Section */}
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Results:</h2>

            {/* Show analyzing only before result arrives */}
            {loading && !predictionResult && (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                <p className="ml-4 text-gray-600 text-lg">Analyzing...</p>
              </div>
            )}

            {/* Render result (Markdown-enabled) */}
            {predictionResult && (
              <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200">
                <h3 className="text-xl font-semibold text-green-700 mb-3">Prediction:</h3>
                <p className="text-3xl font-extrabold text-green-800 mb-2">
                  {predictionResult.prediction}
                </p>
                {typeof predictionResult.confidence === 'number' && (
                  <p className="text-lg text-gray-600">
                    Confidence: <span className="font-bold">{Math.round(predictionResult.confidence * 100)}%</span>
                  </p>
                )}
                {predictionResult.explanation && (
                  <div className="prose prose-green max-w-none mt-3 text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {predictionResult.explanation}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!loading && !predictionResult && !errorMessage && (
              <div className="bg-gray-100 p-6 rounded-xl shadow-md text-center text-gray-500">
                <p>Upload an image and click "Get Prediction" to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;