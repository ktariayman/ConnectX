import clsx from 'clsx';
import { CellState, CELL_STATE, PLAYER_TYPE } from '@connect-x/shared';

const styles = {
  // The 'hole' in the board: dark, inner shadow, no border
  cell: 'w-16 h-16 rounded-full flex items-center justify-center bg-black/40 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] backdrop-blur-sm border border-white/5',
  
  // 3D Gradients for pieces - Premium Ruby & Gold
  player1: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(225,29,72,0.4)] ring-1 ring-white/20',
  player2: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(245,158,11,0.4)] ring-1 ring-white/20',
  
  winning: 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)] z-10 scale-110 transition-transform duration-500',
  disabled: 'cursor-not-allowed',
  
  piece: 'w-14 h-14 rounded-full animate-drop',
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
