import { Room } from '@connect-x/shared';

export interface IRoomRepository {
 save(room: Room): Promise<void>;
 findById(id: string): Promise<Room | undefined>;
 findAllPublic(): Promise<Room[]>;
 delete(id: string): Promise<boolean>;

 // Player tracking
 trackPlayer(socketId: string, roomId: string): Promise<void>;
 getPlayerRoomId(socketId: string): Promise<string | undefined>;
 untrackPlayer(socketId: string): Promise<void>;
 getAllActiveSessions(): Promise<Map<string, string>>;
}
