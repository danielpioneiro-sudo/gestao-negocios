import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { openDB } from '@/database';

interface AppContextType {
  db: SQLiteDatabase | null;
  isReady: boolean;
}

const AppContext = createContext<AppContextType>({ db: null, isReady: false });

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    openDB().then(setDb).catch(console.error);
  }, []);

  return (
    <AppContext.Provider value={{ db, isReady: !!db }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export function useDB(): SQLiteDatabase {
  const { db } = useContext(AppContext);
  if (!db) throw new Error('DB not ready');
  return db;
}
