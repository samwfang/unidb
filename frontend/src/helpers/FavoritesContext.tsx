import React, { createContext, useContext, useEffect, useState } from 'react';
import { UniversityData } from './types';

const STORAGE_KEY = 'unidb.favorites';

interface FavoritesContextValue {
  favorites: UniversityData[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (item: UniversityData) => void;
  removeFavorite: (id: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const loadFavorites = (): UniversityData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<UniversityData[]>(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage full or unavailable; keep in-memory state only
    }
  }, [favorites]);

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  const toggleFavorite = (item: UniversityData) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item]
    );
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
