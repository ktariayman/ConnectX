import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useGameStore } from '../../store/gameStore';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { username, reset } = useGameStore();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to leave the workspace? This will clear your session.')) {
      reset();
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="no-underline group">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-gradient">ConnectX</span>
          </h1>
        </Link>
        
        <nav className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/rooms" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Rooms
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {username ? (
              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                  <span className="text-xs font-semibold">@{username}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  title="Leave Workspace"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <span className="sr-only">Logout</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </button>
              </div>
            ) : null}

            <button 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
