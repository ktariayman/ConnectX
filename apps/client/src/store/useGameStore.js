import { create } from 'zustand';
export const useGameStore = create((set) => ({
    roomName: null,
    setRoomName: (name) => set({ roomName: name }),
}));
//# sourceMappingURL=useGameStore.js.map