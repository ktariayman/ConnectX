import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';

interface IdentityGateProps {
  children: React.ReactNode;
}

export function IdentityGate({ children }: IdentityGateProps) {
  const { username, setUsername } = useGameStore();
  const [tempUsername, setTempUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  if (username) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="glass-card rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Connect <span className="text-gradient">X</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your player name to get started
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium leading-none mb-2 block">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="e.g. SharpPlayer_99"
                autoFocus
                required
                minLength={3}
                maxLength={20}
                className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              />
            </div>

            <Button type="submit" variant="default" size="lg" className="w-full h-11 shadow-lg shadow-violet-500/20">
              Enter Workspace
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            This identity will be used for all your games and public listings.
          </p>
        </div>
      </div>
    </div>
  );
}
