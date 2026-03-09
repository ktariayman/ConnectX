import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Room } from '@connect-x/shared';
import { PlayerColor } from '@connect-x/shared';

export interface GameContext {
 isMyTurn: boolean;
 myColor?: PlayerColor;
 activeColor?: PlayerColor;
 opponentName?: string;
 status: string;
 timeLeft?: number;
 isSpectator: boolean;
 isCreator: boolean;
}

interface GameStore {
 room: Room | null;
 playerId: string | null;
 username: string | null;
 gameState: GameState | null;
 context: GameContext | null;
 isConnected: boolean;
 error: string | null;

 setRoom: (room: Room) => void;
 setPlayerId: (id: string) => void;
 setUsername: (username: string) => void;
 setGameState: (state: GameState) => void;
 setContext: (context: GameContext) => void;
 setConnected: (connected: boolean) => void;
 setError: (error: string | null) => void;
 clearSession: () => void;
 reset: () => void;
}

export const useGameStore = create<GameStore>()(
 persist(
  (set) => ({
   room: null,
   playerId: null,
   username: null,
   gameState: null,
   context: null,
   isConnected: false,
   error: null,

   setRoom: (room) => set({ room }),
   setPlayerId: (id) => set({ playerId: id }),
   setUsername: (username) => set({ username }),
   setGameState: (gameState) => set({ gameState }),
   setContext: (context) => set({ context }),
   setConnected: (isConnected) => set({ isConnected }),
   setError: (error) => set({ error }),
   clearSession: () => set({ room: null, gameState: null, context: null, error: null }),
   reset: () => set({
    room: null,
    playerId: null,
    username: null,
    gameState: null,
    context: null,
    isConnected: false,
    error: null,
   }),
  }),
  {
   name: 'connectx-game-storage',
   partialize: (state) => ({
    playerId: state.playerId,
    username: state.username,
   }),
  }
 )
);
