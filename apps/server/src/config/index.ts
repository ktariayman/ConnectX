import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
 port: number;
 nodeEnv: string;
 allowedOrigins: string[];
 defaultTurnTimeout: number;
 logLevel: string;

 redis: {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
 };

 session: {
  ttl: number;
  roomTTL: number;
  gameHistoryTTL: number;
 };
}

const config: AppConfig = {
 port: parseInt(process.env.PORT || '4000', 10),
 nodeEnv: process.env.NODE_ENV || 'development',
 allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
 defaultTurnTimeout: parseInt(process.env.DEFAULT_TURN_TIMEOUT || '30', 10),
 logLevel: process.env.LOG_LEVEL || 'info',

 redis: {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'connectx:',
 },

 session: {
  ttl: parseInt(process.env.SESSION_TTL || '86400', 10),
  roomTTL: parseInt(process.env.ROOM_TTL || '3600', 10),
  gameHistoryTTL: parseInt(process.env.GAME_HISTORY_TTL || '2592000', 10), // 30 days
 },
};

export default config;
