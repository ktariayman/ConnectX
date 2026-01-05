import { Server, Socket } from 'socket.io';
import { RoomJoinSchema } from '@connect-x/shared';
import { roomService, gameService, userService } from '../../../registry';
import { gameEvents, GameEvent } from '../../../domain/events/GameEventEmitter';
import { calculateGameContext } from '../../../application/utils/context';

export function setupRoomHandlers(io: Server, socket: Socket) {
 socket.on('room:join', async (data) => {
  try {
   const { roomId, username } = RoomJoinSchema.parse(data);
   await userService.register(username);
   const result = await roomService.joinRoom(roomId, username, socket.id);

   if (result.error) {
    socket.emit('error', { code: 'JOIN_ERROR', message: result.error });
    return;
   }

   socket.join(roomId);
   socket.data.roomId = roomId;
   socket.data.username = result.username;

   // Send initial state to the joined player
   socket.emit('room:updated', {
    playerId: result.username, // Kept for frontend compatibility
    room: {
     ...result.room,
     players: Array.from(result.room.players.values())
    },
    context: calculateGameContext(result.room, result.username)
   });

  } catch (error: any) {
   socket.emit('error', { code: 'INVALID_DATA', message: error.message });
  }
 });

 socket.on('player:ready', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   await gameService.setPlayerReady(roomId, username);
  }
 });

 socket.on('room:leave', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   const { room } = await roomService.leaveRoom(socket.id, username);
   if (room?.gameState.status === 'IN_PROGRESS') {
    await gameService.handleForfeit(roomId, username, 'OPPONENT_LEFT');
   }
   socket.leave(roomId);
  }
 });

 socket.on('disconnect', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   await gameService.handleForfeit(roomId, username, 'OPPONENT_DISCONNECTED');
  }
 });
}

export function setupRoomDomainListeners(io: Server) {

 gameEvents.onEvent(GameEvent.ROOM_UPDATED, ({ roomId, room }) => {
  const sockets = io.sockets.adapter.rooms.get(roomId);
  if (sockets) {
   for (const socketId of sockets) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket && socket.data.username) {
     socket.emit('room:updated', {
      room: {
       ...room,
       players: Array.from(room.players.values())
      },
      context: calculateGameContext(room, socket.data.username)
     });
    }
   }
  }
 });

 gameEvents.onEvent(GameEvent.PLAYER_JOINED, ({ roomId, displayName }) => {
  io.to(roomId).emit('player:joined', { displayName });
 });

 gameEvents.onEvent(GameEvent.PLAYER_LEFT, ({ roomId, playerId }) => {
  io.to(roomId).emit('player:left', { playerId });
 });
}
