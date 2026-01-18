import { useParams } from 'react-router-dom';
import { Board } from '../components/game/Board';
import { WaitingRoom } from '../components/room/WaitingRoom';
import { Button } from '../components/ui/Button';
import { DIFFICULTY_LEVELS, GAME_STATUS, PLAYER_TYPE, GAME_RESULT, PLAYER_COLOR } from '@connect-x/shared';
import { useVisibilityTracking } from '../hooks/useVisibilityTracking';
import { useGameRoom } from '../hooks/useGameRoom';
import { useTurnTimer } from '../hooks/useTurnTimer';
import { socketEmit } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import Modal from 'react-modal';

// Temporary styles mapping to Tailwind classes
const styles = {
  loading: 'flex items-center justify-center min-h-screen flex-col gap-4',
  gamePage: 'min-h-screen bg-background p-4',
  container: 'max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8',
  topActions: 'lg:col-span-3 flex justify-between items-center mb-4',
  header: 'flex items-center gap-4',
  players: 'flex items-center gap-6',
  playerCard: 'flex items-center gap-3 px-4 py-2 rounded-lg border border-border bg-card',
  turnSection: 'lg:col-span-2 flex flex-col gap-4',
  turnInfo: 'text-2xl font-bold bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-6 rounded-2xl border border-border text-center shadow-lg sticky top-4 z-10',
  timer: 'text-lg font-mono text-muted-foreground',
  modalOverlay: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
  gameOver: 'bg-card p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-border outline-none',
  result: 'text-4xl font-bold mb-2',
  finalActions: 'flex gap-4 justify-center mt-8',
  waiting: 'text-xs uppercase tracking-wider font-semibold text-muted-foreground opacity-50',
  active: 'ring-2 ring-primary ring-offset-2 ring-offset-background',
  winner: 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background',
};

// Bind modal to app root
Modal.setAppElement('#root');

export function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const isSpectatorMode = searchParams.get('spectate') === 'true';

  const {
    room,
    playerId,
    gameState,
    context,
    isSpectator,
    isLoading,
    gameOverReason,
    showResultModal,
    setShowResultModal,
    handleLeave,
  } = useGameRoom(roomId, isSpectatorMode);

  // Track tab visibility
  useVisibilityTracking(roomId, playerId, isSpectator);

  // Timer logic
  const timeLeft = useTurnTimer(gameState, room, room?.difficulty || 'MEDIUM');

  const handleColumnClick = (columnIndex: number) => {
    if (!gameState || gameState.status !== GAME_STATUS.IN_PROGRESS || isSpectator || !context?.isMyTurn) return;
    socketEmit.makeMove(roomId!, columnIndex);
  };

  const handleRematch = () => {
    socketEmit.playerReady();
    setShowResultModal(false);
  };

  if (isLoading || !room || !gameState) {
    return (
      <div className={styles.loading}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  // Waiting Room View
  if (gameState.status === GAME_STATUS.WAITING) {
    return (
      <WaitingRoom 
        room={room} 
        currentUserId={playerId!} 
        onLeave={handleLeave}
      />
    );
  }

  const currentPlayer = room.players.get(gameState.currentPlayer === PLAYER_TYPE.PLAYER_1 ? 
    Array.from(room.players.keys())[0] : 
    Array.from(room.players.keys())[1]
  );

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case 'EASY': return 'text-green-500';
      case 'HARD': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className={styles.gamePage}>
      <div className={styles.container}>
        {/* Top Actions Bar */}
        <div className={styles.topActions}>
          <div className={styles.header}>
            <Button variant="outline" size="sm" onClick={handleLeave}>
              ← Leave Game
            </Button>
            <div>
              <h2 className="font-bold">Room #{room.id.slice(0, 4)}</h2>
              <span className={`text-xs font-mono font-bold ${getDifficultyColor(room.difficulty)}`}>
                {DIFFICULTY_LEVELS[room.difficulty as keyof typeof DIFFICULTY_LEVELS]?.label || room.difficulty}
              </span>
            </div>
          </div>

          <div className={styles.players}>
            {Array.from(room.players.values()).map((player) => {
              const isActive = gameState.currentPlayer === (player.color === PLAYER_COLOR.RED ? PLAYER_TYPE.PLAYER_1 : PLAYER_TYPE.PLAYER_2);
              const isWinner = gameState.winner === player.id;
              
              return (
                <div 
                  key={player.id} 
                  className={`
                    ${styles.playerCard}
                    ${isActive && gameState.status === GAME_STATUS.IN_PROGRESS ? styles.active : ''}
                    ${isWinner ? styles.winner : ''}
                    ${!player.isReady && gameState.status === GAME_STATUS.FINISHED ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`w-3 h-3 rounded-full ${player.color === PLAYER_COLOR.RED ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {player.id === playerId ? 'You' : `Player ${player.id.slice(0, 4)}`}
                    </span>
                    {player.id === playerId && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {isSpectator ? 'Spectating' : 'Playing'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Game Area */}
        <div className={styles.turnSection}>
          <div className={styles.turnInfo}>
            {gameState.status === GAME_STATUS.IN_PROGRESS ? (
              <div className="flex flex-col gap-1">
                <span className={currentPlayer?.color === PLAYER_COLOR.RED ? 'text-red-500' : 'text-yellow-500'}>
                  {currentPlayer?.id === playerId ? "Your Turn" : `${currentPlayer?.id.slice(0, 4)}'s Turn`}
                </span>
                 {typeof timeLeft === 'number' && (
                  <span className={`text-sm font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                    Time Remaining: {timeLeft}s
                  </span>
                )}
              </div>
            ) : (
             <span className="text-muted-foreground">Game Over</span>
            )}
          </div>

          <Board 
            board={gameState.board} 
            onColumnClick={handleColumnClick}
            winningCells={gameState.winningCells}
            disabled={gameState.status !== GAME_STATUS.IN_PROGRESS || isSpectator || !context?.isMyTurn}
          />
        </div>

        {/* Game Info / Chat Placeholder */}
        <div className="bg-card rounded-lg border border-border p-4 h-full min-h-[400px]">
           <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Game Log</h3>
           <div className="space-y-2 text-sm font-mono max-h-[400px] overflow-y-auto">
             {gameState.moveHistory.map((move, i) => (
               <div key={i} className="flex items-center gap-2 text-muted-foreground">
                 <span className="opacity-50">#{i + 1}</span>
                 <span className={move.player === PLAYER_TYPE.PLAYER_1 ? 'text-red-500' : 'text-yellow-500'}>
                   {move.player === PLAYER_TYPE.PLAYER_1 ? 'Red' : 'Yellow'}
                 </span>
                 <span>dropped in col {move.column + 1}</span>
               </div>
             ))}
             {gameState.moveHistory.length === 0 && (
               <p className="text-center text-muted-foreground opacity-50 italic py-8">Game started</p>
             )}
           </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal
        isOpen={showResultModal}
        onRequestClose={() => {}} 
        className={styles.gameOver}
        overlayClassName={styles.modalOverlay}
      >
        <h2 className={styles.result}>
          {gameState.winner ? 
            (gameState.winner === playerId ? 'You Won!' : 'You Lost!') :
            'Draw!'}
        </h2>
        
        {gameOverReason && (
          <p className="text-muted-foreground mb-6">
            {gameOverReason}
          </p>
        )}

        <div className={styles.finalActions}>
          <Button onClick={handleLeave} variant="secondary">
            Leave Room
          </Button>
          {!isSpectator && (
             <Button onClick={handleRematch}>
               Play Again
             </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
