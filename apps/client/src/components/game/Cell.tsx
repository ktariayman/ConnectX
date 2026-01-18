import clsx from 'clsx';
import { CellState, CELL_STATE, PLAYER_TYPE } from '@connect-x/shared';

const styles = {
  // The 'hole' in the board: dark, inner shadow, no border
  cell: 'w-16 h-16 rounded-full flex items-center justify-center bg-black/20 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md',
  
  // 3D Gradients for pieces
  player1: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-900/50 ring-2 ring-red-400/30',
  player2: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-900/50 ring-2 ring-yellow-400/30',
  
  winning: 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)] z-10 scale-105 transition-transform duration-500',
  disabled: 'cursor-not-allowed',
  
  piece: 'w-14 h-14 rounded-full shadow-lg animate-drop shadow-lg',
};

interface CellProps {
  state: CellState;
  isWinning: boolean;
  onClick?: () => void;
  disabled: boolean;
}

export function Cell({ state, isWinning, onClick, disabled }: CellProps) {
  return (
    <div
      className={clsx(styles.cell, {
        [styles.winning]: isWinning,
        [styles.disabled]: disabled,
      })}
      onClick={onClick}
    >
      {state === CELL_STATE.PLAYER_1 && <div className={clsx(styles.piece, styles.player1)} />}
      {state === CELL_STATE.PLAYER_2 && <div className={clsx(styles.piece, styles.player2)} />}
    </div>
  );
}
