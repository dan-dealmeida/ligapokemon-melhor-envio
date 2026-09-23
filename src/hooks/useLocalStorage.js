import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved === null || saved === undefined) return initialValue;

      if (typeof initialValue === 'string') {
        return saved;
      }

      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        typeof initialValue === 'object' &&
        initialValue !== null
      ) {
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch (err) {
      console.error(`Erro ao ler "${key}" do localStorage:`, err);
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function' ? newValue(prev) : newValue;
        try {
          const serialized =
            typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
          window.localStorage.setItem(key, serialized);
        } catch (err) {
          console.error(`Erro ao salvar "${key}" no localStorage:`, err);
        }
        return resolved;
      });
    },
    [key]
  );

  useEffect(() => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`Erro ao sincronizar "${key}" no localStorage:`, err);
    }
  }, [key, value]);

  return [value, setStoredValue];
}
