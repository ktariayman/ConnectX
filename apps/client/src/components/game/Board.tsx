import { CellState } from '@connect-x/shared';
import { Cell } from './Cell';

const styles = {
  board: 'inline-block bg-gradient-to-tr from-slate-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-4 border-slate-700/50 backdrop-blur-sm ring-1 ring-white/10',
  grid: 'flex gap-3',
  column: 'flex flex-col gap-3 cursor-pointer hover:brightness-110 transition-all duration-300 overflow-hidden py-2',
  disabled: 'cursor-not-allowed opacity-80 grayscale-[0.2]',
};

interface BoardProps {
  board: CellState[][];
  onColumnClick: (column: number) => void;
  winningCells: [number, number][] | null;
  disabled: boolean;
}

export function Board({ board, onColumnClick, winningCells, disabled }: BoardProps) {
  const isWinningCell = (row: number, col: number) => {
    return winningCells?.some(([r, c]) => r === row && c === col) || false;
  };

  const rows = board.length;
  const cols = board[0]?.length || 0;

  return (
    <div className={styles.board}>
      {/* Container for the grid */}
      <div className={styles.grid}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={`${styles.column} ${disabled ? styles.disabled : ''}`}
            onClick={() => {
              if (!disabled) onColumnClick(colIndex);
            }}
          >
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                state={board[rowIndex][colIndex]}
                isWinning={isWinningCell(rowIndex, colIndex)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
