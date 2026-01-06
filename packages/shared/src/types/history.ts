import { GameResult } from '../constants/status';
import { Move, BoardConfig, DifficultyLevel } from './game';

export interface GameHistory {
 id: string;
 roomId: string;
 players: string[];
 winner: GameResult | null;
 config: BoardConfig;
 difficulty: DifficultyLevel;
 moveHistory: Move[];
 createdAt: Date;
 finishedAt: Date;
}
