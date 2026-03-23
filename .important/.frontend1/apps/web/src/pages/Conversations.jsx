import React, { useState, useEffect, useRef } from 'react';
import { axiosClient } from '../lib/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { MessageSquare, StopCircle, Send, Plus, Paperclip, FileText, Bot, User as UserIcon, Loader2, ArrowLeft, OctagonX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Streaming Controller
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8008';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Load Initial Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [convosRes, agentsRes] = await Promise.all([
          axiosClient.get('/conversations/'),
          axiosClient.get('/agents/')
        ]);
        setConversations(convosRes.data);
        setAgents(agentsRes.data);
      } catch (e) {
        toast.error('Failed to load chat history');
      }
    };
    initData();
  }, []);

  const loadConversation = async (id) => {
    try {
      if (isGenerating && abortControllerRef.current) {
         abortControllerRef.current.abort();
      }
      setIsGenerating(false);
      const res = await axiosClient.get(`/conversations/${id}`);
      setCurrentConversation(res.data);
      setMessages(res.data.messages || []);
      
      // Auto-hide sidebar on mobile when selecting a chat
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (e) {
      toast.error('Failed to load conversation');
    }
  };

  const createConversation = async (agentId, agentName) => {
    try {
      const title = `Chat with ${agentName}`;
      const res = await axiosClient.post('/conversations/', {
        title,
        agent_id: agentId
      });
      setConversations([res.data, ...conversations]);
      setNewChatDialogOpen(false);
      loadConversation(res.data._id);
    } catch (e) {
      toast.error('Failed to start chat');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // We specifically support PDF and DOCX 
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isDOCX = file.name.toLowerCase().endsWith('.docx');

    if (!isPDF && !isDOCX) {
      toast.error('Only .pdf and .docx files are currently supported.');
      return;
    }

    const toastId = toast.loading(`Extracting text from ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = isPDF ? '/tools/pdf/extract-text' : '/tools/docx/extract-text';
      
      const res = await axiosClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extractedText = res.data.text;
      const injectionMessage = `[File Uploaded: ${file.name}]\n\n\`\`\`text\n${extractedText.substring(0, 50000)}...\n\`\`\`\n\nPlease analyze the provided document text above.`;
      
      setInputMessage(injectionMessage);
      toast.success('Document read successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to parse document.', { id: toastId });
    }
    
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation || isGenerating) return;

    const userMessageContent = inputMessage;
    setInputMessage('');
    
    // Optimistic UI Update
    const userMessage = { role: 'user', content: userMessageContent, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();
    let assistantMessageContent = '';

    // Add empty assistant response to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/conversations/${currentConversation._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessageContent }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;
        
        // Update the last message
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantMessageContent;
          return newMessages;
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast('Generation stopped manually.', { icon: <OctagonX className="w-4 h-4" /> });
      } else {
        toast.error('Failed to communicate with AI');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] relative overflow-hidden bg-black/50 border border-white/10 rounded-xl group/chatlayout">
      
      {/* Thread Sidebar Menu */}
      <div className={`absolute md:relative z-20 w-72 h-full bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" /> Threads
            </h3>
        </div>

        <div className="p-4">
          <Button 
            onClick={() => setNewChatDialogOpen(true)}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2 font-medium"
          >
            <Plus className="h-4 w-4" /> New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => loadConversation(conv._id)}
              className={`w-full text-left p-3 rounded-lg transition-all line-clamp-2 text-sm ${
                currentConversation?._id === conv._id 
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className="font-medium text-white mb-1 truncate">{conv.title}</div>
              <div className="text-xs opacity-60">
                {new Date(conv.updated_at).toLocaleDateString()}
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
              <div className="text-center p-4 text-slate-500 text-sm mt-4">
                  No active threads. Start a new conversation to deploy an agent.
              </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col w-full relative h-full bg-black/40">
        
        {/* Mobile Header logic */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-black/50">
            <Button variant="ghost" size="icon" className="text-white bg-white/5 mr-3" onClick={() => setSidebarOpen(true)}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-white font-medium truncate">{currentConversation?.title || 'No Chat Selected'}</h2>
        </div>

        {currentConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50 select-none">
                  <Bot className="h-16 w-16 mb-4 text-slate-400" />
                  <p className="text-slate-400 text-lg">Send a message to begin the simulation.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <Bot className="h-5 w-5 text-purple-400" />
                      </div>
                    )}

                    <div className={`px-5 py-4 rounded-2xl max-w-[85%] sm:max-w-[75%] ${
                      msg.role === 'assistant' 
                        ? 'bg-white/5 border border-white/10 text-slate-300' 
                        : 'bg-indigo-600 text-white rounded-br-sm shadow-xl shadow-indigo-500/20'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-th:border-white/20 prose-td:border-white/20 max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <UserIcon className="h-5 w-5 text-indigo-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isGenerating && (
                 <div className="flex max-w-4xl mx-auto gap-4 mt-2 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 animate-pulse">
                        <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                    </div>
                    <div className="px-4 py-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono rounded-lg flex items-center">
                        Processing local inference layer...
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Area */}
            <div className="p-4 bg-black/60 backdrop-blur-md border-t border-white/10">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-2 relative">
                
                {/* Hidden File Input */}
                <input 
                   type="file" 
                   accept=".pdf,.docx" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                   className="hidden" 
                />

                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Read PDF / DOCX to Context"
                    className="mb-1 shrink-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                    <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="Message your agent... (Shift+Enter for newline)"
                        className="min-h-[60px] max-h-[200px] w-full bg-white/5 border-white/10 focus-visible:ring-purple-500/50 resize-none py-3 px-4 rounded-xl text-white placeholder:text-slate-500"
                    />
                </div>

                {isGenerating ? (
                  <Button 
                    type="button" 
                    onClick={stopGeneration} 
                    className="mb-1 shrink-0 bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 rounded-xl px-4"
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={!inputMessage.trim()} 
                    className="mb-1 shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                )}
              </form>
              <div className="max-w-4xl mx-auto text-center mt-2">
                 <p className="text-[10px] text-slate-600 uppercase tracking-widest">Responses are generated by locally orchestrated Ollama models</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
            <MessageSquare className="h-24 w-24 mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-300">No Target Specified</h2>
            <p className="text-slate-400 text-lg">Select a conversation or create a new thread to begin.</p>
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="sm:max-w-md bg-neutral-950 border-white/10 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select which tuned AI Agent persona you want to engage with for this thread.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {agents.length === 0 ? (
              <p className="text-center text-slate-500 italic py-4">No agents found. Create an agent first.</p>
            ) : (
              agents.map(agent => (
                <button
                  key={agent._id}
                  onClick={() => createConversation(agent._id, agent.name)}
                  className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">{agent.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{agent.description}</p>
                  </div>
                  <Bot className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
