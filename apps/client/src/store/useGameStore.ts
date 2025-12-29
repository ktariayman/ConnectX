import { create } from 'zustand';

interface GameState {
 roomName: string | null;
 setRoomName: (name: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
 roomName: null,
 setRoomName: (name) => set({ roomName: name }),
}));
