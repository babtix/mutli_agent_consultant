import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Bot, Pencil, Trash2, Cpu, FileText } from "lucide-react"
import { useAgents } from "@/hooks/useAgents"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/Toast"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { AgentCardSkeleton } from "@/components/ui/Skeleton"
import { api } from "@/lib/axiosClient"

const BASE_URL = "http://127.0.0.1:8008"

const defaultForm = {
  name: "",
  description: "",
  model_name: "llama3.2",
  promptFile: null,
  logoFile: null,
}

export function AgentsList() {
  const { agents, loading, refetch } = useAgents()
  const { user } = useAuth()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const isAdmin = user?.is_admin

  const openCreate = () => {
    setEditAgent(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (agent) => {
    setEditAgent(agent)
    setForm({ name: agent.name, description: agent.description, model_name: agent.model_name, promptFile: null, logoFile: null })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.description) {
      toast("Name and description are required", "error")
      return
    }
    if (!editAgent && !form.promptFile) {
      toast("A .md prompt file is required", "error")
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("description", form.description)
      fd.append("model_name", form.model_name)
      if (form.promptFile) fd.append("prompt_file", form.promptFile)
      if (form.logoFile) fd.append("logo_file", form.logoFile)

      if (editAgent) {
        await api.put(`/agents/${editAgent.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
        toast("Agent updated", "success")
      } else {
        await api.post("/agents/", fd, { headers: { "Content-Type": "multipart/form-data" } })
        toast("Agent created", "success")
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      const msg = err?.response?.data?.detail
      toast(msg ?? "Failed to save agent", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/agents/${id}`)
      toast("Agent deleted", "success")
      refetch()
    } catch {
      toast("Failed to delete agent", "error")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Agents</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg shadow-[rgba(99,102,241,0.25)]"
          >
            <Plus size={16} />
            New Agent
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
            <Bot size={28} className="text-[var(--color-subtle)]" />
          </div>
          <p className="text-[var(--color-muted-foreground)] text-sm">No agents yet</p>
          {isAdmin && (
            <button onClick={openCreate} className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
              Create your first agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex flex-col gap-3 p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-subtle)] transition-all duration-200 hover:shadow-lg hover:shadow-[rgba(99,102,241,0.08)]"
            >
              <div className="flex items-center gap-3">
                {agent.logo_url ? (
                  <img
                    src={`${BASE_URL}${agent.logo_url}`}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                    {agent.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{agent.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Cpu size={11} className="text-[var(--color-subtle)]" />
                    <span className="text-xs text-[var(--color-subtle)] font-mono">{agent.model_name}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              <div className="flex items-start gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
                <FileText size={12} className="text-[var(--color-subtle)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--color-subtle)] line-clamp-2 font-mono leading-relaxed">
                  {agent.system_prompt.slice(0, 100)}...
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(agent)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-subtle)] transition-all"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(agent.id)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:border-[var(--color-destructive)] transition-all"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAgent ? "Edit Agent" : "New Agent"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Name" placeholder="My Expert Agent" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Description" placeholder="What does this agent do?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Model Name" placeholder="llama3.2" value={form.model_name} onChange={(e) => setForm((f) => ({ ...f, model_name: e.target.value }))} />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              System Prompt (.md) {editAgent && <span className="normal-case text-[var(--color-subtle)]">— optional to replace</span>}
            </label>
            <input
              type="file"
              accept=".md"
              onChange={(e) => setForm((f) => ({ ...f, promptFile: e.target.files?.[0] ?? null }))}
              className="text-sm text-[var(--color-muted-foreground)] file:mr-3 file:h-8 file:px-3 file:rounded-[var(--radius-sm)] file:border file:border-[var(--color-border)] file:bg-[var(--color-surface-2)] file:text-xs file:text-[var(--color-foreground)] file:cursor-pointer hover:file:bg-[var(--color-surface-3)] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Logo Image <span className="normal-case text-[var(--color-subtle)]">— optional</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((f) => ({ ...f, logoFile: e.target.files?.[0] ?? null }))}
              className="text-sm text-[var(--color-muted-foreground)] file:mr-3 file:h-8 file:px-3 file:rounded-[var(--radius-sm)] file:border file:border-[var(--color-border)] file:bg-[var(--color-surface-2)] file:text-xs file:text-[var(--color-foreground)] file:cursor-pointer hover:file:bg-[var(--color-surface-3)] transition-all"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-3)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : editAgent ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Agent">
        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          This will permanently delete the agent and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteId && handleDelete(deleteId)}
            className="flex-1 h-9 rounded-[var(--radius-md)] bg-[var(--color-destructive)] text-white text-sm font-medium hover:bg-[var(--color-destructive-hover)] transition-all"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
