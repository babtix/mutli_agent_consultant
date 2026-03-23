import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@workspace/ui/components/button';
import { Bot, LogOut, LayoutDashboard, Users, MessageSquare, Menu, X, Settings } from 'lucide-react';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', path: '/agents', icon: Users },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-40 bg-black/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        } h-full flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
          <div className="flex items-center gap-2 overflow-hidden">
            <Bot className="h-8 w-8 text-indigo-500 shrink-0" />
            <span className={`font-bold tracking-tight whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              Multi-IA
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-indigo-600/20 text-indigo-400 font-medium ring-1 ring-indigo-500/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={`whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings className="h-5 w-5 shrink-0 text-slate-500" />
            <span className={`whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              Settings
            </span>
          </NavLink>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-black/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white bg-white/5"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-200 hidden sm:block">Consultant Workspace</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-500/30">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline-block font-medium">{user?.username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-black/95 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
