import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialValue;
      return typeof initialValue === 'string' ? saved : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`Erro ao salvar "${key}" no localStorage:`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
