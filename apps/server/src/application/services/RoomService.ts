import { v4 as uuidv4 } from 'uuid';
import { Room, Player, BoardConfig, DifficultyLevel, createEmptyBoard, GAME_STATUS, PLAYER_TYPE } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IRoomService } from '../../domain/ports/IServices';
import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';
import { UserService } from './UserService';

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

@injectable()
export class RoomService implements IRoomService {
 constructor(
  @inject(TYPES.RoomRepository) private roomRepository: IRoomRepository,
  @inject(TYPES.UserService) private userService: UserService
 ) { }

 async createRoom(
  username: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; username: string }> {
  const user = await this.userService.getUser(username);
  if (!user) throw new Error('User not found');

  const roomId = uuidv4();
  // In our identity system, playerId IS the username
  const playerId = user.username;

  const player: Player = {
   id: playerId,
   color: 'RED',
   isReady: false,
  };

  const room: Room = {
   id: roomId,
   creatorId: playerId,
   config,
   difficulty,
   isPublic,
   players: new Map([[playerId, player]]),
   spectators: new Set(),
   gameState: {
    board: createEmptyBoard(config),
    currentPlayer: PLAYER_TYPE.PLAYER_1,
    status: GAME_STATUS.WAITING,
    winner: null,
    winningCells: null,
    moveHistory: [],
   },
   createdAt: new Date(),
   turnStartedAt: null,
  };

  await this.roomRepository.save(room);
  return { room, username: playerId };
 }

 async joinRoom(
  roomId: string,
  username: string,
  socketId: string,
  _ignored?: string // Kept for backwards compatibility, will be removed
 ): Promise<{ room: Room; username: string; error?: string }> {
  const user = await this.userService.getUser(username);
  if (!user) return { room: {} as any, username: '', error: 'User not found' };

  const room = await this.roomRepository.findById(roomId);
  if (!room) throw new Error('Room not found');

  if (room.players.has(user.username)) {
   if (room.gameState.status === GAME_STATUS.FINISHED) {
    return { room, username: '', error: 'This game has finished. Use the replay feature to watch it.' };
   }
   await this.roomRepository.trackPlayer(socketId, roomId);
   return { room, username: user.username };
  }

  if (room.players.size >= 2) return { room, username: '', error: 'Room is full' };
  if (room.gameState.status !== GAME_STATUS.WAITING) return { room, username: '', error: 'Game already in progress' };

  const newPlayerId = user.username;
  const player: Player = {
   id: newPlayerId,
   color: 'BLUE',
   isReady: false,
  };

  room.players.set(newPlayerId, player);
  await this.roomRepository.save(room);
  await this.roomRepository.trackPlayer(socketId, roomId);

  gameEvents.emitEvent(GameEvent.PLAYER_JOINED, { roomId, playerId: newPlayerId, displayName: user.username });
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });

  return { room, username: newPlayerId };
 }

 async leaveRoom(socketId: string, playerId: string): Promise<{ roomId: string; room?: Room }> {
  const roomId = await this.roomRepository.getPlayerRoomId(socketId);
  if (!roomId) throw new Error('Not in a room');

  const room = await this.roomRepository.findById(roomId);
  if (!room) {
   await this.roomRepository.untrackPlayer(socketId);
   return { roomId };
  }
  if (room.creatorId === playerId) {
   await this.roomRepository.delete(roomId);
   await this.roomRepository.untrackPlayer(socketId);
   gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room: { ...room, gameState: { ...room.gameState, status: GAME_STATUS.FINISHED } } });
   return { roomId };
  }

  room.players.delete(playerId);
  await this.roomRepository.untrackPlayer(socketId);

  if (room.players.size === 0) {
   await this.roomRepository.delete(roomId);
  } else {
   await this.roomRepository.save(room);
   gameEvents.emitEvent(GameEvent.PLAYER_LEFT, { roomId, playerId });
   gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });
  }

  return { roomId, room };
 }

 async getPublicRooms(): Promise<Room[]> {
  return this.roomRepository.findAllPublic();
 }

 async getRoom(roomId: string): Promise<Room | undefined> {
  return this.roomRepository.findById(roomId);
 }

 async joinAsSpectator(
  roomId: string,
  username: string,
  socketId: string
 ): Promise<{ room: Room; username: string; error?: string }> {
  const user = await this.userService.getUser(username);
  if (!user) return { room: {} as any, username: '', error: 'User not found' };

  const room = await this.roomRepository.findById(roomId);
  if (!room) return { room: {} as any, username: '', error: 'Room not found' };

  // Check if user is already a player in this room
  if (room.players.has(user.username)) {
   return { room: {} as any, username: '', error: 'You are already a player in this game' };
  }

  if (room.gameState.status === GAME_STATUS.FINISHED) {
   return { room: {} as any, username: '', error: 'This game has finished. Use the replay feature to watch it.' };
  }

  if (room.creatorId === user.username) {
   return { room: {} as any, username: '', error: 'Room creator cannot spectate their own room' };
  }

  if (room.spectators.has(user.username)) {
   await this.roomRepository.trackPlayer(socketId, roomId);
   return { room, username: user.username };
  }

  room.spectators.add(user.username);
  await this.roomRepository.save(room);
  await this.roomRepository.trackPlayer(socketId, roomId);

  gameEvents.emitEvent(GameEvent.SPECTATOR_JOINED, { roomId, username: user.username });
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });

  return { room, username: user.username };
 }

 async leaveAsSpectator(socketId: string, username: string): Promise<{ roomId: string; room?: Room }> {
  const roomId = await this.roomRepository.getPlayerRoomId(socketId);
  if (!roomId) throw new Error('Not in a room');

  const room = await this.roomRepository.findById(roomId);
  if (!room) {
   await this.roomRepository.untrackPlayer(socketId);
   return { roomId };
  }

  room.spectators.delete(username);
  await this.roomRepository.untrackPlayer(socketId);
  await this.roomRepository.save(room);

  gameEvents.emitEvent(GameEvent.SPECTATOR_LEFT, { roomId, username });
  gameEvents.emitEvent(GameEvent.ROOM_UPDATED, { roomId, room });

  return { roomId, room };
 }
}

