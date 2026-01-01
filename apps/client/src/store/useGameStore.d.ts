interface GameState {
    roomName: string | null;
    setRoomName: (name: string) => void;
}
export declare const useGameStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GameState>>;
export {};
