import { Server, Socket } from 'socket.io';
import { MakeMoveSchema } from '@connect-x/shared';
import { gameService } from '../../../registry';
import { gameEvents, GameEvent } from '../../../domain/events/GameEventEmitter';

export function setupGameHandlers(io: Server, socket: Socket) {
 socket.on('game:move', async (data) => {
  try {
   const { roomId, column } = MakeMoveSchema.parse(data);
   const { username } = socket.data;

   if (!username) {
    socket.emit('error', { code: 'UNAUTHORIZED', message: 'Username not found' });
    return;
   }

   await gameService.makeMove(roomId, username, column);
  } catch (error: any) {
   socket.emit('error', { code: 'MOVE_ERROR', message: error.message });
  }
 });

 socket.on('game:rematch', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   await gameService.requestRematch(roomId, username);
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
