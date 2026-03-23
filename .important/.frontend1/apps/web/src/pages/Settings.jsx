import React, { useState, useEffect } from 'react';
import { axiosClient } from '../lib/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider';
import { Users, SlidersHorizontal, Trash2, Cpu, ShieldAlert, Globe, Save, Palette, Sun, Moon, Monitor } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Settings State
  const [settings, setSettings] = useState({
    OLLAMA_URL: '',
    OLLAMA_TIMEOUT: 120,
    DEFAULT_MODEL_NAME: '',
    MODEL_TEMPERATURE: 0.7,
    MODEL_TOP_P: 0.9,
    MODEL_TOP_K: 40,
    MODEL_REPEAT_PENALTY: 1.1,
    MODEL_NUM_PREDICT: 1024,
    MODEL_NUM_CTX: 4096
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      if (activeTab === 'llm') fetchSettings();
      if (activeTab === 'users') fetchUsers();
    }
  }, [activeTab, user]);

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/settings/');
      setSettings(res.data);
    } catch (e) {
      toast.error('Failed to load LLM settings');
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axiosClient.get('/auth/users');
      setUsers(res.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await axiosClient.put('/settings/', settings);
      toast.success('Settings permanently saved!');
    } catch (e) {
      toast.error('Failed to update Settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const promoteUser = async (id) => {
    try {
      await axiosClient.put(`/auth/users/${id}/promote`);
      toast.success('User promoted to Admin');
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to promote');
    }
  };

  const deleteUser = async (id) => {
    try {
      await axiosClient.delete(`/auth/users/${id}`);
      toast.success('User removed from system');
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="h-8 w-8 text-indigo-500" /> Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">Manage your account preferences, overarching platform variables, and user access levels.</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl w-fit mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Palette className="h-4 w-4" /> Appearance
        </button>
        
        {user?.is_admin && (
           <>
              <button 
                onClick={() => setActiveTab('llm')}
                className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'llm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Cpu className="h-4 w-4" /> Global LLM Parameters
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" /> User Management
              </button>
           </>
        )}
      </div>

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
          <CardHeader>
             <CardTitle className="text-slate-800 dark:text-white">Theme Preferences</CardTitle>
             <CardDescription className="text-slate-500 dark:text-slate-400">Customize the appearance of the portal to suit your environment.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {/* Light Theme Button */}
               <div 
                 onClick={() => setTheme('light')} 
                 className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                   theme === 'light' ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-400/50'
                 }`}
               >
                 <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-amber-500" />
                 </div>
                 <span className="font-semibold text-slate-800 dark:text-white">Light Mode</span>
               </div>
               
               {/* Dark Theme Button */}
               <div 
                 onClick={() => setTheme('dark')} 
                 className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                   theme === 'dark' ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-400/50'
                 }`}
               >
                 <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-indigo-400" />
                 </div>
                 <span className="font-semibold text-slate-800 dark:text-white">Dark Mode</span>
               </div>

               {/* System Theme Button */}
               <div 
                 onClick={() => setTheme('system')} 
                 className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                   theme === 'system' ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-400/50'
                 }`}
               >
                 <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                 </div>
                 <span className="font-semibold text-slate-800 dark:text-white">System Sync</span>
               </div>
             </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Protected Views */}
      {!user?.is_admin && activeTab !== 'appearance' ? (
        <div className="flex items-center justify-center py-16 opacity-60 flex-col">
          <ShieldAlert className="h-16 w-16 mb-4 text-red-500" />
          <h2 className="text-xl text-slate-800 dark:text-white font-bold">Admin Privileges Required</h2>
          <p className="text-slate-500 dark:text-slate-400">You must be an administrator to view this pane.</p>
        </div>
      ) : (
         <>
            {activeTab === 'llm' && (
              <form onSubmit={handleSettingsUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2"><Globe className="h-5 w-5 text-indigo-500"/> Network & Host</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">Configure connection pipelines to the internal API or remote Ollama architecture.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Ollama Inference URL</Label>
                        <Input 
                          value={settings.OLLAMA_URL} 
                          onChange={e => setSettings({...settings, OLLAMA_URL: e.target.value})} 
                          className="font-mono bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Default Model Name (Fallback)</Label>
                        <Input 
                          value={settings.DEFAULT_MODEL_NAME} 
                          onChange={e => setSettings({...settings, DEFAULT_MODEL_NAME: e.target.value})} 
                          className="font-mono bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Connection Timeout (Seconds)</Label>
                        <Input 
                          type="number" 
                          value={settings.OLLAMA_TIMEOUT} 
                          onChange={e => setSettings({...settings, OLLAMA_TIMEOUT: parseFloat(e.target.value)})} 
                          className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2"><Cpu className="h-5 w-5 text-purple-500"/> Core LLM Parameters</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">Fine-tune memory allocation and creativity limits. Requires deep understanding of local models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Temperature (0 - 1.0)</Label>
                          <Input 
                            step="0.1" type="number" 
                            value={settings.MODEL_TEMPERATURE} 
                            onChange={e => setSettings({...settings, MODEL_TEMPERATURE: parseFloat(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Top P</Label>
                          <Input 
                            step="0.05" type="number" 
                            value={settings.MODEL_TOP_P} 
                            onChange={e => setSettings({...settings, MODEL_TOP_P: parseFloat(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Top K</Label>
                          <Input 
                            type="number" 
                            value={settings.MODEL_TOP_K} 
                            onChange={e => setSettings({...settings, MODEL_TOP_K: parseInt(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Repeat Penalty</Label>
                          <Input 
                            step="0.1" type="number" 
                            value={settings.MODEL_REPEAT_PENALTY} 
                            onChange={e => setSettings({...settings, MODEL_REPEAT_PENALTY: parseFloat(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Max Wait / Num Predict</Label>
                          <Input 
                            type="number" 
                            value={settings.MODEL_NUM_PREDICT} 
                            onChange={e => setSettings({...settings, MODEL_NUM_PREDICT: parseInt(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Context Window</Label>
                          <Input 
                            type="number" 
                            value={settings.MODEL_NUM_CTX} 
                            onChange={e => setSettings({...settings, MODEL_NUM_CTX: parseInt(e.target.value)})} 
                            className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
                <div className="mt-6 flex justify-end">
                   <Button type="submit" disabled={settingsLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 shadow-md shadow-emerald-600/20">
                     <Save className="h-4 w-4" /> Save Global Configuration
                   </Button>
                </div>
              </form>
            )}

            {activeTab === 'users' && (
              <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-white">Active Accounts</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">View and manage authorized local personas logging into this portal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-black/20">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                      <thead className="text-xs uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-medium">Username</th>
                          <th scope="col" className="px-6 py-3 font-medium">Email</th>
                          <th scope="col" className="px-6 py-3 font-medium text-center">Admin</th>
                          <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                        {usersLoading ? (
                          <tr><td colSpan="4" className="text-center py-6">Loading Users...</td></tr>
                        ) : users.map(u => (
                          <tr key={u._id} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-800 dark:text-white">
                               <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400">
                                  {u.username[0].toUpperCase()}
                               </div>
                               {u.username}
                            </td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4 text-center">
                              {u.is_admin ? (
                                <span className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs px-2 py-1 rounded-full font-medium">Admin</span>
                              ) : (
                                <span className="bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20 text-xs px-2 py-1 rounded-full font-medium">Standard</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {!u.is_admin && (
                                <Button onClick={() => promoteUser(u._id)} variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                                   Promote
                                </Button>
                              )}
                              <Button 
                                 onClick={() => deleteUser(u._id)} 
                                 disabled={user._id === u._id} 
                                 variant="ghost" size="icon" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 w-8"
                                 title={user._id === u._id ? "Cannot delete yourself" : "Delete Acccount"}
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
         </>
      )}
    </div>
  );
};
