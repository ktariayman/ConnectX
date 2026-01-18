import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { useMutation } from '@tanstack/react-query';
import { roomApi } from '../../lib/api';
import { socket } from '../../lib/socket';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { DEFAULT_BOARD_CONFIG, DIFFICULTY_LEVELS_KEYS, DifficultyLevel } from '@connect-x/shared';

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

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const navigate = useNavigate();
  const { username, setPlayerId, reset } = useGameStore();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS_KEYS.MEDIUM);
  const [connectCount, setConnectCount] = useState(4);
  const [isPublic, setIsPublic] = useState(true);

  const createRoomMutation = useMutation({
    mutationFn: roomApi.create,
    onSuccess: (data: any) => {
      const currentUsername = username;
      reset();
      if (currentUsername) useGameStore.getState().setUsername(currentUsername);
      setPlayerId(data.playerId);
      socket.connect();
      navigate(`/game/${data.roomId}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    createRoomMutation.mutate({
      username,
      difficulty,
      isPublic,
      config: {
        ...DEFAULT_BOARD_CONFIG,
        connectCount,
        columns: Math.max(DEFAULT_BOARD_CONFIG.columns, connectCount + 2),
        rows: Math.max(DEFAULT_BOARD_CONFIG.rows, connectCount + 1),
      }
    });
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
        <h2>Create Room</h2>
        <p className={styles.subtitle}>Setting up game as <strong>{username}</strong></p>
      </div>
      <form onSubmit={handleSubmit}>

        <div className={styles.field}>
          <label>Game Type (Connect X)</label>
          <div className={styles.gameTypeOptions}>
            {[4, 5, 6].map((num) => (
              <label key={num} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="connectCount"
                  value={num}
                  checked={connectCount === num}
                  onChange={() => setConnectCount(num)}
                />
                Connect {num}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
            <option value="EASY">Easy (60s turn)</option>
            <option value="MEDIUM">Medium (30s turn)</option>
            <option value="HARD">Hard (15s turn)</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make room public
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={createRoomMutation.isPending}>
            {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
