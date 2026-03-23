import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosClient } from '../lib/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Sparkles } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/auth/register', {
        email,
        username,
        password,
        is_admin: true,
      });
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/95 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black p-4">
      <Card className="w-full max-w-lg border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-indigo-500/20 p-4 ring-1 ring-indigo-500/50">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-3xl text-center text-white tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Join the Multi-IA Consultant platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300" htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a cool username"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 pt-4">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
