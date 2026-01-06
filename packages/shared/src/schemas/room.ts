import { z } from 'zod';
import { BOARD_LIMITS, DIFFICULTY_LEVELS_KEYS } from '../constants/game';
import { PLAYER_COLOR } from '../constants/status';

export const BoardConfigSchema = z.object({
 rows: z.number().int().min(BOARD_LIMITS.minRows).max(BOARD_LIMITS.maxRows),
 columns: z.number().int().min(BOARD_LIMITS.minColumns).max(BOARD_LIMITS.maxColumns),
 connectCount: z.number().int().min(BOARD_LIMITS.minConnect).max(BOARD_LIMITS.maxConnect),
});

export const RoomCreateSchema = z.object({
 username: z.string().min(2).max(20).trim(),
 config: BoardConfigSchema.optional(),
 difficulty: z.enum([DIFFICULTY_LEVELS_KEYS.EASY, DIFFICULTY_LEVELS_KEYS.MEDIUM, DIFFICULTY_LEVELS_KEYS.HARD]).default(DIFFICULTY_LEVELS_KEYS.MEDIUM),
 isPublic: z.boolean().default(true),
});

export const RoomJoinSchema = z.object({
 roomId: z.string().uuid(),
 username: z.string().min(2).max(20).trim(),
});

export const RoomSpectateSchema = z.object({
 roomId: z.string().uuid(),
 username: z.string().min(2).max(20).trim(),
});



export const RoomSyncSchema = z.object({
 playerId: z.string().uuid().optional(),
 room: z.any(),
 context: z.object({
  isMyTurn: z.boolean(),
  myColor: z.enum([PLAYER_COLOR.RED, PLAYER_COLOR.BLUE]).optional(),
  activeColor: z.enum([PLAYER_COLOR.RED, PLAYER_COLOR.BLUE]).optional(),
  opponentName: z.string().optional(),
  status: z.string(),
  timeLeft: z.number().int().optional(),
 }).optional(),
});

export const MakeMoveSchema = z.object({
 roomId: z.string().uuid(),
 column: z.number().int().min(0),
});
