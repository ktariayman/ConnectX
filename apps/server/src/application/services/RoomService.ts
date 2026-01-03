import { v4 as uuidv4 } from 'uuid';
import { Room, Player, BoardConfig, DifficultyLevel, createEmptyBoard } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IRoomService } from '../../domain/ports/IServices';
import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';

export class RoomService implements IRoomService {
 constructor(private roomRepository: IRoomRepository) { }

 async createRoom(
  creatorName: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; playerId: string }> {
  const roomId = uuidv4();
  const playerId = uuidv4();

  const player: Player = {
   id: playerId,
   displayName: creatorName,
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
  displayName: string,
  socketId: string,
  playerId?: string
 ): Promise<{ room: Room; playerId: string; error?: string }> {
  const room = await this.roomRepository.findById(roomId);
  if (!room) throw new Error('Room not found');

  if (playerId) {
   const existingPlayer = room.players.get(playerId);
   if (existingPlayer) {
    await this.roomRepository.trackPlayer(socketId, roomId);
    return { room, playerId: existingPlayer.id };
   }
  }

  if (room.players.size >= 2) return { room, playerId: '', error: 'Room is full' };
  if (room.gameState.status !== 'WAITING') return { room, playerId: '', error: 'Game already in progress' };

  const newPlayerId = uuidv4();
  const player: Player = {
   id: newPlayerId,
   displayName,
   color: 'BLUE',
   isReady: false,
  };

  room.players.set(newPlayerId, player);
  await this.roomRepository.save(room);
  await this.roomRepository.trackPlayer(socketId, roomId);

  gameEvents.emitEvent(GameEvent.PLAYER_JOINED, { roomId, playerId: newPlayerId, displayName });
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
