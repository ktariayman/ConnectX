import { Request, Response } from 'express';
import { gameHistoryRepository } from '../../registry';

export class GameHistoryController {
 /**
  * GET /api/history/:roomId
  * Get game history by room ID
  */
 async getByRoomId(req: Request, res: Response) {
  try {
   const { roomId } = req.params;
   const game = await gameHistoryRepository.findByRoomId(roomId);

   if (!game) {
    return res.status(404).json({ error: 'Game history not found' });
   }

   return res.json(game);
  } catch (error: any) {
   return res.status(500).json({ error: 'Internal server error' });
  }
 }

 /**
  * GET /api/history/player/:username
  * Get all games for a player
  */
 async getByPlayer(req: Request, res: Response) {
  try {
   const { username } = req.params;
   const games = await gameHistoryRepository.findByPlayer(username);

   return res.json(games);
  } catch (error: any) {
   return res.status(500).json({ error: 'Internal server error' });
  }
 }

 /**
  * GET /api/history
  * Get all game history
  */
 async getAll(req: Request, res: Response) {
  try {
   const games = await gameHistoryRepository.findAll();
   return res.json(games);
  } catch (error: any) {
   return res.status(500).json({ error: 'Internal server error' });
  }
 }
}

export const gameHistoryController = new GameHistoryController();
