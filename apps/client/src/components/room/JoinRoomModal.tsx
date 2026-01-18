import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { socket, socketEmit, socketOn } from '../../lib/socket';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';

const styles = {
  modal: 'bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 outline-none',
  overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
  modalHeader: 'mb-6',
  subtitle: 'text-sm text-muted-foreground mt-1',
  field: 'mb-4',
  error: 'text-sm text-destructive bg-destructive/10 p-3 rounded mb-4',
  actions: 'flex gap-3 justify-end mt-6',
  gameTypeOptions: 'flex gap-3',
  radioLabel: 'flex items-center gap-2 cursor-pointer',
  checkbox: 'flex items-center gap-2 cursor-pointer',
};

Modal.setAppElement('#root');

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const navigate = useNavigate();
  const { username, setRoom, setPlayerId, setGameState } = useGameStore();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setError('');
    setIsJoining(true);

    if (!socket.connected) socket.connect();

    const handleJoined = (data: any) => {
      const roomData = data.room || data;
      if (!roomData) return;

      const convertedRoom = {
        ...roomData,
        players: new Map(roomData.players.map((p: any) => [p.id, p])),
        createdAt: new Date(roomData.createdAt),
        turnStartedAt: roomData.turnStartedAt ? new Date(roomData.turnStartedAt) : null,
        gameState: {
          ...roomData.gameState,
          moveHistory: roomData.gameState.moveHistory.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        },
      };

      setRoom(convertedRoom as any);
      setPlayerId(data.playerId);
      setGameState(convertedRoom.gameState);
      
      socket.off('room:updated', handleJoined);
      socket.off('error', handleError);
      
      navigate(`/game/${roomData.id}`);
    };

    const handleError = (data: any) => {
      if (data.message === 'Room is full') {
        setError('');
        
        socket.off('room:updated', handleJoined);
        socket.off('error', handleError);
        
        const handleSpectatorJoined = (data: any) => {
          const roomData = data.room || data;
          if (!roomData) return;

          const convertedRoom = {
            ...roomData,
            players: new Map(roomData.players.map((p: any) => [p.id, p])),
            spectators: new Set(roomData.spectators || []),
            createdAt: new Date(roomData.createdAt),
            turnStartedAt: roomData.turnStartedAt ? new Date(roomData.turnStartedAt) : null,
            gameState: {
              ...roomData.gameState,
              moveHistory: roomData.gameState.moveHistory.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            },
          };

          setRoom(convertedRoom as any);
          setPlayerId(data.playerId || username);
          setGameState(convertedRoom.gameState);
          
          socket.off('room:updated', handleSpectatorJoined);
          socket.off('error', handleSpectatorError);
          
          navigate(`/game/${roomData.id}?spectate=true`);
        };

        const handleSpectatorError = (data: any) => {
          setError(data.message);
          setIsJoining(false);
          socket.off('room:updated', handleSpectatorJoined);
          socket.off('error', handleSpectatorError);
        };

        socketOn.roomUpdated(handleSpectatorJoined);
        socketOn.error(handleSpectatorError);
        socketEmit.spectateRoom(roomId, username!);
        return;
      }
      
      setError(data.message);
      setIsJoining(false);
      socket.off('room:updated', handleJoined);
      socket.off('error', handleError);
    };

    socketOn.roomUpdated(handleJoined);
    socketOn.error(handleError);

    socketEmit.joinRoom(roomId, username);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeTimeoutMS={200}
    >
      <div className={styles.modalHeader}>
        <h2>Join Room</h2>
        <p className={styles.subtitle}>Joining as <strong>{username}</strong></p>
      </div>
      <form onSubmit={handleSubmit}>

        <div className={styles.field}>
          <label>Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            required
          />
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isJoining}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
