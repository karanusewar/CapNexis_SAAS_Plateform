import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, increment, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: any | null;
  credits: number;
  loading: boolean;
  upgradeUser: (amount: number) => Promise<void>;

}

const AuthContext = createContext<AuthContextType>({
  user: null,
  credits: 0,
  loading: true,
  upgradeUser: async () => {},

});

export const useAuth = () => useContext(AuthContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const upgradeUser = async (amount: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, {
          credits: increment(amount),
          lastUpgrade: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          email: user.email,
          credits: amount,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error upgrading user:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Ensure user document exists
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: firebaseUser.email,
              credits: 1,
              createdAt: serverTimestamp()
            });
          }

          // Listen to real-time credit updates
          onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setCredits(docSnap.data().credits || 0);
            }
          }, (error) => {
            console.error("Snapshot error:", error);
          });
        } else {
          setCredits(0);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);



  return (
    <AuthContext.Provider value={{ user, credits, loading, upgradeUser }}>
      {children}
    </AuthContext.Provider>
  );
}
