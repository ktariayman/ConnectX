import { EventEmitter } from 'events';
import { Room, GameState, Move } from '@connect-x/shared';

export enum GameEvent {
 ROOM_UPDATED = 'room:updated',
 GAME_STARTED = 'game:started',
 GAME_MOVE = 'game:move',
 GAME_OVER = 'game:over',
 PLAYER_JOINED = 'player:joined',
 PLAYER_LEFT = 'player:left'
}

export type GameEventPayloads = {
 [GameEvent.ROOM_UPDATED]: { roomId: string; room: Room };
 [GameEvent.GAME_STARTED]: { roomId: string; gameState: GameState };
 [GameEvent.GAME_MOVE]: { roomId: string; move: Move; gameState: GameState; turnStartedAt: Date | null };
 [GameEvent.GAME_OVER]: { roomId: string; gameState: GameState; reason: string };
 [GameEvent.PLAYER_JOINED]: { roomId: string; playerId: string; displayName: string };
 [GameEvent.PLAYER_LEFT]: { roomId: string; playerId: string };
};

export class GameEventEmitter extends EventEmitter {
 emitEvent<T extends GameEvent>(event: T, payload: GameEventPayloads[T]): boolean {
  return this.emit(event, payload);
 }
}

export const gameEvents = new GameEventEmitter();
