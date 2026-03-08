import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-500/10 blur-[80px]" />
      </div>
      
      <Header />
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
