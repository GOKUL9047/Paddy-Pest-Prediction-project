import React, { useState, useEffect } from 'react';
import type { Firestore } from 'firebase/firestore';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  prediction: string;
  confidence?: number; // make optional
  textInput?: string;
  imagePreviewUrl?: string;
  timestamp: string;
}

interface HistoryPageProps {
  db: Firestore | null;
  userId: string | null;
  isAuthReady: boolean;
  appId: string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ db, userId, isAuthReady, appId }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!db || !userId || !isAuthReady) {
      return;
    }

    const collectionPath = `artifacts/${appId}/users/${userId}/pest_predictions`; // <-- removed leading slash
    const q = query(collection(db, collectionPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems: HistoryItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<HistoryItem, 'id'>),
        }));
        fetchedItems.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setHistoryItems(fetchedItems);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError('Failed to load history. Check console for details.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, userId, isAuthReady, appId]);

  const handleDeleteItem = async (itemId: string) => {
    if (!db || !userId) {
      setError('Firestore DB or User ID not available for deleting.');
      return;
    }
    setError('');
    try {
      const docPath = `artifacts/${appId}/users/${userId}/pest_predictions/${itemId}`; // <-- removed leading slash
      await deleteDoc(doc(db, docPath));
      console.log('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-green-800 mb-6 text-center font-inter">
          Your Prediction History
        </h1>
        {loading && <p className="text-center text-gray-600">Loading history...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            <p className="text-center text-gray-700 mb-4">
              Your User ID:{' '}
              <span className="font-mono bg-gray-100 p-1 rounded text-sm">
                {userId || 'Not available'}
              </span>
            </p>
            {historyItems.length === 0 ? (
              <p className="text-gray-500 text-center">
                No predictions in your history yet. Make a prediction on the
                "Predict" page!
              </p>
            ) : (
              <ul className="space-y-4">
                {historyItems.map((item) => (
                  <li
                    key={item.id}
                    className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      {item.imagePreviewUrl && (
                        <img
                          src={item.imagePreviewUrl}
                          alt="Prediction Preview"
                          className="w-16 h-16 object-cover rounded-md shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              'https://placehold.co/64x64/E0E0E0/888888?text=No+Image';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-green-700">
                          Predicted: {item.prediction}
                        </p>
                        {item.confidence !== undefined && (
                          <p className="text-sm text-gray-600">
                            Confidence: {Math.round(item.confidence * 100)}%
                          </p>
                        )}
                        {item.textInput && (
                          <p className="text-sm text-gray-600 italic">
                            "{item.textInput}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          On: {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="mt-3 sm:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out self-end sm:self-center"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
