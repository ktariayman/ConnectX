import { describe, it, expect } from 'vitest';
import {
 createEmptyBoard,
 isValidMove,
 applyMove,
 getDropRow,
} from '../src/core/engine/board';
import { checkWin } from '../src/core/engine/win-detection';
import { CELL_STATE, GAME_RESULT, PLAYER_TYPE } from '../src/constants/status';
import { DEFAULT_BOARD_CONFIG } from '../src/constants/game';

const config = DEFAULT_BOARD_CONFIG; // 6 rows × 7 cols, connect 4

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fillColumn(board: ReturnType<typeof createEmptyBoard>, col: number, count: number, player: typeof PLAYER_TYPE.PLAYER_1 | typeof PLAYER_TYPE.PLAYER_2) {
 let b = board;
 for (let i = 0; i < count; i++) {
  b = applyMove(b, col, player);
 }
 return b;
}

// ─── createEmptyBoard ─────────────────────────────────────────────────────────

describe('createEmptyBoard', () => {
 it('creates a board with correct dimensions', () => {
  const board = createEmptyBoard(config);
  expect(board.length).toBe(config.rows);
  expect(board[0].length).toBe(config.columns);
 });

 it('all cells are EMPTY', () => {
  const board = createEmptyBoard(config);
  expect(board.flat().every(c => c === CELL_STATE.EMPTY)).toBe(true);
 });

 it('works for custom config', () => {
  const board = createEmptyBoard({ rows: 4, columns: 5, connectCount: 3 });
  expect(board.length).toBe(4);
  expect(board[0].length).toBe(5);
 });
});

// ─── isValidMove ──────────────────────────────────────────────────────────────

describe('isValidMove', () => {
 it('allows valid move in empty board', () => {
  const board = createEmptyBoard(config);
  expect(isValidMove(board, 0, config)).toBe(true);
  expect(isValidMove(board, config.columns - 1, config)).toBe(true);
 });

 it('rejects negative column', () => {
  expect(isValidMove(createEmptyBoard(config), -1, config)).toBe(false);
 });

 it('rejects out-of-bounds column', () => {
  expect(isValidMove(createEmptyBoard(config), config.columns, config)).toBe(false);
 });

 it('rejects a full column', () => {
  let board = createEmptyBoard(config);
  board = fillColumn(board, 3, config.rows, PLAYER_TYPE.PLAYER_1);
  expect(isValidMove(board, 3, config)).toBe(false);
 });
});

// ─── applyMove ────────────────────────────────────────────────────────────────

describe('applyMove', () => {
 it('places piece at the bottom of an empty column', () => {
  const board = createEmptyBoard(config);
  const next = applyMove(board, 0, PLAYER_TYPE.PLAYER_1);
  expect(next[config.rows - 1][0]).toBe(CELL_STATE.PLAYER_1);
 });

 it('stacks pieces correctly', () => {
  let board = createEmptyBoard(config);
  board = applyMove(board, 0, PLAYER_TYPE.PLAYER_1);
  board = applyMove(board, 0, PLAYER_TYPE.PLAYER_2);
  expect(board[config.rows - 1][0]).toBe(CELL_STATE.PLAYER_1);
  expect(board[config.rows - 2][0]).toBe(CELL_STATE.PLAYER_2);
 });

 it('does not mutate the original board', () => {
  const board = createEmptyBoard(config);
  const next = applyMove(board, 0, PLAYER_TYPE.PLAYER_1);
  expect(board[config.rows - 1][0]).toBe(CELL_STATE.EMPTY);
  expect(next[config.rows - 1][0]).toBe(CELL_STATE.PLAYER_1);
 });
});

// ─── getDropRow ───────────────────────────────────────────────────────────────

describe('getDropRow', () => {
 it('returns the bottom row for an empty column', () => {
  const board = createEmptyBoard(config);
  expect(getDropRow(board, 0)).toBe(config.rows - 1);
 });

 it('returns the correct row when column is partially filled', () => {
  let board = createEmptyBoard(config);
  board = fillColumn(board, 0, 2, PLAYER_TYPE.PLAYER_1);
  expect(getDropRow(board, 0)).toBe(config.rows - 3);
 });

 it('returns -1 for a full column', () => {
  let board = createEmptyBoard(config);
  board = fillColumn(board, 0, config.rows, PLAYER_TYPE.PLAYER_1);
  expect(getDropRow(board, 0)).toBe(-1);
 });
});

// ─── checkWin — Horizontal ────────────────────────────────────────────────────

describe('checkWin — horizontal', () => {
 it('detects a horizontal win for PLAYER_1', () => {
  let board = createEmptyBoard(config);
  for (let c = 0; c < config.connectCount; c++) {
   board = applyMove(board, c, PLAYER_TYPE.PLAYER_1);
  }
  const result = checkWin(board, config);
  expect(result.winner).toBe(GAME_RESULT.PLAYER_1);
  expect(result.cells).toHaveLength(config.connectCount);
 });

 it('does not trigger on insufficient horizontal pieces', () => {
  let board = createEmptyBoard(config);
  for (let c = 0; c < config.connectCount - 1; c++) {
   board = applyMove(board, c, PLAYER_TYPE.PLAYER_1);
  }
  expect(checkWin(board, config).winner).toBeNull();
 });
});

// ─── checkWin — Vertical ──────────────────────────────────────────────────────

describe('checkWin — vertical', () => {
 it('detects a vertical win for PLAYER_2', () => {
  let board = createEmptyBoard(config);
  board = fillColumn(board, 2, config.connectCount, PLAYER_TYPE.PLAYER_2);
  const result = checkWin(board, config);
  expect(result.winner).toBe(GAME_RESULT.PLAYER_2);
  expect(result.cells).toHaveLength(config.connectCount);
 });
});

// ─── checkWin — Diagonal ──────────────────────────────────────────────────────

describe('checkWin — diagonal', () => {
 it('detects a main-diagonal win (↘)', () => {
  let board = createEmptyBoard(config);
  // Build a bottom-left to top-right diagonal by filling bases
  // Col 0: 4 P2 to prop, Col 1: 3 P2 + 1 P1, etc.
  board = fillColumn(board, 0, 3, PLAYER_TYPE.PLAYER_2);
  board = applyMove(board, 0, PLAYER_TYPE.PLAYER_1); // row rows-4
  board = fillColumn(board, 1, 2, PLAYER_TYPE.PLAYER_2);
  board = applyMove(board, 1, PLAYER_TYPE.PLAYER_1); // row rows-3
  board = applyMove(board, 2, PLAYER_TYPE.PLAYER_2);
  board = applyMove(board, 2, PLAYER_TYPE.PLAYER_1); // row rows-2
  board = applyMove(board, 3, PLAYER_TYPE.PLAYER_1); // row rows-1
  const result = checkWin(board, config);
  expect(result.winner).toBe(GAME_RESULT.PLAYER_1);
 });
});

// ─── checkWin — Draw ─────────────────────────────────────────────────────────

describe('checkWin — draw', () => {
 it('detects a draw when board is full with no winner (3×4 custom board)', () => {
  // Use a small board to force a draw without a winner
  const drawConfig = { rows: 2, columns: 2, connectCount: 3 }; // impossible to win
  let board = createEmptyBoard(drawConfig);
  board = applyMove(board, 0, PLAYER_TYPE.PLAYER_1);
  board = applyMove(board, 1, PLAYER_TYPE.PLAYER_2);
  board = applyMove(board, 0, PLAYER_TYPE.PLAYER_2);
  board = applyMove(board, 1, PLAYER_TYPE.PLAYER_1);
  const result = checkWin(board, drawConfig);
  expect(result.winner).toBe(GAME_RESULT.DRAW);
  expect(result.cells).toBeNull();
 });
});

// ─── checkWin — No winner yet ────────────────────────────────────────────────

describe('checkWin — ongoing', () => {
 it('returns null winner on empty board', () => {
  const result = checkWin(createEmptyBoard(config), config);
  expect(result.winner).toBeNull();
  expect(result.cells).toBeNull();
 });
});
