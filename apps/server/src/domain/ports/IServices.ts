import { Room, BoardConfig, DifficultyLevel } from '@connect-x/shared';

export interface IRoomService {
 createRoom(
  creatorName: string,
  config: BoardConfig,
  difficulty: DifficultyLevel,
  isPublic: boolean
 ): Promise<{ room: Room; username: string }>;

 joinRoom(
  roomId: string,
  username: string,
  socketId: string
 ): Promise<{ room: Room; username: string; error?: string }>;

 leaveRoom(socketId: string, username: string): Promise<{ roomId: string; room?: Room }>;

 joinAsSpectator(
  roomId: string,
  username: string,
  socketId: string
 ): Promise<{ room: Room; username: string; error?: string }>;

 leaveAsSpectator(socketId: string, username: string): Promise<{ roomId: string; room?: Room }>;

 getPublicRooms(): Promise<Room[]>;
 getRoom(roomId: string): Promise<Room | undefined>;
}

export interface IGameService {
 setPlayerReady(roomId: string, username: string): Promise<void>;
 makeMove(roomId: string, username: string, column: number): Promise<void>;
 requestRematch(roomId: string, username: string): Promise<void>;
 handleForfeit(roomId: string, username: string, reason: string): Promise<void>;
 checkTimeouts(): Promise<void>;
}
