import {
 Room,
 DIFFICULTY_LEVELS,
 applyMove,
 isValidMove,
 getDropRow,
 checkWin,
 createEmptyBoard,
 Player,
 GameHistory,
 GAME_STATUS,
 PLAYER_TYPE,
 GameResult
} from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IGameHistoryRepository } from '../../domain/ports/IGameHistoryRepository';
import { IGameService } from '../../domain/ports/IServices';

import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';
import { v4 as uuidv4 } from 'uuid';
import { SchedulerService } from './SchedulerService';

export class GameService implements IGameService {
 constructor(
  private roomRepository: IRoomRepository,
  private gameHistoryRepository: IGameHistoryRepository,
  private schedulerService: SchedulerService
 ) { }

 async setPlayerReady(roomId: string, username: string): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room) return;

  // Handle rematch reset if game was finished
  if (room.gameState.status === GAME_STATUS.FINISHED) {
   this.resetRoomForRematch(room);
  }

  const player = room.players.get(username);
  if (!player) return;

  player.isReady = true;

  if (room.players.size === 2 && Array.from(room.players.values()).every((p: Player) => p.isReady)) {
   room.gameState.status = GAME_STATUS.IN_PROGRESS;
   room.turnStartedAt = new Date();
   gameEvents.emitEvent(GameEvent.GAME_STARTED, { roomId, gameState: room.gameState });
   this.scheduleTurnTimeout(roomId, room.difficulty);
  }

  await this.roomRepository.save(room);
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });
 }

 async makeMove(roomId: string, username: string, column: number): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room || room.gameState.status !== GAME_STATUS.IN_PROGRESS) return;
  // first thing first we do it clean the timeout in order to start a new timer
  this.clearTurnTimeout(roomId);
  const playerIds = Array.from(room.players.keys());
  const currentPlayerIndex = room.gameState.currentPlayer === PLAYER_TYPE.PLAYER_1 ? 0 : 1;

  if (playerIds[currentPlayerIndex] !== username) {
   this.scheduleTurnTimeout(roomId, room.difficulty, room.turnStartedAt);
   throw new Error('Not your turn');
  }

  if (!isValidMove(room.gameState.board, column, room.config)) {
   this.scheduleTurnTimeout(roomId, room.difficulty, room.turnStartedAt);
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
   room.gameState.currentPlayer = room.gameState.currentPlayer === PLAYER_TYPE.PLAYER_1 ? PLAYER_TYPE.PLAYER_2 : PLAYER_TYPE.PLAYER_1;
   room.turnStartedAt = new Date();
   this.scheduleTurnTimeout(roomId, room.difficulty);
  }

  await this.roomRepository.save(room);
  gameEvents.emitEvent(GameEvent.GAME_MOVE, {
   roomId,
   move,
   gameState: room.gameState,
   turnStartedAt: room.turnStartedAt
  });
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });
 }

 async handleForfeit(roomId: string, username: string, reason: string): Promise<void> {
  this.clearTurnTimeout(roomId);
  const room = await this.roomRepository.findById(roomId);
  if (!room || room.gameState.status !== GAME_STATUS.IN_PROGRESS) return;

  const playerIds = Array.from(room.players.keys());
  const remainingPlayerId = playerIds.find(id => id !== username);

  if (remainingPlayerId) {
   const winner = playerIds.indexOf(remainingPlayerId) === 0 ? PLAYER_TYPE.PLAYER_1 : PLAYER_TYPE.PLAYER_2;
   this.finishGame(room, winner, null, reason);
   await this.roomRepository.save(room);
  }
 }


 async updatePlayerVisibility(roomId: string, username: string, isVisible: boolean): Promise<void> {
  const room = await this.roomRepository.findById(roomId);
  if (!room) return;

  const player = room.players.get(username);
  if (player) {
   player.isVisible = isVisible;
   await this.roomRepository.save(room);
   gameEvents.emitEvent(GameEvent.PLAYER_VISIBILITY_CHANGE, { roomId, username, isVisible });
   gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });
  }
 }

 async requestRematch(roomId: string, username: string): Promise<void> {
  // This is essentially setPlayerReady when state is FINISHED
  return this.setPlayerReady(roomId, username);
 }
 private scheduleTurnTimeout(roomId: string, difficulty: string, startTime?: Date | null) {
  const limitSeconds = DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS].turnTimeSeconds;
  const now = Date.now();
  const start = startTime ? startTime.getTime() : now;
  const elapsed = now - start;
  const remaining = Math.max(0, (limitSeconds * 1000) - elapsed);

  this.schedulerService.schedule(roomId, remaining, async () => {
   const room = await this.roomRepository.findById(roomId);
   if (room && room.gameState.status === GAME_STATUS.IN_PROGRESS) {
    const winner = room.gameState.currentPlayer === PLAYER_TYPE.PLAYER_1 ? PLAYER_TYPE.PLAYER_2 : PLAYER_TYPE.PLAYER_1;
    await this.finishGame(room, winner, null, 'TURN_TIMEOUT');
    await this.roomRepository.save(room);
   }
  });
 }

 private clearTurnTimeout(roomId: string) {
  this.schedulerService.cancel(roomId);
 }

 private async finishGame(room: Room, winner: GameResult, cells: [number, number][] | null, reason: string) {
  room.gameState.status = GAME_STATUS.FINISHED;
  room.gameState.winner = winner;
  room.gameState.winningCells = cells;
  const gameHistory: GameHistory = {
   id: uuidv4(),
   roomId: room.id,
   players: Array.from(room.players.keys()),
   winner,
   config: room.config,
   difficulty: room.difficulty,
   moveHistory: room.gameState.moveHistory,
   createdAt: room.createdAt,
   finishedAt: new Date(),
  };

  await this.gameHistoryRepository.save(gameHistory);

  gameEvents.emitEvent(GameEvent.GAME_OVER, { roomId: room.id, gameState: room.gameState, reason });
 }

 private resetRoomForRematch(room: Room) {
  room.gameState = {
   board: createEmptyBoard(room.config),
   currentPlayer: PLAYER_TYPE.PLAYER_1,
   status: GAME_STATUS.WAITING,
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
