import clsx from 'clsx';
import { CellState, CELL_STATE } from '@connect-x/shared';

interface CellProps {
  state: CellState;
  isWinning: boolean;
  onClick?: () => void;
  disabled: boolean;
}

export function Cell({ state, isWinning, onClick, disabled }: CellProps) {
  const isEmpty = state === CELL_STATE.EMPTY;
  const isP1 = state === CELL_STATE.PLAYER_1;
  const isP2 = state === CELL_STATE.PLAYER_2;

  return (
    <div
      className={clsx(
        // Cell slot — visible in both light and dark mode via explicit colours
        'w-12 h-12 rounded-full flex items-center justify-center',
        'transition-all duration-150',
        !disabled && isEmpty && 'hover:bg-white/20 cursor-pointer',
        disabled && 'cursor-not-allowed',
        isWinning && 'ring-4 ring-white scale-110 z-10',
      )}
      onClick={onClick}
    >
      {/* The "hole" — always visible regardless of theme */}
      <div
        className={clsx(
          'w-10 h-10 rounded-full transition-all duration-300',
          isEmpty && 'bg-zinc-900 dark:bg-zinc-950 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)] border border-zinc-700/50 dark:border-zinc-800',
          isP1 && [
            'bg-gradient-to-br from-red-400 to-rose-600',
            'shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),0_4px_12px_rgba(225,29,72,0.5)]',
            'ring-1 ring-white/20',
            'animate-drop',
          ],
          isP2 && [
            'bg-gradient-to-br from-yellow-300 to-amber-500',
            'shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),0_4px_12px_rgba(245,158,11,0.5)]',
            'ring-1 ring-white/20',
            'animate-drop',
          ],
          isWinning && 'ring-4 ring-white shadow-[0_0_24px_rgba(255,255,255,0.7)] scale-105',
        )}
      />
    </div>
  );
}
