import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { setupRoomHandlers, setupRoomDomainListeners } from './handlers/roomHandlers';
import { setupGameHandlers, setupGameDomainListeners } from './handlers/gameHandlers';
import { gameService } from '../../registry';

export class WebSocketServer {
 private static instance: WebSocketServer;
 private io: Server;
 private heartbeatInterval: NodeJS.Timeout | null = null;

 private constructor(httpServer: HttpServer) {
  this.io = new Server(httpServer, {
   cors: {
    origin: '*',
    methods: ['GET', 'POST'],
   },
  });

  // Initialize Domain Listeners (Outgoing)
  setupRoomDomainListeners(this.io);
  setupGameDomainListeners(this.io);

  // Initialize Connection Handlers (Incoming)
  this.setupConnectionHandlers();
  this.startHeartbeat();
 }

 public static init(httpServer: HttpServer): WebSocketServer {
  if (!WebSocketServer.instance) {
   WebSocketServer.instance = new WebSocketServer(httpServer);
  }
  return WebSocketServer.instance;
 }

 public static getInstance(): WebSocketServer {
  if (!WebSocketServer.instance) {
   throw new Error('WebSocketServer not initialized');
  }
  return WebSocketServer.instance;
 }

 public getIO(): Server {
  return this.io;
 }

 private setupConnectionHandlers() {
  this.io.on('connection', (socket: Socket) => {
   console.log(' New client connected:', socket.id);

   setupRoomHandlers(this.io, socket);
   setupGameHandlers(this.io, socket);

   socket.on('disconnect', () => {
    console.log(' Client disconnected:', socket.id);
   });
  });
 }

 public stop(): void {
  if (this.heartbeatInterval) {
   clearInterval(this.heartbeatInterval);
  }
  this.io.close();
 }

 private startHeartbeat() {
  this.heartbeatInterval = setInterval(async () => {
   try {
    await gameService.checkTimeouts();
   } catch (error) {
    console.error(' [Heartbeat] Error during timeout check:', error);
   }
  }, 1000);
 }
}
