import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Hook customizado para encapsular requisições HTTP com Axios
 * Tratamento explícito dos estados loading, error e data (RF09)
 */
export function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err?.message || 'Falha na requisição');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
