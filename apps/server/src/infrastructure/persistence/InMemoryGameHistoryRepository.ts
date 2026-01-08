import { GameHistory } from '@connect-x/shared';
import { IGameHistoryRepository } from '../../domain/ports/IGameHistoryRepository';
import { injectable } from 'inversify';

@injectable()
export class InMemoryGameHistoryRepository implements IGameHistoryRepository {
 private games: Map<string, GameHistory> = new Map();

 async save(game: GameHistory): Promise<void> {
  this.games.set(game.id, game);
 }

 async findById(id: string): Promise<GameHistory | undefined> {
  return this.games.get(id);
 }

 async findByRoomId(roomId: string): Promise<GameHistory | undefined> {
  return Array.from(this.games.values()).find(game => game.roomId === roomId);
 }

 async findByPlayer(username: string): Promise<GameHistory[]> {
  return Array.from(this.games.values()).filter(game =>
   game.players.includes(username)
  );
 }

 async findAll(): Promise<GameHistory[]> {
  return Array.from(this.games.values());
 }
}
