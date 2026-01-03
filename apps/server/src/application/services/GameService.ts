import {
 Room,
 DIFFICULTY_LEVELS,
 applyMove,
 isValidMove,
 getDropRow,
 checkWin,
 createEmptyBoard
} from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IGameService } from '../../domain/ports/IServices';
import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';

export class GameService implements IGameService {
 constructor(private roomRepository: IRoomRepository) { }

 async setPlayerReady(roomId: string, playerId: string): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room) return;

  // Handle rematch reset if game was finished
  if (room.gameState.status === 'FINISHED') {
   this.resetRoomForRematch(room);
  }

  const player = room.players.get(playerId);
  if (!player) return;

  player.isReady = true;

  if (room.players.size === 2 && Array.from(room.players.values()).every(p => p.isReady)) {
   room.gameState.status = 'IN_PROGRESS';
   room.turnStartedAt = new Date();
   gameEvents.emitEvent(GameEvent.GAME_STARTED, { roomId, gameState: room.gameState });
  }

  await this.roomRepository.save(room);
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });
 }

 async makeMove(roomId: string, playerId: string, column: number): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room || room.gameState.status !== 'IN_PROGRESS') return;

  const playerIds = Array.from(room.players.keys());
  const currentPlayerIndex = room.gameState.currentPlayer === 'PLAYER_1' ? 0 : 1;

  if (playerIds[currentPlayerIndex] !== playerId) {
   throw new Error('Not your turn');
  }

  if (!isValidMove(room.gameState.board, column, room.config)) {
   throw new Error('Invalid move');
  }

  const row = getDropRow(room.gameState.board, column);
  room.gameState.board = applyMove(room.gameState.board, column, room.gameState.currentPlayer);

  const move = {
   column,
   row,
   player: room.gameState.currentPlayer,
   timestamp: new Date(),
  };
  room.gameState.moveHistory.push(move);

  const winResult = checkWin(room.gameState.board, room.config);
  if (winResult.winner) {
   this.finishGame(room, winResult.winner, winResult.cells, 'WIN');
  } else {
   room.gameState.currentPlayer = room.gameState.currentPlayer === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
   room.turnStartedAt = new Date();
  }

  await this.roomRepository.save(room);
  gameEvents.emitEvent(GameEvent.GAME_MOVE, {
   roomId,
   move,
   gameState: room.gameState,
   turnStartedAt: room.turnStartedAt
  });
 }

 async handleForfeit(roomId: string, playerId: string, reason: string): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room || room.gameState.status !== 'IN_PROGRESS') return;

  const playerIds = Array.from(room.players.keys());
  const remainingPlayerId = playerIds.find(id => id !== playerId);

  if (remainingPlayerId) {
   const winner = playerIds.indexOf(remainingPlayerId) === 0 ? 'PLAYER_1' : 'PLAYER_2';
   this.finishGame(room, winner, null, reason);
   await this.roomRepository.save(room);
  }
 }

 async checkTimeouts(): Promise<void> {
  const now = Date.now();
  const sessions = await this.roomRepository.getAllActiveSessions();
  const uniqueRoomIds = new Set(sessions.values());

  for (const roomId of uniqueRoomIds) {
   const room = await this.roomRepository.findById(roomId);
   if (room?.gameState.status === 'IN_PROGRESS' && room.turnStartedAt) {
    const limit = DIFFICULTY_LEVELS[room.difficulty].turnTimeSeconds * 1000;
    if (now - room.turnStartedAt.getTime() > limit) {
     const winner = room.gameState.currentPlayer === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
     this.finishGame(room, winner, null, 'TURN_TIMEOUT');
     await this.roomRepository.save(room);
    }
   }
  }
 }

 async requestRematch(roomId: string, playerId: string): Promise<void> {
  // This is essentially setPlayerReady when state is FINISHED
  return this.setPlayerReady(roomId, playerId);
 }

 private finishGame(room: Room, winner: 'PLAYER_1' | 'PLAYER_2' | 'DRAW', cells: [number, number][] | null, reason: string) {
  room.gameState.status = 'FINISHED';
  room.gameState.winner = winner;
  room.gameState.winningCells = cells;
  gameEvents.emitEvent(GameEvent.GAME_OVER, { roomId: room.id, gameState: room.gameState, reason });
 }

 private resetRoomForRematch(room: Room) {
  room.gameState = {
   board: createEmptyBoard(room.config),
   currentPlayer: 'PLAYER_1',
   status: 'WAITING',
   winner: null,
   winningCells: null,
   moveHistory: [],
  };
  room.turnStartedAt = null;
  for (const player of room.players.values()) {
   player.isReady = false;
  }
 }
}
