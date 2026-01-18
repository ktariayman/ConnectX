import { useEffect } from 'react';
import { socket, socketEmit } from '../lib/socket';

export function useVisibilityTracking(roomId: string | undefined, playerId: string | undefined, isSpectator: boolean) {
 useEffect(() => {
  if (!roomId || !playerId || isSpectator) return;

  const handleVisibilityChange = () => {
   const isVisible = document.visibilityState === 'visible';
   socketEmit.emitVisibilityChange(isVisible);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
   document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
 }, [roomId, playerId, isSpectator]);
}
