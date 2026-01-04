import { DIFFICULTY_LEVELS } from '../constants/game';

export interface User {
 username: string;
 createdAt: Date;
}

export type CellState = 'EMPTY' | 'PLAYER_1' | 'PLAYER_2';
export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
export type PlayerColor = 'RED' | 'BLUE';
export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

export interface BoardConfig {
 rows: number;
 columns: number;
 connectCount: number;
}

export interface Player {
 id: string; // This is the username
 color: PlayerColor;
 isReady: boolean;
}

export interface GameState {
 board: CellState[][];
 currentPlayer: 'PLAYER_1' | 'PLAYER_2';
 status: GameStatus;
 winner: 'PLAYER_1' | 'PLAYER_2' | 'DRAW' | null;
 winningCells: [number, number][] | null;
 moveHistory: Move[];
}

export interface Move {
 column: number;
 row: number;
 player: 'PLAYER_1' | 'PLAYER_2';
 timestamp: Date;
}

export interface Room {
 id: string;
 config: BoardConfig;
 difficulty: DifficultyLevel;
 isPublic: boolean;
 players: Map<string, Player>;
 gameState: GameState;
 createdAt: Date;
 turnStartedAt: Date | null;
}
