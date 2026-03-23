import { useState, useEffect, useRef } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import api, { API_BASE_URL } from "../lib/api"
import {
  Send,
  Paperclip,
  Download,
  FileText,
  File,
  StopCircle,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  Trash2,
} from "lucide-react"

export default function Chat() {
  const { conversationId } = useParams()
  const { agents, fetchConversations } = useOutletContext()

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const hasAutoTitledRef = useRef(false)

  // Fetch conversation
  useEffect(() => {
    hasAutoTitledRef.current = false
    fetchConversation()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [conversationId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  // Focus input when ready
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loading])

  async function fetchConversation() {
    setLoading(true)
    try {
      const res = await api.get(`/conversations/${conversationId}`)
      setConversation(res.data)
      setMessages(res.data.messages || [])
      // If conversation already has messages, skip auto-title
      if (res.data.messages && res.data.messages.length > 0) {
        hasAutoTitledRef.current = true
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err)
      toast.error("Impossible de charger la conversation")
    } finally {
      setLoading(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function handleScroll() {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
  }

  // Auto-title: generate title from first user message
  async function autoTitleConversation(userMessage) {
    if (hasAutoTitledRef.current) return
    hasAutoTitledRef.current = true

    const title = userMessage.length > 60
      ? userMessage.substring(0, 57) + "..."
      : userMessage

    try {
      await api.put(`/conversations/${conversationId}`, { title })
      setConversation((prev) => prev ? { ...prev, title } : prev)
      fetchConversations() // Update sidebar
    } catch (err) {
      console.error("Auto-title failed:", err)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!input.trim() || streaming) return

    const userMessage = input.trim()
    setInput("")

    const now = new Date().toISOString()
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: now }])
    setStreaming(true)
    setStreamingText("")

    // Auto-title from first message
    autoTitleConversation(userMessage)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userMessage }),
          signal: controller.signal,
        }
      )

      if (!response.ok) throw new Error("Chat request failed")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamingText(fullText)
      }

      // Add completed assistant message
      const aiNow = new Date().toISOString()
      setMessages((prev) => [...prev, { role: "assistant", content: fullText, timestamp: aiNow }])
      setStreamingText("")
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Streaming error:", err)
        toast.error("Erreur de communication avec le serveur")
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Erreur de communication avec le serveur. Veuillez réessayer.", error: true },
        ])
      }
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
    }
  }

  function handleStopStreaming() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setStreaming(false)
      if (streamingText) {
        setMessages((prev) => [...prev, { role: "assistant", content: streamingText }])
        setStreamingText("")
      }
      toast.info("Génération arrêtée")
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ""

    const ext = file.name.split(".").pop().toLowerCase()
    let endpoint = ""
    if (ext === "pdf") endpoint = "/tools/pdf/extract-text"
    else if (ext === "docx") endpoint = "/tools/docx/extract-text"
    else {
      toast.warning("Seuls les fichiers PDF et DOCX sont acceptés")
      return
    }

    const loadingToast = toast.loading(`Extraction de "${file.name}"...`)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const extractedText = res.data.text
      if (extractedText) {
        setInput(
          (prev) =>
            prev +
            `\n\nContenu extrait de "${file.name}":\n\n${extractedText.substring(0, 3000)}${extractedText.length > 3000 ? "\n\n[... contenu tronqué]" : ""}`
        )
        inputRef.current?.focus()
        toast.success(`"${file.name}" extrait avec succès`, { id: loadingToast })
      }
    } catch (err) {
      console.error("File upload error:", err)
      toast.error("Erreur lors de l'extraction du fichier", { id: loadingToast })
    }
  }

  async function handleExport(format) {
    setShowExport(false)
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${API_BASE_URL}/tools/export/${conversationId}?format=${format}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `conversation.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exporté en .${format}`)
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Erreur lors de l'export")
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copié dans le presse-papiers")
    setTimeout(() => setCopiedId(null), 2000)
  }

  function getAgentInfo() {
    if (!conversation) return null
    return agents.find((a) => a._id === conversation.agent_id)
  }

  const agent = getAgentInfo()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement de la conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
            {agent?.logo_url ? (
              <img src={`http://localhost:8008${agent.logo_url}`} alt="" className="w-6 h-6 rounded" />
            ) : (
              <Bot className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-sm">{conversation?.title}</h2>
            <p className="text-xs text-muted-foreground">
              {agent?.name || "Agent"} · {agent?.model_name || ""}
            </p>
          </div>
        </div>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4" />
          </button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl z-20 py-1 min-w-[160px] animate-fade-in">
                {[
                  { format: "md", label: "Markdown (.md)", icon: FileText },
                  { format: "txt", label: "Texte (.txt)", icon: File },
                  { format: "json", label: "JSON (.json)", icon: FileText },
                ].map(({ format, label, icon: Icon }) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6"
      >
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          {messages.length === 0 && !streaming && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mb-4">
                {agent?.logo_url ? (
                  <img src={`http://localhost:8008${agent.logo_url}`} alt="" className="w-9 h-9 rounded-xl" />
                ) : (
                  <Bot className="w-7 h-7 text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">Chat avec {agent?.name || "Agent"}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {agent?.description || "Posez votre première question pour démarrer la conversation"}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              index={i}
              agent={agent}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          ))}

          {/* Streaming message */}
          {streaming && streamingText && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">En cours de génération...</span>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator when streaming but no text yet */}
          {streaming && !streamingText && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 py-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-6 p-2 rounded-full bg-card border border-border shadow-lg hover:bg-accent transition-all animate-fade-in"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Input area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-4 md:px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
              {/* File upload */}
              <label className="cursor-pointer p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0 self-end">
                <Paperclip className="w-5 h-5" />
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Écrivez votre message..."
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm max-h-40 overflow-y-auto placeholder:text-muted-foreground/50 py-1"
                style={{ minHeight: "24px" }}
                onInput={(e) => {
                  e.target.style.height = "24px"
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
                }}
              />

              {/* Send / Stop button */}
              {streaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0 self-end"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 self-end shadow-md shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/40 text-center mt-2 flex items-center justify-center gap-1">
              Entrée pour envoyer · Shift+Entrée pour un saut de ligne · PDF/DOCX avec <Paperclip className="w-3 h-3 inline" />
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// Format timestamp for hover tooltip
function formatTimestamp(ts) {
  if (!ts) return ""
  const d = new Date(ts)
  return d.toLocaleString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  })
}

// Message bubble component
function MessageBubble({ message, index, agent, copiedId, onCopy }) {
  const isUser = message.role === "user"
  const timeStr = formatTimestamp(message.timestamp || message.created_at)

  return (
    <div className={`flex gap-3 animate-fade-in group/msg ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? "bg-gradient-to-br from-chart-2/20 to-primary/20"
            : "bg-gradient-to-br from-primary/20 to-chart-2/20"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-chart-2" />
        ) : agent?.logo_url ? (
          <img src={`http://localhost:8008${agent.logo_url}`} alt="" className="w-5 h-5 rounded" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block max-w-full text-left ${
            isUser
              ? "bg-primary/10 border border-primary/10 rounded-2xl rounded-tr-md px-4 py-3"
              : ""
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp + actions */}
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? "justify-end" : ""}`}>
          {/* Timestamp — shows on hover */}
          {timeStr && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/0 group-hover/msg:text-muted-foreground/40 transition-colors select-none">
              <Clock className="w-3 h-3" />
              {timeStr}
            </span>
          )}

          {/* Copy button for assistant messages */}
          {!isUser && (
            <button
              onClick={() => onCopy(message.content, index)}
              className="flex items-center gap-1 text-xs text-muted-foreground/0 group-hover/msg:text-muted-foreground/50 hover:!text-muted-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
            >
              {copiedId === index ? (
                <>
                  <Check className="w-3 h-3" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copier
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
