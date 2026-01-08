import { Router } from 'express';
import { roomController } from '../RoomController';

const router = Router();

/**
 * @typedef {object} BoardConfig
 * @property {number} rows - Min 4, Max 10
 * @property {number} columns - Min 4, Max 10
 * @property {number} connectCount - Min 3, Max 6
 */

/**
 * @typedef {object} RoomCreateRequest
 * @property {string} username.required - Player nickname (2-20 chars)
 * @property {BoardConfig} config - Custom board configuration
 * @property {string} difficulty - EASY, MEDIUM, HARD
 * @property {boolean} isPublic - Visibility in room list
 */

/**
 * @typedef {object} RoomJoinRequest
 * @property {string} username.required - Player nickname
 */

/**
 * @typedef {object} ErrorResponse
 * @property {string} code - Machine readable error code
 * @property {string} message - Human readable error message
 */

/**
 * POST /api/rooms
 * @summary Create a new game room
 * @tags Room
 * @param {RoomCreateRequest} request.body.required - Room creation config
 * @return {object} 201 - Room created successfully
 * @return {ErrorResponse} 400 - Invalid input data
 */
router.post('/', (req, res) => roomController.create(req, res));

/**
 * POST /api/rooms/{roomId}/join
 * @summary Join an existing game room as a player
 * @tags Room
 * @param {string} roomId.path.required - Room ID (UUID)
 * @param {RoomJoinRequest} request.body.required - Player details
 * @return {object} 200 - Joined successfully
 * @return {ErrorResponse} 404 - Room not found
 * @return {ErrorResponse} 400 - Room full or game already started
 */
router.post('/:roomId/join', (req, res) => roomController.join(req, res));

/**
 * GET /api/rooms
 * @summary List all active public rooms
 * @tags Room
 * @return {array<object>} 200 - List of public rooms
 */
router.get('/', (req, res) => roomController.list(req, res));

/**
 * GET /api/rooms/{roomId}
 * @summary Get details of a specific room
 * @tags Room
 * @param {string} roomId.path.required - Room ID (UUID)
 * @return {object} 200 - Full room state
 * @return {ErrorResponse} 404 - Room not found
 */
router.get('/:roomId', (req, res) => roomController.get(req, res));

export default router;
