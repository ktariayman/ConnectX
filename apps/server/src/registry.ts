import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

import { IRoomRepository } from './domain/ports/IRoomRepository';
import { IGameHistoryRepository } from './domain/ports/IGameHistoryRepository';
import { IUserRepository } from './domain/ports/IUserRepository';

import { InMemoryRoomRepository } from './infrastructure/persistence/InMemoryRoomRepository';
import { InMemoryGameHistoryRepository } from './infrastructure/persistence/InMemoryGameHistoryRepository';
import { InMemoryUserRepository } from './infrastructure/persistence/InMemoryUserRepository';

import { RoomService } from './application/services/RoomService';
import { GameService } from './application/services/GameService';
import { UserService } from './application/services/UserService';
import { SchedulerService } from './application/services/SchedulerService';

// Create the DI Container
const container = new Container();

// Bind Repositories (Singletons)
container.bind<IRoomRepository>(TYPES.RoomRepository).to(InMemoryRoomRepository).inSingletonScope();
container.bind<IGameHistoryRepository>(TYPES.GameHistoryRepository).to(InMemoryGameHistoryRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.UserRepository).to(InMemoryUserRepository).inSingletonScope();

// Bind Services (Singletons)
container.bind<SchedulerService>(TYPES.SchedulerService).to(SchedulerService).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<RoomService>(TYPES.RoomService).to(RoomService).inSingletonScope();
container.bind<GameService>(TYPES.GameService).to(GameService).inSingletonScope();

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
 gameService
};
