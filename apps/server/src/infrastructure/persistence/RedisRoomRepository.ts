import { Room } from '@connect-x/shared';
import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { injectable, inject } from 'inversify';
import { RedisConnection } from '../database/RedisConnection';
import { TYPES } from '../../types';
import config from '../../config';

@injectable()
export class RedisRoomRepository implements IRoomRepository {
 constructor(
  @inject(TYPES.RedisConnection) private redisConnection: RedisConnection
 ) { }

 async save(room: Room): Promise<void> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`room:${room.id}`);

  // Serialize the room (convert Map and Set to arrays)
  const serializedRoom = {
   ...room,
   players: Array.from(room.players.entries()),
   spectators: Array.from(room.spectators),
   createdAt: room.createdAt.toISOString(),
   turnStartedAt: room.turnStartedAt?.toISOString() || null,
   gameState: {
    ...room.gameState,
    moveHistory: room.gameState.moveHistory.map(move => ({
     ...move,
     timestamp: move.timestamp.toISOString(),
    })),
   },
  };

  await client.setEx(
   key,
   config.session.roomTTL,
   JSON.stringify(serializedRoom)
  );

  // Add to public rooms index if public
  if (room.isPublic) {
   await client.sAdd(this.redisConnection.getKey('rooms:public'), room.id);
   await client.expire(this.redisConnection.getKey('rooms:public'), config.session.roomTTL);
  }
 }

 async findById(id: string): Promise<Room | undefined> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`room:${id}`);

  const data = await client.get(key);
  if (!data) {
   return undefined;
  }

  return this.deserializeRoom(JSON.parse(data));
 }

 async findAllPublic(): Promise<Room[]> {
  const client = this.redisConnection.getClient();
  const publicRoomsKey = this.redisConnection.getKey('rooms:public');

  const roomIds = await client.sMembers(publicRoomsKey);
  const rooms: Room[] = [];

  for (const roomId of roomIds) {
   const room = await this.findById(roomId);
   if (room) {
    rooms.push(room);
   } else {
    // Clean up stale reference
    await client.sRem(publicRoomsKey, roomId);
   }
  }

  return rooms;
 }

 async delete(id: string): Promise<boolean> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`room:${id}`);

  // Remove from public rooms index
  await client.sRem(this.redisConnection.getKey('rooms:public'), id);

  // Delete all sessions for this room
  const sessionsKey = this.redisConnection.getKey('sessions');
  const allSessions = await client.hGetAll(sessionsKey);

  for (const [socketId, roomId] of Object.entries(allSessions)) {
   if (roomId === id) {
    await client.hDel(sessionsKey, socketId);
   }
  }

  const result = await client.del(key);
  return result > 0;
 }

 async trackPlayer(socketId: string, roomId: string): Promise<void> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey('sessions');

  await client.hSet(key, socketId, roomId);
  await client.expire(key, config.session.ttl);
 }

 async getPlayerRoomId(socketId: string): Promise<string | undefined> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey('sessions');

  const roomId = await client.hGet(key, socketId);
  return roomId || undefined;
 }

 async untrackPlayer(socketId: string): Promise<void> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey('sessions');

  await client.hDel(key, socketId);
 }

 async getAllActiveSessions(): Promise<Map<string, string>> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey('sessions');

  const sessions = await client.hGetAll(key);
  return new Map(Object.entries(sessions));
 }

 private deserializeRoom(data: any): Room {
  return {
   ...data,
   players: new Map(data.players),
   spectators: new Set(data.spectators),
   createdAt: new Date(data.createdAt),
   turnStartedAt: data.turnStartedAt ? new Date(data.turnStartedAt) : null,
   gameState: {
    ...data.gameState,
    moveHistory: data.gameState.moveHistory.map((move: any) => ({
     ...move,
     timestamp: new Date(move.timestamp),
    })),
   },
  };
 }
}
