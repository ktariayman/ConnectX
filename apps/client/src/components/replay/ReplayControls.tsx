import { Button } from '../ui/Button';

const styles = {
  controls: 'bg-card border border-border rounded-lg p-4 space-y-4',
  info: 'text-center',
  moveCounter: 'font-mono text-sm font-medium',
  buttons: 'flex justify-center gap-2',
  slider: 'px-2',
  seekBar: 'w-full',
  speed: 'flex items-center justify-center gap-2 text-sm',
  speedSelector: 'px-2 py-1 bg-background border border-border rounded',
};

interface ReplayControlsProps {
  currentMove: number;
  totalMoves: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onSeek: (moveIndex: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function ReplayControls({
  currentMove,
  totalMoves,
  isPlaying,
  playbackSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  onSeek,
  onSpeedChange,
}: ReplayControlsProps) {
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className={styles.controls}>
      <div className={styles.info}>
        <span className={styles.moveCounter}>
          Move {currentMove + 1} / {totalMoves}
        </span>
      </div>

      <div className={styles.buttons}>
        <Button
          variant="outline"
          size="sm"
          onClick={onJumpToStart}
          disabled={currentMove === -1}
          title="Jump to start"
        >
          ⏮️
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onStepBackward}
          disabled={currentMove === -1}
          title="Step backward"
        >
          ⏪
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={isPlaying ? onPause : onPlay}
          disabled={currentMove >= totalMoves - 1 && !isPlaying}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onStepForward}
          disabled={currentMove >= totalMoves - 1}
          title="Step forward"
        >
          ⏩
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onJumpToEnd}
          disabled={currentMove >= totalMoves - 1}
          title="Jump to end"
        >
          ⏭️
        </Button>
      </div>

      <div className={styles.slider}>
        <input
          type="range"
          min="-1"
          max={totalMoves - 1}
          value={currentMove}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className={styles.seekBar}
        />
      </div>

      <div className={styles.speed}>
        <label>Speed:</label>
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className={styles.speedSelector}
        >
          {speeds.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
