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
          {currentPlayer ? (
            <>
              <span className={styles.player} style={{ color: currentPlayer === PLAYER_COLOR.RED ? '#ef4444' : '#3b82f6' }}>
                {currentPlayer} Player
              </span>
              {currentMove && (
                <span className={styles.timestamp}>
                  {new Date(currentMove.timestamp).toLocaleTimeString()}
                </span>
              )}
            </>
          ) : (
            <span className={styles.initial}>Initial State</span>
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
