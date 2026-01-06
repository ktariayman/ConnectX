import { CELL_STATE, PlayerType } from '../../constants/status';
import { BoardConfig, CellState } from '../../types/game';

export function createEmptyBoard(config: BoardConfig): CellState[][] {
  return Array(config.rows)
    .fill(null)
    .map(() => Array(config.columns).fill(CELL_STATE.EMPTY));
}

export function isValidMove(
  board: CellState[][],
  column: number,
  config: BoardConfig
): boolean {
  if (column < 0 || column >= config.columns) return false;
  return board[0][column] === CELL_STATE.EMPTY;
}

export function getDropRow(board: CellState[][], column: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === CELL_STATE.EMPTY) {
      return row;
    }
  }
  return -1;
}

export function applyMove(
  board: CellState[][],
  column: number,
  player: PlayerType
): CellState[][] {
  const newBoard = board.map(row => [...row]);
  const row = getDropRow(newBoard, column);
  if (row !== -1) {
    newBoard[row][column] = player;
  }
  return newBoard;
}
