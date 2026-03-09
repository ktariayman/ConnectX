import { CellState } from '@connect-x/shared';
import { Cell } from './Cell';

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
    // Solid blue board frame — always visible in both light and dark mode
    <div
      className="inline-block rounded-2xl shadow-2xl p-3"
      style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)',
        boxShadow: '0 20px 60px rgba(30, 64, 175, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Column buttons — clicking anywhere in a column drops the piece */}
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <button
            key={colIndex}
            type="button"
            disabled={disabled}
            className={[
              'flex flex-col gap-2 rounded-xl p-1.5 transition-all duration-150',
              !disabled ? 'hover:bg-white/10 cursor-pointer' : 'cursor-not-allowed',
            ].join(' ')}
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
          </button>
        ))}
      </div>
    </div>
  );
}
