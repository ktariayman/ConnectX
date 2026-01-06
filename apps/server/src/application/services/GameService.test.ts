import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from './GameService';
import { InMemoryRoomRepository } from '../../infrastructure/persistence/InMemoryRoomRepository';
import { DEFAULT_BOARD_CONFIG, DIFFICULTY_LEVELS_KEYS, GAME_RESULT, GAME_STATUS } from '@connect-x/shared';
import { RoomService } from './RoomService';
import { userService } from '../../registry';
import { InMemoryGameHistoryRepository } from '../../infrastructure/persistence/InMemoryGameHistoryRepository';

describe('GameService', () => {
 let gameService: GameService;
 let roomService: RoomService;
 let repository: InMemoryRoomRepository;

 beforeEach(() => {
  repository = new InMemoryRoomRepository();
  gameService = new GameService(repository, new InMemoryGameHistoryRepository());
  roomService = new RoomService(repository, userService);
 });

 it('should allow players to win a game', async () => {
  // 0. Register players
  await userService.register('Player 1');
  await userService.register('Player 2');

  // 1. Create a room
  const { room, username: p1Id } = await roomService.createRoom(
   'Player 1',
   DEFAULT_BOARD_CONFIG,
   DIFFICULTY_LEVELS_KEYS.MEDIUM,
   true
  );
  const roomId = room.id;

  // 2. Join a second player
  const { username: p2Id } = await roomService.joinRoom(roomId, 'Player 2', 'socket-2');

  // 3. Set both ready to start the game
  await gameService.setPlayerReady(roomId, p1Id);
  await gameService.setPlayerReady(roomId, p2Id);

  const updatedRoom = await repository.findById(roomId);
  expect(updatedRoom?.gameState.status).toBe(GAME_STATUS.IN_PROGRESS);

  // 4. Play a quick winning sequence (Connect 4 in column 0)
  await gameService.makeMove(roomId, p1Id, 0); // R
  await gameService.makeMove(roomId, p2Id, 1); // B
  await gameService.makeMove(roomId, p1Id, 0); // R
  await gameService.makeMove(roomId, p2Id, 1); // B
  await gameService.makeMove(roomId, p1Id, 0); // R
  await gameService.makeMove(roomId, p2Id, 1); // B
  await gameService.makeMove(roomId, p1Id, 0); // R - WINNER!

  const finalRoom = await repository.findById(roomId);
  expect(finalRoom?.gameState.status).toBe(GAME_STATUS.FINISHED);
  expect(finalRoom?.gameState.winner).toBe(GAME_RESULT.PLAYER_1);
 });

 it('should enforce turn rules', async () => {
  // 0. Register players
  await userService.register('P1');
  await userService.register('P2');

  const { room, username: p1Id } = await roomService.createRoom('P1', DEFAULT_BOARD_CONFIG, DIFFICULTY_LEVELS_KEYS.MEDIUM, true);
  const { username: p2Id } = await roomService.joinRoom(room.id, 'P2', 'socket-2');
  await gameService.setPlayerReady(room.id, p1Id);
  await gameService.setPlayerReady(room.id, p2Id);

  // P1 moves first
  await gameService.makeMove(room.id, p1Id, 0);

  // P1 tries to move again immediately - should fail
  await expect(gameService.makeMove(room.id, p1Id, 0)).rejects.toThrow('Not your turn');
 });
});
