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
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="no-underline">
          <h1 className="text-xl font-semibold tracking-tight">ConnectX</h1>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/rooms" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Browse Rooms
          </Link>
          
          {username && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded">
              <span className="text-xs font-medium">@{username}</span>
              <button 
                onClick={handleLogout} 
                title="Leave Workspace"
                className="text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                🚪
              </button>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
}
