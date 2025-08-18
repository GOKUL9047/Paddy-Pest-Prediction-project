// --- src/App.tsx (Main App Component) ---
import React, { useState, useEffect } from 'react';

// Firebase imports: split types from values
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import Chatbot from './pages/Chatbot'; // ensure file exists

// --- Hardcoded Firebase Config (TEMP) ---
const firebaseConfig = {
  apiKey: "AIzaSyBh67aLRiDgN6OqtuSGn26F3IGIvpLB_1I",
  authDomain: "pestpredictionapp.firebaseapp.com",
  projectId: "pestpredictionapp",
  storageBucket: "pestpredictionapp.appspot.com", // <-- fixed
  messagingSenderId: "525255414612",
  appId: "1:525255414612:web:eb21d109b134c12051aec1"
};

const appId = "pestpredictionapp"; // Using same as projectId temporarily

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Initialize Firebase and handle authentication
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const app: FirebaseApp = initializeApp(firebaseConfig);
        const firestore: Firestore = getFirestore(app);
        const authInstance: Auth = getAuth(app);

        setDb(firestore);
        setAuth(authInstance);

        // Sign in anonymously for now
        await signInAnonymously(authInstance);

        onAuthStateChanged(authInstance, (user: User | null) => {
          if (user) {
            setUserId(user.uid);
          } else {
            setUserId(crypto.randomUUID()); // fallback if no user
          }
          setIsAuthReady(true);
        });
      } catch (err) {
        console.error('Firebase initialization error:', err);
      }
    };

    initializeFirebase();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'predict':
        return <PredictPage db={db} userId={userId} isAuthReady={isAuthReady} appId={appId} />;
      case 'history':
        return <HistoryPage db={db} userId={userId} isAuthReady={isAuthReady} appId={appId} />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
        
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Navbar setCurrentPage={setCurrentPage} />
      {renderPage()}
      <Chatbot />
    </div>
  );
};

export default App;
