import { Room } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';

export class InMemoryRoomRepository implements IRoomRepository {
 private rooms: Map<string, Room> = new Map();
 private activeSessions: Map<string, string> = new Map();

 async save(room: Room): Promise<void> {
 }

 async findById(id: string): Promise<Room | undefined> {
  return undefined;
 }

 async findAllPublic(): Promise<Room[]> {
  return [];
 }

 async delete(id: string): Promise<boolean> {
  return false;
 }

 async trackPlayer(socketId: string, roomId: string): Promise<void> {
 }

 async getPlayerRoomId(socketId: string): Promise<string | undefined> {
  return undefined;
 }

 async untrackPlayer(socketId: string): Promise<void> {
 }

 async getAllActiveSessions(): Promise<Map<string, string>> {
  return new Map();
 }
}
