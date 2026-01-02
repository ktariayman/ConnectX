import { IRoomRepository } from '../../domain/ports/IRoomRepository';
import { IGameService } from '../../domain/ports/IServices';

export class GameService implements IGameService {
 constructor(private roomRepository: IRoomRepository) { }

 async setPlayerReady(roomId: string, playerId: string): Promise<void> {
 }

 async makeMove(roomId: string, playerId: string, column: number): Promise<void> {
 }

 async handleForfeit(roomId: string, playerId: string, reason: string): Promise<void> {
 }

 async checkTimeouts(): Promise<void> {
 }

 async requestRematch(roomId: string, playerId: string): Promise<void> {
 }
}
