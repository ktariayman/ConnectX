import { Router } from 'express';
import roomRoutes from './routes/RoomRoutes';
import historyRoutes from './routes/HistoryRoutes';
import debugRoutes from './routes/DebugRoutes';

const router = Router();

router.use('/rooms', roomRoutes);
router.use('/history', historyRoutes);
router.use('/debug', debugRoutes);

export default router;
