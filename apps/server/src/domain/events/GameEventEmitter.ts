import { EventEmitter } from 'events';
import { Room, GameState, Move } from '@connect-x/shared';

export enum GameEvent {
 ROOM_UPDATED = 'room:updated',
 GAME_STARTED = 'game:started',
 GAME_MOVE = 'game:move',
 GAME_OVER = 'game:over',
 PLAYER_JOINED = 'player:joined',
 PLAYER_LEFT = 'player:left',
 SPECTATOR_JOINED = 'spectator:joined',
 SPECTATOR_LEFT = 'spectator:left',
 PLAYER_VISIBILITY_CHANGE = 'player:visibility-change'
}

export type GameEventPayloads = {
 [GameEvent.ROOM_UPDATED]: { roomId: string; room: Room };
 [GameEvent.GAME_STARTED]: { roomId: string; gameState: GameState };
 [GameEvent.GAME_MOVE]: { roomId: string; move: Move; gameState: GameState; turnStartedAt: Date | null };
 [GameEvent.GAME_OVER]: { roomId: string; gameState: GameState; reason: string };
 [GameEvent.PLAYER_JOINED]: { roomId: string; playerId: string; displayName: string };
 [GameEvent.PLAYER_LEFT]: { roomId: string; playerId: string };
 [GameEvent.SPECTATOR_JOINED]: { roomId: string; username: string };
 [GameEvent.SPECTATOR_LEFT]: { roomId: string; username: string };
 [GameEvent.PLAYER_VISIBILITY_CHANGE]: { roomId: string; username: string; isVisible: boolean };
};

export class GameEventEmitter extends EventEmitter {
 private static instance: GameEventEmitter;

 private constructor() {
  super();
 }

 public static getInstance(): GameEventEmitter {
  if (!GameEventEmitter.instance) {
   GameEventEmitter.instance = new GameEventEmitter();
  }
  return GameEventEmitter.instance;
 }

 emitEvent<T extends GameEvent>(event: T, payload: GameEventPayloads[T]): boolean {
  return this.emit(event, payload);
 }

 onEvent<T extends GameEvent>(event: T, listener: (payload: GameEventPayloads[T]) => void): this {
  return this.on(event, listener);
 }

 onceEvent<T extends GameEvent>(event: T, listener: (payload: GameEventPayloads[T]) => void): this {
  return this.once(event, listener);
 }

 offEvent<T extends GameEvent>(event: T, listener: (payload: GameEventPayloads[T]) => void): this {
  return this.off(event, listener);
 }
}

export const gameEvents = GameEventEmitter.getInstance();
