import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { CreateRoomModal } from '../components/room/CreateRoomModal';
import { JoinRoomModal } from '../components/room/JoinRoomModal';
import { Button } from '../components/ui/Button';

export function HomePage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { username } = useGameStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4">
          ConnectX
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Challenge your friends in real-time strategy
        </p>
        <p className="text-sm text-muted-foreground">
          Good to see you, <strong className="text-foreground">{username}</strong>!
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="w-full"
        >
          Create Room
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/rooms')}
          className="w-full"
        >
          Browse Public Rooms
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowJoinModal(true)}
          className="w-full"
        >
          Join with Room ID
        </Button>
      </div>

      <CreateRoomModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      <JoinRoomModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </div>
  );
}
