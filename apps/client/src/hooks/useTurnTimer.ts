import { useState, useEffect } from 'react';
import { Room, GameState } from '@connect-x/shared';
import { GAME_STATUS } from '@connect-x/shared';

export function useTurnTimer(gameState: GameState | null, room: Room | null, difficulty: string) {
 const [timeLeft, setTimeLeft] = useState<number | null>(null);

 useEffect(() => {
  if (gameState?.status !== GAME_STATUS.IN_PROGRESS || !room?.turnStartedAt) {
   setTimeLeft(null);
   return;
  }

  const updateTimer = () => {
   const turnDuration = getTurnDuration(difficulty);
   const elapsed = Date.now() - room.turnStartedAt!.getTime();
   const remaining = Math.max(0, turnDuration - Math.floor(elapsed / 1000));
   setTimeLeft(remaining);
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);

  return () => clearInterval(interval);
 }, [gameState?.status, room?.turnStartedAt, difficulty]);

 return timeLeft;
}

function getTurnDuration(difficulty: string): number {
 switch (difficulty) {
  case 'EASY': return 60;
  case 'MEDIUM': return 30;
  case 'HARD': return 15;
  default: return 30;
 }
}
