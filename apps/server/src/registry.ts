import { InMemoryRoomRepository } from './infrastructure/persistence/InMemoryRoomRepository';
import { InMemoryGameHistoryRepository } from './infrastructure/persistence/InMemoryGameHistoryRepository';
import { RoomService } from './application/services/RoomService';
import { GameService } from './application/services/GameService';
import { UserService } from './application/services/UserService';
import { SchedulerService } from './application/services/SchedulerService';
import { InMemoryUserRepository } from './infrastructure/persistence/InMemoryUserRepository';

// temporary in memory repository, will be replaced with sqlite or redis later
const roomRepository = new InMemoryRoomRepository();
const gameHistoryRepository = new InMemoryGameHistoryRepository();
const userRepository = new InMemoryUserRepository();

const userService = new UserService(userRepository);
const schedulerService = new SchedulerService();
const roomService = new RoomService(roomRepository, userService);
const gameService = new GameService(roomRepository, gameHistoryRepository, schedulerService);

export {
 roomRepository,
 gameHistoryRepository,
 roomService,
 gameService,
 userService
};
