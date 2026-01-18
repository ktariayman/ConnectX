import { createClient, RedisClientType } from 'redis';
import { injectable } from 'inversify';
import config from '../../config';

@injectable()
export class RedisConnection {
 private client: RedisClientType | null = null;
 private isConnected = false;

 async connect(): Promise<void> {
  if (this.isConnected && this.client) {
   return;
  }

  try {
   this.client = createClient({
    socket: {
     host: config.redis.host,
     port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db,
   });

   this.client.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
   });

   this.client.on('connect', () => {
    console.log(' Redis connecting...');
   });

   this.client.on('ready', () => {
    console.log(' Redis ready');
   });

   this.client.on('reconnecting', () => {
    console.log(' Redis reconnecting...');
   });

   await this.client.connect();
   this.isConnected = true;
   console.log(` Redis connected: ${config.redis.host}:${config.redis.port}`);
  } catch (error) {
   console.error('Failed to connect to Redis:', error);
   throw error;
  }
 }

 async disconnect(): Promise<void> {
  if (this.client) {
   await this.client.quit();
   this.client = null;
   this.isConnected = false;
   console.log(' Redis disconnected');
  }
 }

 getClient(): RedisClientType {
  if (!this.client || !this.isConnected) {
   throw new Error('Redis not connected. Call connect() first.');
  }
  return this.client;
 }

 async healthCheck(): Promise<boolean> {
  try {
   if (!this.client) return false;
   const pong = await this.client.ping();
   return pong === 'PONG';
  } catch {
   return false;
  }
 }

 getKey(key: string): string {
  return `${config.redis.keyPrefix}${key}`;
 }
}
