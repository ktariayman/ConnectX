import { Router } from 'express';
import { debugController } from '../DebugController';

const router = Router();

/**
 * GET /api/debug/status
 * @summary Get server health, uptime, and performance metrics
 * @tags Debug
 * @return {object} 200 - Detailed server status
 */
router.get('/status', (req, res) => debugController.status(req, res));

export default router;
