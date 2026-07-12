import { useState, useEffect } from 'react';

export function useApi<T>(fetcher: () => Promise<any>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Data fetching failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, deps);

  return { data, isLoading, error, refetch: fetch, setData };
}

export default useApi;
