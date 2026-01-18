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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="text-5xl">🎮</span>
          <h1 className="text-4xl font-bold tracking-tight">ConnectX</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
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
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button type="submit" variant="default" size="lg" className="w-full">
            Enter Workspace
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          This identity will be used for all your games and public listings.
        </p>
      </div>
    </div>
  );
}
