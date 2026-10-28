import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, loginWithGoogle, logoutFirebase, db, testConnection } from '../services/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<User | null>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isOnline: true,
  signInWithGoogle: async () => null,
  signOut: async () => {},
  signInAsGuest: async () => null,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    testConnection().then((connected) => setIsOnline(connected));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      return loggedUser;
    } catch (err) {
      console.error('Login with Google error:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await logoutFirebase();
  };

  const handleGuest = async () => {
    try {
      const res = await signInAnonymously(auth);
      return res.user;
    } catch (err) {
      console.warn('Anonymous signin not enabled or failed', err);
      return null;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isOnline,
        signInWithGoogle: handleSignInGoogle,
        signOut: handleSignOut,
        signInAsGuest: handleGuest,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
