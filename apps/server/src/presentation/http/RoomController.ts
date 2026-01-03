import { Request, Response } from 'express';
import { roomService } from '../../registry';
import { RoomCreateSchema, DEFAULT_BOARD_CONFIG } from '@connect-x/shared';
import { z } from 'zod';

export class RoomController {
 /**
  * CREATE /api/rooms
  */
 async create(req: Request, res: Response) {
  try {
   const input = RoomCreateSchema.parse(req.body);
   const config = input.config || DEFAULT_BOARD_CONFIG;

   const result = await roomService.createRoom(
    input.displayName,
    config,
    input.difficulty,
    input.isPublic
   );

   return res.status(201).json({
    roomId: result.room.id,
    playerId: result.playerId
   });
  } catch (error: any) {
   return res.status(400).json({ error: error.message || 'Invalid data' });
  }
 }

 /**
  * GET /api/rooms
  */
 async list(req: Request, res: Response) {
  try {
   const rooms = await roomService.getPublicRooms();
   const formatted = rooms.map(room => ({
    id: room.id,
    playerCount: room.players.size,
    difficulty: room.difficulty,
    config: room.config,
   }));

   return res.json(formatted);
  } catch (error: any) {
   return res.status(500).json({ error: 'Internal server error' });
  }
 }

 /**
  * GET /api/rooms/:roomId
  */
 async get(req: Request, res: Response) {
  try {
   const { roomId } = z.object({ roomId: z.string().uuid() }).parse(req.params);
   const room = await roomService.getRoom(roomId);

   if (!room) {
    return res.status(404).json({ error: 'Room not found' });
   }

   return res.json({
    ...room,
    players: Array.from(room.players.values()),
   });
  } catch (error: any) {
   return res.status(400).json({ error: 'Invalid room ID' });
  }
 }
}

export const roomController = new RoomController();
