import { GameHistory } from '@connect-x/shared';

export interface IGameHistoryRepository {
 save(game: GameHistory): Promise<void>;
 findById(id: string): Promise<GameHistory | undefined>;
 findByRoomId(roomId: string): Promise<GameHistory | undefined>;
 findByPlayer(username: string): Promise<GameHistory[]>;
 findAll(): Promise<GameHistory[]>;
}
