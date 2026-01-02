import { Server, Socket } from 'socket.io';

export function setupGameHandlers(io: Server, socket: Socket) {
 socket.on('game:move', async (data) => { });
 socket.on('game:rematch', async () => { });
}
