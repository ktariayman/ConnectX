import { Room, GameState, Player, Move } from '@connect-x/shared';

export interface RoomUpdateData {
 room?: RoomData;
 playerId?: string;
 gameState?: GameStateData;
 context?: GameContextData;
 turnStartedAt?: string | null;
 players?: PlayerData[];
}

export interface RoomData {
 id: string;
 players: PlayerData[];
 spectators?: string[];
 createdAt: string;
 turnStartedAt?: string | null;
 difficulty: string;
 config: any;
 gameState: GameStateData;
 isPublic: boolean;
 status: string;
}

export interface PlayerData {
 id: string;
 color: string;
 isReady: boolean;
 isVisible?: boolean;
}

export interface GameStateData {
 board: any[][];
 status: string;
 currentPlayer: number;
 winner: string | null;
 winningCells: [number, number][] | null;
 moveHistory: MoveData[];
}

export interface MoveData {
 player: number;
 column: number;
 row: number;
 timestamp: string;
}

export interface GameContextData {
 isMyTurn: boolean;
 myColor?: string;
 activeColor?: string;
 opponentName?: string;
 status: string;
 timeLeft?: number;
 isSpectator: boolean;
 isCreator: boolean;
}

export type RoomUpdateCallback = (data: RoomUpdateData) => void;
export type ErrorCallback = (data: { message: string }) => void;
export type GameMoveCallback = (data: RoomUpdateData) => void;
export type GameOverCallback = (data: RoomUpdateData & { reason?: string }) => void;
export type VisibilityChangeCallback = (data: { playerId: string; isVisible: boolean }) => void;
