import { Server, Socket } from 'socket.io';
import { RoomJoinSchema } from '@connect-x/shared';
import { roomService, gameService } from '../../../registry';

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
