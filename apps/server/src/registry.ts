import { InMemoryRoomRepository } from './infrastructure/persistence/InMemoryRoomRepository';
import { RoomService } from './application/services/RoomService';
import { GameService } from './application/services/GameService';
import { UserService } from './application/services/UserService';
import { InMemoryUserRepository } from './infrastructure/persistence/InMemoryUserRepository';

// temporary in memory repository, will be replaced with sqlite or redis later
const roomRepository = new InMemoryRoomRepository();
const userRepository = new InMemoryUserRepository();

const userService = new UserService(userRepository);
const roomService = new RoomService(roomRepository, userService);
const gameService = new GameService(roomRepository);

export {
 roomRepository,
 roomService,
 gameService,
 userService
};
