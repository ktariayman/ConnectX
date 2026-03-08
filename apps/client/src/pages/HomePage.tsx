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
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-[calc(100vh-4rem)] relative">
      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Hero Text */}
        <div className="text-left space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-medium mb-2">
              Multiplayer Strategy Game
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Connect <span className="text-gradient">X</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Challenge friends or strangers in the ultimate test of strategy. Connect your way to victory in real-time.
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 backdrop-blur-sm">
            <p className="text-sm text-foreground">
              Welcome back, <strong className="text-primary">{username}</strong> 👋
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => setShowCreateModal(true)}
              className="h-12 px-8 text-base shadow-lg shadow-violet-500/20"
            >
              Create Room
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/rooms')}
              className="h-12 px-8 text-base bg-white/50 dark:bg-black/50 backdrop-blur-sm"
            >
              Browse Rooms
            </Button>
          </div>
          
           <div className="pt-2">
            <button 
              onClick={() => setShowJoinModal(true)}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Have a code? Join existing room
            </button>
          </div>
        </div>

        {/* Right Side: Visual/Card */}
        <div className="hidden md:flex justify-center animate-drop" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-full max-w-sm aspect-square">
            {/* Abstract Game Board Representation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-3xl rotate-3 blur-2xl dark:blur-3xl" />
            <div className="relative glass-card rounded-2xl p-8 w-full h-full flex flex-col items-center justify-center border border-white/20 dark:border-white/10 shadow-2xl">
              <div className="grid grid-cols-4 gap-3 p-4">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-full ${
                      [0, 5, 10, 15].includes(i) ? 'bg-violet-500 shadow-lg shadow-violet-500/50' : 
                      [3, 6, 9, 12].includes(i) ? 'bg-indigo-400 opacity-80' : 
                      'bg-secondary'
                    } transition-all duration-500`}
                  />
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">Real-time Gameplay</p>
              </div>
            </div>
          </div>
        </div>
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
