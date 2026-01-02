import { BoardConfig, CellState } from '../../types/game';

export function createEmptyBoard(config: BoardConfig): CellState[][] {
  return Array(config.rows)
    .fill(null)
    .map(() => Array(config.columns).fill('EMPTY'));
}

export function isValidMove(
  board: CellState[][],
  column: number,
  config: BoardConfig
): boolean {
  if (column < 0 || column >= config.columns) return false;
  return board[0][column] === 'EMPTY';
}

export function getDropRow(board: CellState[][], column: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === 'EMPTY') {
      return row;
    }
  }
  return -1;
}

export function applyMove(
  board: CellState[][],
  column: number,
  player: 'PLAYER_1' | 'PLAYER_2'
): CellState[][] {
  const newBoard = board.map(row => [...row]);
  const row = getDropRow(newBoard, column);
  if (row !== -1) {
    newBoard[row][column] = player;
  }
  return newBoard;
}
