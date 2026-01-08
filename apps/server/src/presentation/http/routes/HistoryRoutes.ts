import { Router } from 'express';
import { gameHistoryController } from '../GameHistoryController';

const router = Router();

/**
 * GET /api/history
 * @summary Get full game history across all rooms
 * @tags History
 * @return {array<object>} 200 - Detailed game history
 */
router.get('/', (req, res) => gameHistoryController.getAll(req, res));

/**
 * GET /api/history/room/{roomId}
 * @summary Get history for a specific room
 * @tags History
 * @param {string} roomId.path.required - Room ID (UUID)
 * @return {array<object>} 200 - List of historic games in this room
 */
router.get('/room/:roomId', (req, res) => gameHistoryController.getByRoomId(req, res));

/**
 * GET /api/history/player/{username}
 * @summary Get history for a specific player
 * @tags History
 * @param {string} username.path.required - Username
 * @return {array<object>} 200 - List of games played by this user
 */
router.get('/player/:username', (req, res) => gameHistoryController.getByPlayer(req, res));

export default router;
