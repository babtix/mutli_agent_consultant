import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { axiosClient } from '../lib/axiosClient';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Bot, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [agentCount, setAgentCount] = useState(0);
  const [convoCount, setConvoCount] = useState(0);

  useEffect(() => {
    // Fetch dashboard metrics dynamically from the backend
    const fetchMetrics = async () => {
      try {
        const [agentsRes, convosRes] = await Promise.all([
          axiosClient.get('/agents/'),
          axiosClient.get('/conversations/')
        ]);
        setAgentCount(agentsRes.data.length || 0);
        setConvoCount(convosRes.data.length || 0);
      } catch (err) {
        console.error("Failed to load dashboard metrics");
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
          Welcome back, {user?.username} {user?.is_admin ? '(Admin)' : ''}
        </h1>
        <p className="text-slate-400 text-lg">Manage your custom agents and system conversations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard Cards */}
        <Link to="/agents" className="block outline-none">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all cursor-pointer group h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <CardHeader>
              <Users className="h-8 w-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform relative z-10" />
              <CardTitle className="text-white relative z-10 text-2xl flex items-center justify-between">
                Active Agents
                <span className="text-3xl font-black text-white/50">{agentCount}</span>
              </CardTitle>
              <CardDescription className="text-slate-400 relative z-10">View and manage your custom local experts</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/conversations" className="block outline-none">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all cursor-pointer group h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform relative z-10" />
              <CardTitle className="text-white relative z-10 text-2xl flex items-center justify-between">
                Recent Threads
                <span className="text-3xl font-black text-white/50">{convoCount}</span>
              </CardTitle>
              <CardDescription className="text-slate-400 relative z-10">Jump back into your recent conversations</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/agents" className="block outline-none">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] transition-all cursor-pointer group h-full relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <CardHeader>
              <Bot className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform relative z-10" />
              <CardTitle className="text-white relative z-10">Create New Agent</CardTitle>
              <CardDescription className="text-slate-400 relative z-10">Design a new AI persona with a specific system prompt</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pb-6">
              <Button className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Configure Agent</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
