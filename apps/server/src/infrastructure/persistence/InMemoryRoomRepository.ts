import { Room } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { injectable } from 'inversify';

@injectable()
export class InMemoryRoomRepository implements IRoomRepository {
 private rooms: Map<string, Room> = new Map();
 private activeSessions: Map<string, string> = new Map();

 async save(room: Room): Promise<void> {
  this.rooms.set(room.id, room);
 }

 async findById(id: string): Promise<Room | undefined> {
  return this.rooms.get(id);
 }

 async findAllPublic(): Promise<Room[]> {
  return Array.from(this.rooms.values()).filter(
   room => room.isPublic
  );
 }

 async delete(id: string): Promise<boolean> {
  for (const [socketId, roomId] of this.activeSessions.entries()) {
   if (roomId === id) {
    this.activeSessions.delete(socketId);
   }
  }
  return this.rooms.delete(id);
 }

 async trackPlayer(socketId: string, roomId: string): Promise<void> {
  this.activeSessions.set(socketId, roomId);
 }

 async getPlayerRoomId(socketId: string): Promise<string | undefined> {
  return this.activeSessions.get(socketId);
 }

 async untrackPlayer(socketId: string): Promise<void> {
  this.activeSessions.delete(socketId);
 }

 async getAllActiveSessions(): Promise<Map<string, string>> {
  return new Map(this.activeSessions);
 }
}
