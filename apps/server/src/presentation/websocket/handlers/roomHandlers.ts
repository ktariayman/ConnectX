import { Server, Socket } from 'socket.io';

export function setupRoomHandlers(io: Server, socket: Socket) {
 socket.on('room:join', async (data) => { });

 socket.on('player:ready', async () => { });

 socket.on('room:leave', async () => { });
}
