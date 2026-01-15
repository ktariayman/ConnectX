import { GameHistory } from '@connect-x/shared';
import { IGameHistoryRepository } from '../../domain/ports/IGameHistoryRepository';
import { injectable, inject } from 'inversify';
import { RedisConnection } from '../database/RedisConnection';
import { TYPES } from '../../types';
import config from '../../config';

@injectable()
export class RedisGameHistoryRepository implements IGameHistoryRepository {
 constructor(
  @inject(TYPES.RedisConnection) private redisConnection: RedisConnection
 ) { }

 async save(game: GameHistory): Promise<void> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`game:${game.id}`);

  const serializedGame = {
   id: game.id,
   roomId: game.roomId,
   players: game.players,
   winner: game.winner,
   config: game.config,
   difficulty: game.difficulty,
   moveHistory: game.moveHistory.map(move => ({
    ...move,
    timestamp: move.timestamp.toISOString(),
   })),
   createdAt: game.createdAt.toISOString(),
   finishedAt: game.finishedAt.toISOString(),
  };

  // Save game with TTL
  await client.setEx(
   key,
   config.session.gameHistoryTTL,
   JSON.stringify(serializedGame)
  );

  // Add to games index
  await client.sAdd(this.redisConnection.getKey('games:all'), game.id);
  await client.expire(this.redisConnection.getKey('games:all'), config.session.gameHistoryTTL);

  // Add to room-game mapping
  await client.set(
   this.redisConnection.getKey(`game:room:${game.roomId}`),
   game.id,
   { EX: config.session.gameHistoryTTL }
  );

  // Add to player-games mapping for each player
  for (const player of game.players) {
   await client.sAdd(
    this.redisConnection.getKey(`games:player:${player}`),
    game.id
   );
   await client.expire(
    this.redisConnection.getKey(`games:player:${player}`),
    config.session.gameHistoryTTL
   );
  }
 }

 async findById(id: string): Promise<GameHistory | undefined> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`game:${id}`);

  const data = await client.get(key);
  if (!data) {
   return undefined;
  }

  return this.deserializeGame(JSON.parse(data));
 }

 async findByRoomId(roomId: string): Promise<GameHistory | undefined> {
  const client = this.redisConnection.getClient();
  const gameIdKey = this.redisConnection.getKey(`game:room:${roomId}`);

  const gameId = await client.get(gameIdKey);
  if (!gameId) {
   return undefined;
  }

  return this.findById(gameId);
 }

 async findByPlayer(username: string): Promise<GameHistory[]> {
  const client = this.redisConnection.getClient();
  const gamesKey = this.redisConnection.getKey(`games:player:${username}`);

  const gameIds = await client.sMembers(gamesKey);
  const games: GameHistory[] = [];

  for (const gameId of gameIds) {
   const game = await this.findById(gameId);
   if (game) {
    games.push(game);
   } else {
    // Clean up stale reference
    await client.sRem(gamesKey, gameId);
   }
  }

  // Sort by finished date (most recent first)
  return games.sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime());
 }

 async findAll(): Promise<GameHistory[]> {
  const client = this.redisConnection.getClient();
  const gamesKey = this.redisConnection.getKey('games:all');

  const gameIds = await client.sMembers(gamesKey);
  const games: GameHistory[] = [];

  for (const gameId of gameIds) {
   const game = await this.findById(gameId);
   if (game) {
    games.push(game);
   } else {
    // Clean up stale reference
    await client.sRem(gamesKey, gameId);
   }
  }

  // Sort by finished date (most recent first)
  return games.sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime());
 }

 private deserializeGame(data: any): GameHistory {
  return {
   id: data.id,
   roomId: data.roomId,
   players: data.players,
   winner: data.winner,
   config: data.config,
   difficulty: data.difficulty,
   moveHistory: data.moveHistory.map((move: any) => ({
    ...move,
    timestamp: new Date(move.timestamp),
   })),
   createdAt: new Date(data.createdAt),
   finishedAt: new Date(data.finishedAt),
  };
 }
}
