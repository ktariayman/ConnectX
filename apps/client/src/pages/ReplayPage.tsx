import { useParams } from 'react-router-dom';
import { Board } from '../components/game/Board';
import { ReplayControls } from '../components/replay/ReplayControls';
import { Button } from '../components/ui/Button';
import { useReplay } from '../hooks/useReplay';
import { PLAYER_COLOR } from '@connect-x/shared';

const styles = {
  page: 'min-h-screen bg-background p-6',
  loading: 'flex items-center justify-center',
  error: 'flex flex-col items-center gap-4',
  container: 'max-w-4xl mx-auto',
  header: 'flex items-center justify-between mb-6',
  roomId: 'text-sm text-muted-foreground',
  moveInfo: 'text-center mb-4',
  player: 'font-bold',
  timestamp: 'text-sm text-muted-foreground ml-2',
  initial: 'text-muted-foreground',
  boardContainer: 'mb-6',
};

export function ReplayPage() {
  const { roomId } = useParams<{ roomId: string }>();
  
  const {
    navigate,
    board,
    config,
    loading,
    error,
    currentMove,
    currentPlayer,
    controls
  } = useReplay(roomId);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading replay...</div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>❌ {error || 'Failed to load replay'}</h2>
          <Button variant="default" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            ← Back
          </Button>
          <h1>🎬 Game Replay</h1>
          <div className={styles.roomId}>
            Room: <code>{roomId?.slice(0, 8)}</code>
          </div>
        </div>

        <div className={styles.moveInfo}>
          {currentPlayer && currentMove ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                  currentPlayer === PLAYER_COLOR.RED
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentPlayer === PLAYER_COLOR.RED ? 'bg-red-500' : 'bg-amber-400'}`} />
                {currentPlayer === PLAYER_COLOR.RED ? 'Red' : 'Yellow'}
              </span>
              <span className="text-sm text-muted-foreground">
                Move <strong>{controls.currentMove + 1}</strong> — Column <strong>{currentMove.column + 1}</strong>
              </span>
              <span className={styles.timestamp}>
                {new Date(currentMove.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <span className={styles.initial}>⬤ Initial board state</span>
          )}
        </div>

        <div className={styles.boardContainer}>
          <Board
            board={board}
            onColumnClick={() => {}} 
            winningCells={null}
            disabled={true}
          />
        </div>

        <ReplayControls {...controls} />
      </div>
    </div>
  );
}
