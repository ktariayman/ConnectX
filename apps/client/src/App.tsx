import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './pages/HomePage';
import { RoomListPage } from './pages/RoomListPage';
import { GamePage } from './pages/GamePage';
import { ReplayPage } from './pages/ReplayPage';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { IdentityGate } from './components/auth/IdentityGate';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <IdentityGate>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="rooms" element={<RoomListPage />} />
                <Route path="game/:roomId" element={<GamePage />} />
                <Route path="replay/:roomId" element={<ReplayPage />} />
              </Route>
            </Routes>
          </IdentityGate>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
