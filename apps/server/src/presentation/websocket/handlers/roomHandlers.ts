import { Server, Socket } from 'socket.io';
import { GAME_STATUS, RoomJoinSchema } from '@connect-x/shared';
import { roomService, gameService, userService, schedulerService } from '../../../registry';
import { gameEvents, GameEvent } from '../../../domain/events/GameEventEmitter';
import { calculateGameContext } from '../../../application/utils/context';

/** C1: Grace period (ms) before a disconnected player is forfeited */
const DISCONNECT_GRACE_MS = 30_000;

export function setupRoomHandlers(io: Server, socket: Socket) {
 // C4: Track whether this socket has already joined a room to prevent duplicate emits
 let hasJoined = false;

 socket.on('room:join', async (data) => {
  // C4: Skip duplicate join attempts for the same socket
  if (hasJoined) return;
  try {
   const { roomId, username } = RoomJoinSchema.parse(data);
   await userService.register(username);
   const result = await roomService.joinRoom(roomId, username, socket.id);

   if (result.error) {
    socket.emit('error', { code: 'JOIN_ERROR', message: result.error });
    return;
   }

   hasJoined = true;

   // C1: Cancel any pending disconnect forfeit for this player
   schedulerService.cancelLastScheduled(`disconnect:${roomId}:${username}`);

   await gameService.updatePlayerVisibility(roomId, username, true);

   socket.join(roomId);
   socket.data.roomId = roomId;
   socket.data.username = result.username;
   socket.data.isSpectator = false;

   // Send initial state — includes turnStartedAt so client can sync timer on reconnect (C3)
   socket.emit('room:updated', {
    playerId: result.username,
    room: {
     ...result.room,
     players: Array.from(result.room.players.values()),
     turnStartedAt: result.room.turnStartedAt?.toISOString() ?? null,
    },
    turnStartedAt: result.room.turnStartedAt?.toISOString() ?? null,
    context: calculateGameContext(result.room, result.username)
   });

  } catch (error: any) {
   socket.emit('error', { code: 'INVALID_DATA', message: error.message });
  }
 });

 socket.on('room:spectate', async (data) => {
  try {
   const { roomId, username } = RoomJoinSchema.parse(data);
   await userService.register(username);
   const result = await roomService.joinAsSpectator(roomId, username, socket.id);

   if (result.error) {
    socket.emit('error', { code: 'SPECTATE_ERROR', message: result.error });
    return;
   }

   socket.join(roomId);
   socket.data.roomId = roomId;
   socket.data.username = result.username;
   socket.data.isSpectator = true;

   // Send initial state to the spectator
   socket.emit('room:updated', {
    playerId: result.username,
    room: {
     ...result.room,
     players: Array.from(result.room.players.values()),
     spectators: Array.from(result.room.spectators)
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
  const { roomId, username, isSpectator } = socket.data;
  if (roomId && username) {
   if (isSpectator) {
    await roomService.leaveAsSpectator(socket.id, username);
   } else {
    // Intentional leave during a game = mark as invisible, game turn timer handles forfeit
    await gameService.updatePlayerVisibility(roomId, username, false);
   }
   socket.leave(roomId);
   hasJoined = false;
  }
 });

 socket.on('spectator:leave', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   await roomService.leaveAsSpectator(socket.id, username);
   socket.leave(roomId);
  }
 });

 socket.on('room:forfeit', async () => {
  const { roomId, username } = socket.data;
  if (roomId && username) {
   const { room } = await roomService.leaveRoom(socket.id, username);
   if (room?.gameState.status === GAME_STATUS.IN_PROGRESS) {
    await gameService.handleForfeit(roomId, username, 'OPPONENT_LEFT');
   }
   socket.leave(roomId);
   hasJoined = false;
  }
 });

 socket.on('disconnect', async () => {
  const { roomId, username, isSpectator } = socket.data;
  if (roomId && username) {
   if (isSpectator) {
    await roomService.leaveAsSpectator(socket.id, username);
   } else {
    // Mark as disconnected / not visible immediately
    await gameService.updatePlayerVisibility(roomId, username, false);

    // C1: Schedule a grace-period forfeit — player can reconnect within 30s to cancel it
    schedulerService.schedule(
     `disconnect:${roomId}:${username}`,
     DISCONNECT_GRACE_MS,
     async () => {
      const room = await roomService.getRoom(roomId);
      if (room && room.gameState.status === GAME_STATUS.IN_PROGRESS) {
       // Only forfeit if the player is still gone (no reconnect)
       const player = room.players.get(username);
       if (!player?.isVisible) {
        await gameService.handleForfeit(roomId, username, 'DISCONNECT');
       }
      }
     }
    );
   }
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
       players: Array.from(room.players.values()),
       spectators: Array.from(room.spectators)
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

 gameEvents.onEvent(GameEvent.SPECTATOR_JOINED, ({ roomId, username }) => {
  io.to(roomId).emit('spectator:joined', { username });
 });

 gameEvents.onEvent(GameEvent.SPECTATOR_LEFT, ({ roomId, username }) => {
  io.to(roomId).emit('spectator:left', { username });
 });
}
