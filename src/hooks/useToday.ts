import { useEffect, useState } from 'react';
import { addDays, startOfDay } from 'date-fns';

// Refresh date-dependent scores and urgency at local midnight, and after sleep.
export function useToday(): Date {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const refresh = () => {
      const next = startOfDay(new Date());
      setToday(previous => previous.getTime() === next.getTime() ? previous : next);
    };
    const timeout = window.setTimeout(refresh, Math.max(1, addDays(today, 1).getTime() - Date.now()));
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [today]);
  return today;
}
