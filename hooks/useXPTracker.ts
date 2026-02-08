import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { dataService } from '@/services/dataService';

const XP_PER_INTERVAL = 1;
const INTERVAL_MINUTES = 2;

export function useXPTracker(userId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!userId) return;

    const startTracking = () => {
      sessionStartRef.current = new Date();
      
      intervalRef.current = setInterval(async () => {
        await dataService.updateUserXP(userId, XP_PER_INTERVAL);
      }, INTERVAL_MINUTES * 60 * 1000);
    };

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startTracking();
      } else {
        stopTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    startTracking();

    return () => {
      stopTracking();
      subscription.remove();
    };
  }, [userId]);
}
