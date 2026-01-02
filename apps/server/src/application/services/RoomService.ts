import { Room, BoardConfig, DifficultyLevel } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IRoomService } from '../../domain/ports/IServices';

export class RoomService implements IRoomService {
 constructor(private roomRepository: IRoomRepository) { }

 async createRoom(
  creatorName: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; playerId: string }> {

  throw new Error('Method not implemented.');
 }

 async joinRoom(
  roomId: string,
  displayName: string,
  socketId: string,
  playerId?: string
 ): Promise<{ room: Room; playerId: string; error?: string }> {

  throw new Error('Method not implemented.');
 }

 async leaveRoom(socketId: string, playerId: string): Promise<{ roomId: string; room?: Room }> {

  throw new Error('Method not implemented.');
 }

 async getPublicRooms(): Promise<Room[]> {

  throw new Error('Method not implemented.');
 }

 async getRoom(roomId: string): Promise<Room | undefined> {

  throw new Error('Method not implemented.');
 }
}
