import React, { useState, useEffect, useRef } from 'react';
import { axiosClient } from '../lib/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Plus, Bot, BotMessageSquare, MoreVertical, Trash, Image as ImageIcon } from 'lucide-react';

export const AgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state aligned with python backend settings
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [modelName, setModelName] = useState('deepseek-v3.1:671b-cloud'); // Matches setting.DEFAULT_MODEL_NAME
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8008';

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/agents/');
      setAgents(res.data);
    } catch (err) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      // Backend (agents.py) requires Form Data with a prompt_file .md upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('model_name', modelName);
      
      // Convert the text-area prompt into a File blob to satisfy backend requirements
      const blob = new Blob([systemPrompt], { type: 'text/markdown' });
      formData.append('prompt_file', new File([blob], 'prompt.md', { type: 'text/markdown' }));

      if (logoFile) {
        formData.append('logo_file', logoFile);
      }

      await axiosClient.post('/agents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      toast.success('Agent created successfully');
      setDialogOpen(false);
      
      // Reset form
      setName('');
      setDescription('');
      setSystemPrompt('You are a helpful AI assistant.');
      setLogoFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
      
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create agent');
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
        await axiosClient.delete(`/agents/${id}`);
        toast.success("Agent successfully decommissioned");
        setAgents((prev) => prev.filter(agent => agent._id !== id));
    } catch (err) {
        toast.error("Failed to delete agent");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Agent Roster</h1>
          <p className="text-slate-400">View, edit, and orchestrate your local Ollama AI agents.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 gap-2 font-medium">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-neutral-950 border-white/10 text-white shadow-2xl max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Custom Agent</DialogTitle>
              <DialogDescription className="text-slate-400">
                Design a new AI persona powered by Ollama. Specify its behavior via the system prompt.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-5 py-4">
              
              <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {logoFile ? (
                          <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="h-full w-full object-cover" />
                      ) : (
                          <ImageIcon className="h-6 w-6 text-slate-500" />
                      )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="logo" className="text-slate-300">Avatar / Logo (Optional)</Label>
                    <Input 
                        id="logo" 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={(e) => setLogoFile(e.target.files[0])} 
                        className="bg-black/50 border-white/10 text-slate-300 file:text-indigo-400 file:bg-white/5 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md cursor-pointer"
                    />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Agent Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Code Reviewer Bot" 
                  className="bg-black/50 border-white/10 placeholder:text-slate-600 text-white" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Input 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Short summary of its purpose..." 
                  className="bg-black/50 border-white/10 placeholder:text-slate-600 text-white" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-slate-300">Ollama Model</Label>
                <Input 
                  id="model" 
                  value={modelName} 
                  onChange={(e) => setModelName(e.target.value)} 
                  placeholder="deepseek-v3.1:671b-cloud, mistral, llama3, etc." 
                  className="bg-black/50 border-white/10 placeholder:text-slate-600 text-white font-mono" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemPrompt" className="text-slate-300">System Prompt (Markdown Mode)</Label>
                <Textarea 
                  id="systemPrompt" 
                  value={systemPrompt} 
                  onChange={(e) => setSystemPrompt(e.target.value)} 
                  placeholder="You are an expert at..." 
                  className="bg-black/50 border-white/10 placeholder:text-slate-600 text-white min-h-[120px] font-mono text-sm leading-relaxed" 
                  required 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full text-white">Save Agent Persona</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletal Loader
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse h-48">
              <CardContent className="h-full flex flex-col justify-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-full" />
                <div className="h-6 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
              </CardContent>
            </Card>
          ))
        ) : agents.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <BotMessageSquare className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">You haven't generated any AI agents yet. Click "Create Agent" to setup your first specialized local model.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <Card key={agent._id} className="bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group overflow-hidden relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <Button onClick={() => handleDeleteAgent(agent._id)} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                    <Trash className="h-4 w-4" />
                 </Button>
              </div>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-indigo-500/30 mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                  {agent.logo_url ? (
                      <img src={`${baseUrl}${agent.logo_url}`} className="h-full w-full object-cover" alt="Agent logo" />
                  ) : (
                      <Bot className="h-6 w-6 text-indigo-400" />
                  )}
                </div>
                <CardTitle className="text-xl text-white tracking-tight pr-12">{agent.name}</CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2" title={agent.description}>
                  {agent.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {agent.model_name || 'deepseek-v3.1'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
