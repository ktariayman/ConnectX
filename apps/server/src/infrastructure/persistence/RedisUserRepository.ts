import { User } from '@connect-x/shared';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { injectable, inject } from 'inversify';
import { RedisConnection } from '../database/RedisConnection';
import { TYPES } from '../../types';

@injectable()
export class RedisUserRepository implements IUserRepository {
 constructor(
  @inject(TYPES.RedisConnection) private redisConnection: RedisConnection
 ) { }

 async save(user: User): Promise<void> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`user:${user.username}`);

  const serializedUser = {
   username: user.username,
   createdAt: user.createdAt.toISOString(),
  };

  await client.set(key, JSON.stringify(serializedUser));

  // Add to users index
  await client.sAdd(this.redisConnection.getKey('users:all'), user.username);
 }

 async findByUsername(username: string): Promise<User | undefined> {
  const client = this.redisConnection.getClient();
  const key = this.redisConnection.getKey(`user:${username}`);

  const data = await client.get(key);
  if (!data) {
   return undefined;
  }

  const parsed = JSON.parse(data);
  return {
   username: parsed.username,
   createdAt: new Date(parsed.createdAt),
  };
 }
}
