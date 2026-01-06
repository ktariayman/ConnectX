import { Move, BoardConfig, DifficultyLevel } from './game';

export interface GameHistory {
 id: string;
 roomId: string;
 players: string[];
 winner: 'PLAYER_1' | 'PLAYER_2' | 'DRAW' | null;
 config: BoardConfig;
 difficulty: DifficultyLevel;
 moveHistory: Move[];
 createdAt: Date;
 finishedAt: Date;
}
