import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Send, Square, Trash2, Pencil, MessageSquare, Bot, Upload, X, ChevronDown,
} from "lucide-react"
import { useAgents } from "@/hooks/useAgents"
import { useChatStream } from "@/hooks/useChatStream"
import { useToast } from "@/components/ui/Toast"
import { ChatBubble } from "@/components/chat/ChatBubble"
import { ConversationSkeleton } from "@/components/ui/Skeleton"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { api } from "@/lib/axiosClient"

const BASE_URL = "http://127.0.0.1:8008"

export function ChatView() {
  const { agents } = useAgents()
  const { toast } = useToast()

  const [conversations, setConversations] = useState([])
  const [convsLoading, setConvsLoading] = useState(true)
  const [activeConvId, setActiveConvId] = useState(null)
  const [newConvModal, setNewConvModal] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [convTitle, setConvTitle] = useState("")
  const [renameModal, setRenameModal] = useState(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [input, setInput] = useState("")
  const [uploadFile, setUploadFile] = useState(null)
  const [agentDropdown, setAgentDropdown] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const { messages, streaming, sendMessage, stopStream, setInitialMessages } = useChatStream(activeConvId)

  const fetchConversations = useCallback(async () => {
    setConvsLoading(true)
    try {
      const res = await api.get("/conversations/")
      setConversations(res.data.map((c) => ({ ...c, id: c._id ?? c.id })))
    } catch {
      toast("Failed to load conversations", "error")
    } finally {
      setConvsLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  useEffect(() => {
    if (!activeConvId) return
    api.get(`/conversations/${activeConvId}`)
      .then((res) => setInitialMessages(res.data.messages ?? []))
      .catch(() => {})
  }, [activeConvId, setInitialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const activeConv = conversations.find((c) => c.id === activeConvId)
  const activeAgent = agents.find((a) => a.id === activeConv?.agent_id)

  const createConversation = async () => {
    if (!selectedAgentId || !convTitle.trim()) {
      toast("Select an agent and enter a title", "error")
      return
    }
    try {
      const res = await api.post("/conversations/", { title: convTitle, agent_id: selectedAgentId })
      const newConv = { ...res.data, id: res.data._id ?? res.data.id }
      setConversations((prev) => [newConv, ...prev])
      setActiveConvId(newConv.id)
      setNewConvModal(false)
      setConvTitle("")
      setSelectedAgentId("")
    } catch {
      toast("Failed to create conversation", "error")
    }
  }

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/conversations/${id}`)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConvId === id) setActiveConvId(null)
      toast("Conversation deleted", "success")
    } catch {
      toast("Failed to delete", "error")
    }
  }

  const renameConversation = async () => {
    if (!renameModal || !renameTitle.trim()) return
    try {
      await api.put(`/conversations/${renameModal.id}`, { title: renameTitle })
      setConversations((prev) => prev.map((c) => c.id === renameModal.id ? { ...c, title: renameTitle } : c))
      setRenameModal(null)
      toast("Renamed", "success")
    } catch {
      toast("Failed to rename", "error")
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !uploadFile) return
    if (!activeConvId) {
      toast("Select or create a conversation first", "error")
      return
    }

    let messageText = input.trim()

    if (uploadFile) {
      const fd = new FormData()
      fd.append("file", uploadFile)
      const endpoint = uploadFile.name.endsWith(".pdf") ? "/pdf-reader/upload" : "/docx-reader/upload"
      try {
        const res = await api.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } })
        const extracted = res.data?.content ?? res.data?.text ?? ""
        messageText = `${messageText}\n\n[File: ${uploadFile.name}]\n${extracted}`.trim()
      } catch {
        toast("File upload failed — sending text only", "error")
      }
      setUploadFile(null)
    }

    setInput("")
    await sendMessage(messageText)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversations sidebar */}
      <div className="w-64 shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)] shrink-0">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Conversations</span>
          <button
            onClick={() => setNewConvModal(true)}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {convsLoading ? (
            <ConversationSkeleton />
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <MessageSquare size={20} className="text-[var(--color-subtle)] mb-2" />
              <p className="text-xs text-[var(--color-subtle)]">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer transition-all duration-150 mb-0.5 ${
                  activeConvId === conv.id
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]"
                }`}
              >
                <MessageSquare size={13} className="shrink-0" />
                <span className="flex-1 text-xs truncate">{conv.title}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenameModal(conv); setRenameTitle(conv.title) }}
                    className="p-1 rounded hover:text-[var(--color-foreground)]"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                    className="p-1 rounded hover:text-[var(--color-destructive)]"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
          {activeAgent ? (
            <>
              {activeAgent.logo_url ? (
                <img src={`${BASE_URL}${activeAgent.logo_url}`} alt={activeAgent.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold">
                  {activeAgent.name[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">{activeConv?.title}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{activeAgent.name} · {activeAgent.model_name}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">Select a conversation to start chatting</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {!activeConvId ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <Bot size={28} className="text-[var(--color-subtle)]" />
              </div>
              <p className="text-[var(--color-muted-foreground)] text-sm">Pick a conversation or create a new one</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-[var(--color-muted-foreground)] text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-4 shrink-0">
          {uploadFile && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
              <Upload size={12} />
              <span className="flex-1 truncate">{uploadFile.name}</span>
              <button onClick={() => setUploadFile(null)} className="hover:text-[var(--color-destructive)] transition-colors">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 p-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-primary)] transition-colors">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-[var(--radius-md)] text-[var(--color-subtle)] hover:text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-2)] transition-all shrink-0"
              title="Upload PDF or DOCX"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={activeConvId ? "Message... (Enter to send, Shift+Enter for newline)" : "Select a conversation first"}
              disabled={!activeConvId}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] focus:outline-none disabled:opacity-40 max-h-40 leading-relaxed"
              style={{ height: "auto" }}
            />
            {streaming ? (
              <button
                onClick={stopStream}
                className="p-2 rounded-[var(--radius-md)] bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)] transition-all shrink-0"
                title="Stop generation"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!activeConvId || (!input.trim() && !uploadFile)}
                className="p-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal open={newConvModal} onClose={() => setNewConvModal(false)} title="New Conversation">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g. Legal Analysis Q1"
            value={convTitle}
            onChange={(e) => setConvTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Agent</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAgentDropdown((d) => !d)}
                className="w-full h-10 flex items-center justify-between px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-foreground)] hover:border-[var(--color-subtle)] transition-all"
              >
                <span className={selectedAgentId ? "text-[var(--color-foreground)]" : "text-[var(--color-subtle)]"}>
                  {agents.find((a) => a.id === selectedAgentId)?.name ?? "Select an agent"}
                </span>
                <ChevronDown size={14} className={`text-[var(--color-subtle)] transition-transform ${agentDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {agentDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1 z-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden"
                  >
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => { setSelectedAgentId(agent.id); setAgentDropdown(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {agent.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{agent.name}</p>
                          <p className="text-xs text-[var(--color-subtle)]">{agent.model_name}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setNewConvModal(false)}
              className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={createConversation}
              className="flex-1 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!renameModal} onClose={() => setRenameModal(null)} title="Rename Conversation">
        <div className="flex flex-col gap-4">
          <Input label="New Title" value={renameTitle} onChange={(e) => setRenameTitle(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={() => setRenameModal(null)} className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all">
              Cancel
            </button>
            <button onClick={renameConversation} className="flex-1 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all">
              Rename
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
