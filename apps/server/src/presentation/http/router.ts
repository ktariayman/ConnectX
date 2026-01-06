import { Router } from 'express';
import { roomController } from './RoomController';
import { gameHistoryController } from './GameHistoryController';
import { debugController } from './DebugController';

const router = Router();

router.post('/rooms', (req, res) => roomController.create(req, res));
router.post('/rooms/:roomId/join', (req, res) => roomController.join(req, res));
router.get('/rooms', (req, res) => roomController.list(req, res));
router.get('/rooms/:roomId', (req, res) => roomController.get(req, res));

router.get('/history', (req, res) => gameHistoryController.getAll(req, res));
router.get('/history/room/:roomId', (req, res) => gameHistoryController.getByRoomId(req, res));
router.get('/history/player/:username', (req, res) => gameHistoryController.getByPlayer(req, res));

router.get('/debug/status', (req, res) => debugController.status(req, res));

export default router;
