import { Request, Response } from 'express';
import { roomRepository } from '../../registry';

export class DebugController {
 async status(req: Request, res: Response) {
  try {
   const sessions = await roomRepository.getAllActiveSessions();
   const roomIds = new Set(sessions.values());
   const rooms = [];

   for (const id of roomIds) {
    const room = await roomRepository.findById(id);
    if (room) {
     rooms.push({
      ...room,
      players: Array.from(room.players.values())
     });
    }
   }

   return res.json({
    activeConnections: sessions.size,
    activeRooms: rooms.length,
    rooms
   });
  } catch (error: any) {
   return res.status(500).json({ error: 'Internal server error' });
  }
 }
}

export const debugController = new DebugController();
