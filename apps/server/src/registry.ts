import { InMemoryRoomRepository } from './infrastructure/persistence/InMemoryRoomRepository';
import { RoomService } from './application/services/RoomService';
import { GameService } from './application/services/GameService';

// temporary in memory repository, will be replaced with sqlite or redis later
const roomRepository = new InMemoryRoomRepository();

const roomService = new RoomService(roomRepository);
const gameService = new GameService(roomRepository);

export {
 roomRepository,
 roomService,
 gameService
};
