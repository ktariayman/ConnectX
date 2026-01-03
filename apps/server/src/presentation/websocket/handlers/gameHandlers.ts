import { Server, Socket } from 'socket.io';
import { MakeMoveSchema } from '@connect-x/shared';
import { gameService } from '../../../registry';
import { gameEvents, GameEvent } from '../../../domain/events/GameEventEmitter';

export function setupGameHandlers(io: Server, socket: Socket) {
 socket.on('game:move', async (data) => {
  try {
   const { roomId, column } = MakeMoveSchema.parse(data);
   const { playerId } = socket.data;

   if (!playerId) {
    socket.emit('error', { code: 'UNAUTHORIZED', message: 'Player ID not found' });
    return;
   }

   await gameService.makeMove(roomId, playerId, column);
  } catch (error: any) {
   socket.emit('error', { code: 'MOVE_ERROR', message: error.message });
  }
 });

 socket.on('game:rematch', async () => {
  const { roomId, playerId } = socket.data;
  if (roomId && playerId) {
   await gameService.requestRematch(roomId, playerId);
  }
 });
}

export function setupGameDomainListeners(io: Server) {
 gameEvents.onEvent(GameEvent.GAME_STARTED, ({ roomId, gameState }) => {
  io.to(roomId).emit('game:started', { gameState });
 });

 gameEvents.onEvent(GameEvent.GAME_MOVE, ({ roomId, move, gameState, turnStartedAt }) => {
  io.to(roomId).emit('game:move', { move, gameState, turnStartedAt });
 });

 gameEvents.onEvent(GameEvent.GAME_OVER, ({ roomId, gameState, reason }) => {
  io.to(roomId).emit('game:over', { gameState, reason });
 });
}
