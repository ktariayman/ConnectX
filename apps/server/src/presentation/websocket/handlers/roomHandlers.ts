import { Server, Socket } from 'socket.io';
import { RoomJoinSchema } from '@connect-x/shared';
import { roomService, gameService } from '../../../registry';
import { gameEvents, GameEvent } from '../../../domain/events/GameEventEmitter';

export function setupRoomHandlers(io: Server, socket: Socket) {
 socket.on('room:join', async (data) => {
  try {
   const { roomId, displayName, playerId } = RoomJoinSchema.parse(data);
   const result = await roomService.joinRoom(roomId, displayName, socket.id, playerId);

   if (result.error) {
    socket.emit('error', { code: 'JOIN_ERROR', message: result.error });
    return;
   }

   socket.join(roomId);
   socket.data.roomId = roomId;
   socket.data.playerId = result.playerId;

   // Send initial state to the joined player
   socket.emit('room:updated', {
    room: {
     ...result.room,
     players: Array.from(result.room.players.values())
    }
   });

  } catch (error: any) {
   socket.emit('error', { code: 'INVALID_DATA', message: error.message });
  }
 });

 socket.on('player:ready', async () => {
  const { roomId, playerId } = socket.data;
  if (roomId && playerId) {
   await gameService.setPlayerReady(roomId, playerId);
  }
 });

 socket.on('room:leave', async () => {
  const { roomId, playerId } = socket.data;
  if (roomId && playerId) {
   const { room } = await roomService.leaveRoom(socket.id, playerId);
   if (room?.gameState.status === 'IN_PROGRESS') {
    await gameService.handleForfeit(roomId, playerId, 'OPPONENT_LEFT');
   }
   socket.leave(roomId);
  }
 });

 socket.on('disconnect', async () => {
  const { roomId, playerId } = socket.data;
  if (roomId && playerId) {
   await gameService.handleForfeit(roomId, playerId, 'OPPONENT_DISCONNECTED');
  }
 });
}

export function setupRoomDomainListeners(io: Server) {
 gameEvents.onEvent(GameEvent.ROOM_UPDATED, ({ roomId, room }) => {
  io.to(roomId).emit('room:updated', {
   room: {
    ...room,
    players: Array.from(room.players.values())
   }
  });
 });

 gameEvents.onEvent(GameEvent.PLAYER_JOINED, ({ roomId, displayName }) => {
  io.to(roomId).emit('player:joined', { displayName });
 });

 gameEvents.onEvent(GameEvent.PLAYER_LEFT, ({ roomId, playerId }) => {
  io.to(roomId).emit('player:left', { playerId });
 });
}
