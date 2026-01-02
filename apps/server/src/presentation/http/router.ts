import { Router } from 'express';
import { roomController } from './RoomController';
import { debugController } from './DebugController';

const router = Router();

router.post('/rooms', (req, res) => roomController.create(req, res));
router.get('/rooms', (req, res) => roomController.list(req, res));
router.get('/rooms/:roomId', (req, res) => roomController.get(req, res));

router.get('/debug/status', (req, res) => debugController.status(req, res));

export default router;
