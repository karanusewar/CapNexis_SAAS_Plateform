/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Analyzer } from './components/Analyzer';
import { Dashboard } from './components/Dashboard';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { getRedirectResult } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

function AppContent() {
  const [view, setView] = useState<'landing' | 'analyzing' | 'dashboard'>('landing');
  const [selectedFileData, setSelectedFileData] = useState<{name: string, data: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    // Handle redirect sign-in completion
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            credits: 1, // 1 Free initial credit
            createdAt: serverTimestamp()
          });
        }
      }
    }).catch((error) => {
      console.error("Error from redirect result:", error);
    });
  }, []);

  const startAnalysis = (name: string, base64Data: string) => {
    setSelectedFileData({ name, data: base64Data });
    setView('analyzing');
  };

  return (
    <>
      {view === 'landing' && <Landing onStartAnalysis={startAnalysis} />}
      {view === 'analyzing' && <Analyzer fileData={selectedFileData} onComplete={(result) => {
         setAnalysisResult(result);
         setView('dashboard');
      }} />}
      {view === 'dashboard' && <Dashboard data={analysisResult} onGoHome={() => setView('landing')} />}
    </>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
