import { v4 as uuidv4 } from 'uuid';
import { Room, Player, BoardConfig, DifficultyLevel, createEmptyBoard } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IRoomService } from '../../domain/ports/IServices';
import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';
import { UserService } from './UserService';

export class RoomService implements IRoomService {
 constructor(
  private roomRepository: IRoomRepository,
  private userService: UserService
 ) { }

 async createRoom(
  username: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; playerId: string }> {
  const user = await this.userService.getUser(username);
  if (!user) throw new Error('User not found');

  const roomId = uuidv4();
  const playerId = user.username;

  const player: Player = {
   id: playerId,
   color: 'RED',
   isReady: false,
  };

  const room: Room = {
   id: roomId,
   config,
   difficulty,
   isPublic,
   players: new Map([[playerId, player]]),
   gameState: {
    board: createEmptyBoard(config),
    currentPlayer: 'PLAYER_1',
    status: 'WAITING',
    winner: null,
    winningCells: null,
    moveHistory: [],
   },
   createdAt: new Date(),
   turnStartedAt: null,
  };

  await this.roomRepository.save(room);
  return { room, playerId };
 }

 async joinRoom(
  roomId: string,
  username: string,
  socketId: string,
  _ignored?: string
 ): Promise<{ room: Room; playerId: string; error?: string }> {
  const user = await this.userService.getUser(username);
  if (!user) return { room: {} as any, playerId: '', error: 'User not found' };

  const room = await this.roomRepository.findById(roomId);
  if (!room) throw new Error('Room not found');

  if (room.players.has(user.username)) {
   await this.roomRepository.trackPlayer(socketId, roomId);
   return { room, playerId: user.username };
  }

  if (room.players.size >= 2) return { room, playerId: '', error: 'Room is full' };
  if (room.gameState.status !== 'WAITING') return { room, playerId: '', error: 'Game already in progress' };

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

  return { room, playerId: newPlayerId };
 }

 async leaveRoom(socketId: string, playerId: string): Promise<{ roomId: string; room?: Room }> {
  const roomId = await this.roomRepository.getPlayerRoomId(socketId);
  if (!roomId) throw new Error('Not in a room');

  const room = await this.roomRepository.findById(roomId);
  if (!room) {
   await this.roomRepository.untrackPlayer(socketId);
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
}
