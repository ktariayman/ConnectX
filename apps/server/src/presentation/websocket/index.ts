import { Server, Socket } from 'socket.io';
import { setupRoomHandlers } from './handlers/roomHandlers';
import { setupGameHandlers } from './handlers/gameHandlers';

export function setupSocketHandlers(io: Server) {
 io.on('connection', (socket: Socket) => {
  setupRoomHandlers(io, socket);
  setupGameHandlers(io, socket);
 });
}
