import { Server, Socket } from 'socket.io';
import { setupRoomHandlers } from './handlers/roomHandlers';
import { setupGameHandlers } from './handlers/gameHandlers';
import { gameEvents, GameEvent } from '../../domain/events/GameEventEmitter';

export function setupSocketHandlers(io: Server) {
 gameEvents.on(GameEvent.ROOM_UPDATED, ({ roomId, room }) => {
  io.to(roomId).emit('room:joined', {
   room: {
    ...room,
    players: Array.from(room.players.values())
   }
  });
 });

 gameEvents.on(GameEvent.GAME_STARTED, ({ roomId, gameState }) => {
  io.to(roomId).emit('game:started', { gameState });
 });

 gameEvents.on(GameEvent.GAME_MOVE, ({ roomId, move, gameState, turnStartedAt }) => {
  io.to(roomId).emit('game:move', { move, gameState, turnStartedAt });
 });

 gameEvents.on(GameEvent.GAME_OVER, ({ roomId, gameState, reason }) => {
  io.to(roomId).emit('game:over', { gameState, reason });
 });

 io.on('connection', (socket: Socket) => {
  console.log('New client connected:', socket.id);


  setupRoomHandlers(io, socket);
  setupGameHandlers(io, socket);

  socket.on('disconnect', () => {
   console.log('Client disconnected:', socket.id);
  });
 });
}
