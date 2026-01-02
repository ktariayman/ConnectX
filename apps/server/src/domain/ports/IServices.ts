import { Room, BoardConfig, DifficultyLevel } from '@connect-x/shared';

export interface IRoomService {
 createRoom(
  creatorName: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; playerId: string }>;

 joinRoom(
  roomId: string,
  displayName: string,
  socketId: string,
  playerId?: string
 ): Promise<{ room: Room; playerId: string; error?: string }>;

 leaveRoom(socketId: string, playerId: string): Promise<{ roomId: string; room?: Room }>;

 getPublicRooms(): Promise<Room[]>;
 getRoom(roomId: string): Promise<Room | undefined>;
}

export interface IGameService {
 setPlayerReady(roomId: string, playerId: string): Promise<void>;
 makeMove(roomId: string, playerId: string, column: number): Promise<void>;
 requestRematch(roomId: string, playerId: string): Promise<void>;
 handleForfeit(roomId: string, playerId: string, reason: string): Promise<void>;
 checkTimeouts(): Promise<void>;
}
