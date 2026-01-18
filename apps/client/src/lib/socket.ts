import { io, Socket } from 'socket.io-client';
import {
 RoomUpdateCallback,
 ErrorCallback,
 GameMoveCallback,
 GameOverCallback,
 VisibilityChangeCallback,
} from '../types/socket.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const socket: Socket = io(SOCKET_URL, {
 autoConnect: false,
});

export const socketEmit = {
 joinRoom: (roomId: string, username: string) => {
  socket.emit('room:join', { roomId, username });
 },
 spectateRoom: (roomId: string, username: string) => {
  socket.emit('room:spectate', { roomId, username });
 },
 playerReady: () => {
  socket.emit('player:ready');
 },
 makeMove: (roomId: string, column: number) => {
  socket.emit('game:move', { roomId, column });
 },
 leaveRoom: () => {
  socket.emit('room:leave');
 },
 leaveSpectate: () => {
  socket.emit('spectator:leave');
 },
 emitVisibilityChange: (isVisible: boolean) => {
  socket.emit('game:visibility-change', { isVisible });
 },
};

export const socketOn = {
 roomUpdated: (callback: RoomUpdateCallback) => {
  socket.on('room:updated', callback);
 },
 playerJoined: (callback: RoomUpdateCallback) => {
  socket.on('player:joined', callback);
 },
 playerReady: (callback: RoomUpdateCallback) => {
  socket.on('player:ready', callback);
 },
 gameStarted: (callback: RoomUpdateCallback) => {
  socket.on('game:started', callback);
 },
 gameMove: (callback: GameMoveCallback) => {
  socket.on('game:move', callback);
 },
 gameOver: (callback: GameOverCallback) => {
  socket.on('game:over', callback);
 },
 spectatorJoined: (callback: RoomUpdateCallback) => {
  socket.on('spectator:joined', callback);
 },
 spectatorLeft: (callback: RoomUpdateCallback) => {
  socket.on('spectator:left', callback);
 },
 error: (callback: ErrorCallback) => {
  socket.on('error', callback);
 },
 playerVisibilityChange: (callback: VisibilityChangeCallback) => {
  socket.on('game:player-visibility-change', callback);
 },
};

export const socketOff = {
 all: () => {
  socket.off('room:updated');
  socket.off('player:joined');
  socket.off('player:ready');
  socket.off('game:started');
  socket.off('game:move');
  socket.off('game:over');
  socket.off('spectator:joined');
  socket.off('spectator:left');
  socket.off('error');
  socket.off('game:player-visibility-change');
 },
};
