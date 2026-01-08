import { CELL_STATE, GAME_RESULT, GameResult, PlayerType } from '../../constants/status';
import { BoardConfig, CellState } from '../../types/game';

/**
 * Checks if there's a winner or draw on the current board
 * Returns the winner and winning cells, or null if game is still in progress
 */
export function checkWin(
 board: CellState[][],
 config: BoardConfig
): { winner: GameResult | null; cells: [number, number][] | null } {
 const { rows, columns, connectCount } = config;

 for (let row = 0; row < rows; row++) {
  for (let col = 0; col <= columns - connectCount; col++) {
   const result = checkLine(board, row, col, 0, 1, connectCount);
   if (result) return result;
  }
 }

 for (let row = 0; row <= rows - connectCount; row++) {
  for (let col = 0; col < columns; col++) {
   const result = checkLine(board, row, col, 1, 0, connectCount);
   if (result) return result;
  }
 }

 for (let row = 0; row <= rows - connectCount; row++) {
  for (let col = 0; col <= columns - connectCount; col++) {
   const result = checkLine(board, row, col, 1, 1, connectCount);
   if (result) return result;
  }
 }
 for (let row = connectCount - 1; row < rows; row++) {
  for (let col = 0; col <= columns - connectCount; col++) {
   const result = checkLine(board, row, col, -1, 1, connectCount);
   if (result) return result;
  }
 }

 const isFull = board.every(row => row.every(cell => cell !== CELL_STATE.EMPTY));
 if (isFull) {
  return { winner: GAME_RESULT.DRAW, cells: null };
 }

 return { winner: null, cells: null };
}

/**
 * Helper function to check a line of cells for a win
 * @param board - The game board
 * @param startRow - Starting row position
 * @param startCol - Starting column position
 * @param rowDir - Row direction (0, 1, or -1)
 * @param colDir - Column direction (0 or 1)
 * @param count - Number of consecutive pieces needed to win
 */
function checkLine(
 board: CellState[][],
 startRow: number,
 startCol: number,
 rowDir: number,
 colDir: number,
 count: number
): { winner: PlayerType; cells: [number, number][] } | null {
 const first = board[startRow][startCol];
 if (first === CELL_STATE.EMPTY) return null;

 const cells: [number, number][] = [];
 for (let i = 0; i < count; i++) {
  const row = startRow + i * rowDir;
  const col = startCol + i * colDir;
  if (board[row][col] !== first) return null;
  cells.push([row, col]);
 }

 return { winner: first, cells };
}
