import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { IRoomRepository } from './domain/ports/IRoomRepository';
import { IGameHistoryRepository } from './domain/ports/IGameHistoryRepository';
import { IUserRepository } from './domain/ports/IUserRepository';

import { RedisRoomRepository } from './infrastructure/persistence/RedisRoomRepository';
import { RedisUserRepository } from './infrastructure/persistence/RedisUserRepository';
import { RedisGameHistoryRepository } from './infrastructure/persistence/RedisGameHistoryRepository';

import { RedisConnection } from './infrastructure/database/RedisConnection';
import { RoomService } from './application/services/RoomService';
import { GameService } from './application/services/GameService';
import { UserService } from './application/services/UserService';
import { SchedulerService } from './application/services/SchedulerService';

const container = new Container();

container.bind<RedisConnection>(TYPES.RedisConnection).to(RedisConnection).inSingletonScope();
container.bind<IRoomRepository>(TYPES.RoomRepository).to(RedisRoomRepository).inSingletonScope();
container.bind<IGameHistoryRepository>(TYPES.GameHistoryRepository).to(RedisGameHistoryRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.UserRepository).to(RedisUserRepository).inSingletonScope();

// Bind Services (Singletons)
container.bind<SchedulerService>(TYPES.SchedulerService).to(SchedulerService).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<RoomService>(TYPES.RoomService).to(RoomService).inSingletonScope();
container.bind<GameService>(TYPES.GameService).to(GameService).inSingletonScope();

async function initializeConnections(): Promise<void> {
  const redisConnection = container.get<RedisConnection>(TYPES.RedisConnection);
  await redisConnection.connect();
}

async function cleanup(): Promise<void> {
  console.log(' Shutting down gracefully...');

  const redisConnection = container.get<RedisConnection>(TYPES.RedisConnection);
  await redisConnection.disconnect();

  console.log(' Cleanup complete');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Export Resolved Instances (for use in non-DI parts like controllers)
const roomRepository = container.get<IRoomRepository>(TYPES.RoomRepository);
const gameHistoryRepository = container.get<IGameHistoryRepository>(TYPES.GameHistoryRepository);
const userService = container.get<UserService>(TYPES.UserService);
const roomService = container.get<RoomService>(TYPES.RoomService);
const gameService = container.get<GameService>(TYPES.GameService);

export {
  container,
  roomRepository,
  gameHistoryRepository,
  userService,
  roomService,
  gameService,
  initializeConnections,
  cleanup,
};
