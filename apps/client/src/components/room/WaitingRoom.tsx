import { useState } from 'react';
import { Room } from '@connect-x/shared';
import { Button } from '../ui/Button';
import { useWaitingRoom } from '../../hooks/useWaitingRoom';

// Temporary styles mapping to Tailwind classes
const styles = {
  container: 'min-h-screen flex items-center justify-center p-6 bg-background',
  card: 'bg-card border border-border rounded-lg p-8 max-w-2xl w-full',
  roomInfo: 'space-y-2 mb-6 p-4 bg-secondary rounded-lg',
  infoRow: 'flex justify-between items-center text-sm',
  difficulty: 'font-semibold text-accent',
  playersSection: 'mb-6',
  playerList: 'space-y-3 mt-3',
  playerItem: 'flex items-center gap-3 p-3 bg-secondary rounded-lg',
  avatar: 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
  red: 'bg-red-500',
  yellow: 'bg-amber-400',
  playerName: 'flex-1 flex flex-col',
  colorLabel: 'text-xs text-muted-foreground',
  readyBadge: 'px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full',
  waitingBadge: 'px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded-full',
  actions: 'mt-6',
  waiting: 'text-center text-muted-foreground',
  hint: 'text-sm mt-2',
  readySection: 'flex flex-col items-center gap-4',
  waitingText: 'text-center text-muted-foreground',
  inviteRow: 'flex items-center gap-2 mt-2',
  inviteCode: 'flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono truncate',
};

interface WaitingRoomProps {
  room: Room;
  currentUserId: string;
  onLeave: () => void;
}

export function WaitingRoom({ room, currentUserId, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const {
    players,
    spectators,
    isSpectator,
    isReady,
    otherPlayerSet,
    waitingForPlayers,
    handleReady,
  } = useWaitingRoom(room, currentUserId);

  const roomUrl = `${window.location.origin}/game/${room.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Waiting Room</h1>
        
        <div className={styles.roomInfo}>
          <div className={styles.infoRow}>
            <span>Difficulty:</span>
            <span className={styles.difficulty}>{room.difficulty}</span>
          </div>
          <div className={styles.infoRow}>
            <span>Board:</span>
            <span>{room.config.rows}×{room.config.columns}, Connect {room.config.connectCount}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Invite a friend — share this link:</p>
            <div className={styles.inviteRow}>
              <code className={styles.inviteCode}>{roomUrl}</code>
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.playersSection}>
          <h3>Players ({players.length}/2)</h3>
          <div className={styles.playerList}>
            {players.map((player) => {
              const avatarClass = player.color === 'RED' ? styles.red : styles.yellow;
              return (
                <div key={player.id} className={styles.playerItem}>
                  <div className={`${styles.avatar} ${avatarClass}`}>
                    {player.id[0].toUpperCase()}
                  </div>
                  <div className={styles.playerName}>
                    <span className="font-medium">{player.id}{player.id === currentUserId && ' (You)'}</span>
                    <span className={styles.colorLabel}>{player.color === 'RED' ? '🔴 Red' : '🟡 Yellow'} Player</span>
                  </div>
                  {player.isReady ? (
                    <span className={styles.readyBadge}>READY</span>
                  ) : (
                    <span className={styles.waitingBadge}>WAITING</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {spectators.size > 0 && (
          <div className={styles.playersSection}>
            <h3>👁️ Spectators ({spectators.size})</h3>
            <div className={styles.playerList}>
              {Array.from(spectators).map((spectatorId: string) => (
                <div key={spectatorId} className={styles.playerItem}>
                  <div className={styles.avatar} style={{ background: '#6c757d' }}>
                    {spectatorId[0].toUpperCase()}
                  </div>
                  <div className={styles.playerName}>
                    <span className="font-medium">{spectatorId}{spectatorId === currentUserId && ' (You)'}</span>
                    <span className={styles.colorLabel}>Spectator</span>
                  </div>
                  <span className={styles.waitingBadge}>WATCHING</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {isSpectator ? (
            <div className={styles.waiting}>
              <p>👁️ You are spectating this game</p>
              <p className={styles.hint}>Waiting for players to be ready...</p>
            </div>
          ) : waitingForPlayers ? (
            <div className={styles.waiting}>
              <p>Waiting for another player to join...</p>
              <p className={styles.hint}>Share the link above with a friend!</p>
            </div>
          ) : (
            <div className={styles.readySection}>
              {!isReady ? (
                <Button variant="default" size="lg" onClick={handleReady}>
                  I'm Ready!
                </Button>
              ) : (
                <p className={styles.waitingText}>
                  {otherPlayerSet && !otherPlayerSet.isReady
                    ? `Waiting for ${otherPlayerSet.id} to be ready...`
                    : 'Waiting for other player...'}
                </p>
              )}
            </div>
          )}
          
          <Button variant="link" onClick={onLeave} className="mt-4 w-full">
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
}
