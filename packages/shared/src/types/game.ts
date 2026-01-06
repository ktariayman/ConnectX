import { DIFFICULTY_LEVELS, type DifficultyLevel } from '../constants/game';
export type { DifficultyLevel };
import type { CellState, GameResult, GameStatus, PlayerColor, PlayerType } from '../constants/status';

export type { CellState, GameStatus, PlayerColor };

export interface User {
 username: string;
 createdAt: Date;
}

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
 currentPlayer: PlayerType;
 status: GameStatus;
 winner: GameResult | null;
 winningCells: [number, number][] | null;
 moveHistory: Move[];
}

export interface Move {
 column: number;
 row: number;
 player: PlayerType;
 timestamp: Date;
}

export interface Room {
 id: string;
 creatorId: string;
 config: BoardConfig;
 difficulty: DifficultyLevel;
 isPublic: boolean;
 players: Map<string, Player>;
 spectators: Set<string>;
 gameState: GameState;
 createdAt: Date;
 turnStartedAt: Date | null;
}

