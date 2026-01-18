import { Button } from '../components/ui/Button';
import { GAME_STATUS, GAME_RESULT } from '@connect-x/shared';
import { useRoomList } from '../hooks/useRoomList';

const styles = {
  page: 'min-h-screen bg-background p-6',
  container: 'max-w-6xl mx-auto',
  headerInfo: 'text-center mb-6 text-muted-foreground',
  empty: 'flex flex-col items-center justify-center gap-4 py-12 text-center',
  roomList: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8',
  roomCard: 'bg-card border border-border rounded-lg p-4 flex justify-between items-start gap-4',
  roomInfo: 'flex-1',
  details: 'grid grid-cols-2 gap-2 mt-3 text-sm',
  stat: 'flex flex-col gap-1',
  difficulty_EASY: 'text-green-600 dark:text-green-400 font-medium',
  difficulty_MEDIUM: 'text-yellow-600 dark:text-yellow-400 font-medium',
  difficulty_HARD: 'text-red-600 dark:text-red-400 font-medium',
  replaySection: 'mt-12 pt-8 border-t border-border',
  hint: 'text-xs text-muted-foreground mt-2',
  actions: 'flex gap-3 justify-center mt-8',
};

export function RoomListPage() {
  const {
    navigate,
    username,
    rooms,
    isLoading,
    refetch,
    replays,
    replaysLoading,
    selectedRoomId,
    isJoining,
    handleJoinRoom,
    handleSpectateRoom,
  } = useRoomList();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Public Rooms</h1>
        
        <div className={styles.headerInfo}>
          <p>Browsing as <strong>{username}</strong></p>
        </div>

        {isLoading ? (
          <div className={styles.empty}>
            <p>Scanning for active rooms...</p>
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className={styles.roomList}>
            {rooms.map((room: any) => (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomInfo}>
                  <h3>Room #{room.id.slice(0, 4)}</h3>
                  <div className={styles.details}>
                    <div className={styles.stat}>
                      <label>Difficulty</label>
                      <span className={styles[`difficulty_${room.difficulty}` as keyof typeof styles]}>{room.difficulty}</span>
                    </div>
                    <div className={styles.stat}>
                      <label>Players</label>
                      <span>{room.playerCount}/2</span>
                    </div>
                    {room.spectatorCount > 0 && (
                      <div className={styles.stat}>
                        <label>Spectators</label>
                        <span>👁️ {room.spectatorCount}</span>
                      </div>
                    )}
                    <div className={styles.stat}>
                      <label>Status</label>
                      <span>{room.status === GAME_STATUS.IN_PROGRESS ? '🎮 Playing' : room.status === GAME_STATUS.WAITING ? '⏳ Waiting' : '✅ Finished'}</span>
                    </div>
                    <div className={styles.stat}>
                      <label>Format</label>
                      <span>Connect {room.config.connectCount}</span>
                    </div>
                    <div className={styles.stat}>
                      <label>Grid</label>
                      <span>{room.config.rows}×{room.config.columns}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  {room.status === GAME_STATUS.FINISHED ? (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/replay/${room.id}`)}
                    >
                      🎬 View Replay
                    </Button>
                  ) : room.playerIds?.includes(username) ? (
                    <Button
                      variant="default"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={isJoining && selectedRoomId === room.id}
                    >
                      {isJoining && selectedRoomId === room.id ? 'Connecting...' : '🎮 Rejoin Game'}
                    </Button>
                  ) : room.status === GAME_STATUS.IN_PROGRESS || room.playerCount >= 2 ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleSpectateRoom(room.id)}
                      disabled={isJoining && selectedRoomId === room.id}
                    >
                      {isJoining && selectedRoomId === room.id ? 'Connecting...' : '👁️ Watch Live'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={isJoining && selectedRoomId === room.id}
                    >
                      {isJoining && selectedRoomId === room.id ? 'Connecting...' : 'Join Game'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No active public rooms found</p>
            <Button variant="default" onClick={() => navigate('/')}>
              Create New Room
            </Button>
          </div>
        )}

        {/* Replay Section */}
        <div className={styles.replaySection}>
          <h2>🎬 Browse Replays</h2>
          {replaysLoading ? (
            <div className={styles.empty}>
              <p>Loading replays...</p>
            </div>
          ) : replays && replays.length > 0 ? (
            <div className={styles.roomList}>
              {replays.slice(0, 10).map((game: any) => (
                <div key={game.id} className={styles.roomCard}>
                  <div className={styles.roomInfo}>
                    <h3>Game #{game.roomId.slice(0, 4)}</h3>
                    <div className={styles.details}>
                      <div className={styles.stat}>
                        <label>Players</label>
                        <span>{game.players.join(' vs ')}</span>
                      </div>
                      <div className={styles.stat}>
                        <label>Winner</label>
                        <span>{game.winner === GAME_RESULT.DRAW ? '🤝 Draw' : game.winner === GAME_RESULT.PLAYER_1 ? `🏆 ${game.players[0]}` : `🏆 ${game.players[1]}`}</span>
                      </div>
                      <div className={styles.stat}>
                        <label>Difficulty</label>
                        <span className={styles[`difficulty_${game.difficulty}` as keyof typeof styles]}>{game.difficulty}</span>
                      </div>
                      <div className={styles.stat}>
                        <label>Moves</label>
                        <span>{game.moveHistory.length}</span>
                      </div>
                      <div className={styles.stat}>
                        <label>Finished</label>
                        <span>{new Date(game.finishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/replay/${game.roomId}`)}
                    >
                      🎬 Watch Replay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No replays available yet</p>
              <p className={styles.hint}>Finish a game to create your first replay!</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh List
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
