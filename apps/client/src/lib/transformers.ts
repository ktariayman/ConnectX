import { Room, GameState } from '@connect-x/shared';
import { RoomData, GameStateData, MoveData } from '../types/socket.types';

/**
 * Transforms raw room data from the server into the client Room format
 * Handles date conversions and Map/Set transformations
 */
export function transformRoomData(roomData: RoomData): Room {
 return {
  ...roomData,
  players: new Map((Array.isArray(roomData.players) ? roomData.players : []).map((p) => [p.id, p])),
  spectators: new Set(Array.isArray(roomData.spectators) ? roomData.spectators : []),
  createdAt: new Date(roomData.createdAt),
  turnStartedAt: roomData.turnStartedAt ? new Date(roomData.turnStartedAt) : null,
  gameState: transformGameState(roomData.gameState),
 } as unknown as Room;
}

/**
 * Transforms raw game state data from the server
 * Converts timestamp strings to Date objects
 */
export function transformGameState(gameStateData: GameStateData): GameState {
 return {
  ...gameStateData,
  moveHistory: (Array.isArray(gameStateData.moveHistory) ? gameStateData.moveHistory : []).map(transformMove),
 } as unknown as GameState;
}

/**
 * Transforms a single move, converting timestamp to Date
 */
export function transformMove(moveData: MoveData) {
 return {
  ...moveData,
  timestamp: new Date(moveData.timestamp),
 };
}

/**
 * Safely extracts room data from socket event data
 */
export function extractRoomData(data: any): RoomData | null {
 const roomData = data.room || data;
 if (!roomData) return null;
 return roomData;
}
