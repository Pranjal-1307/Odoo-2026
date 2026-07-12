import { useState, useEffect } from 'react';
import notificationService from '../services/notification.service';

export function useNotificationCount() {
  const [count, setCount] = useState<number>(0);

  const fetchCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.data?.success) {
        setCount(res.data.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, refetch: fetchCount };
}
