import { useSyncExternalStore } from 'react';
import { subscribe, getEnvironment } from '@/lib/appEnvironment';
import type { AppEnvironment } from '@/lib/appEnvironment';

export type { AppEnvironment };

export function useAppEnvironment(): AppEnvironment {
  return useSyncExternalStore(subscribe, getEnvironment, getEnvironment);
}
