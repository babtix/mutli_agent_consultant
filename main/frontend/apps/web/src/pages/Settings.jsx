import { useState, useEffect, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import api from "../lib/api"
import { toast } from "sonner"
import ConfirmDialog from "../components/ConfirmDialog"
import {
  Settings as SettingsIcon,
  Users,
  Bot,
  Save,
  Trash2,
  Shield,
  Plus,
  Upload,
  Edit3,
  X,
  Check,
  AlertCircle,
  Cloud,
  Server,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react"

const TABS = [
  { id: "ollama", label: "Paramètres Ollama", icon: SettingsIcon },
  { id: "agents", label: "Agents IA", icon: Bot },
  { id: "users", label: "Utilisateurs", icon: Users },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState("ollama")

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-1">Administration</h1>
          <p className="text-muted-foreground text-sm">
            Gérez les paramètres, agents et utilisateurs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-8 animate-fade-in">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-1 justify-center transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === "ollama" && <OllamaSettings />}
          {activeTab === "agents" && <AgentSettings />}
          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </div>
  )
}

// ─── Model Selector (shared component) ─────────────────────────────
function ModelSelector({ value, onChange, className = "" }) {
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelFilter, setModelFilter] = useState("all") // "all" | "cloud" | "local"
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modelError, setModelError] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchModels()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchModels() {
    setLoadingModels(true)
    setModelError(null)
    try {
      const res = await api.get("/settings/models")
      setModels(res.data.models || [])
    } catch (err) {
      console.error("Failed to fetch models:", err)
      setModelError(err.response?.data?.detail || "Impossible de charger les modèles")
    } finally {
      setLoadingModels(false)
    }
  }

  const filtered = models.filter((m) => {
    if (modelFilter === "cloud") return m.is_cloud
    if (modelFilter === "local") return !m.is_cloud
    return true
  })

  const selectedModel = models.find((m) => m.name === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selector button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all hover:border-primary/30 text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {value ? (
            <>
              {selectedModel?.is_cloud ? (
                <Cloud className="w-4 h-4 text-chart-2 shrink-0" />
              ) : (
                <Server className="w-4 h-4 text-primary shrink-0" />
              )}
              <span className="truncate">{value}</span>
              {selectedModel && (
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  ({selectedModel.size_gb} GB)
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground/50">Sélectionner un modèle...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-2xl animate-fade-in overflow-hidden">
          {/* Filter tabs + refresh */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-1">
              {[
                { id: "all", label: "Tous", icon: Filter },
                { id: "cloud", label: "Cloud", icon: Cloud },
                { id: "local", label: "Local", icon: Server },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setModelFilter(f.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    modelFilter === f.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <f.icon className="w-3 h-3" />
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={fetchModels}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingModels ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Model list */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {loadingModels ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : modelError ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-destructive">{modelError}</p>
                <button
                  type="button"
                  onClick={fetchModels}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {models.length === 0
                  ? "Aucun modèle trouvé sur le serveur Ollama"
                  : `Aucun modèle ${modelFilter === "cloud" ? "cloud" : "local"} trouvé`}
              </div>
            ) : (
              filtered.map((model) => (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => {
                    onChange(model.name)
                    setDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                    value === model.name ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  {model.is_cloud ? (
                    <Cloud className="w-4 h-4 text-chart-2 shrink-0" />
                  ) : (
                    <Server className="w-4 h-4 text-primary/60 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{model.name}</span>
                      {model.is_cloud && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-chart-2/15 text-chart-2 font-medium shrink-0">
                          CLOUD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {model.size_gb} GB
                    </p>
                  </div>
                  {value === model.name && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Summary */}
          {models.length > 0 && (
            <div className="px-3 py-2 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground/60">
              {models.filter((m) => m.is_cloud).length} cloud · {models.filter((m) => !m.is_cloud).length} local · {models.length} total
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Ollama Settings ────────────────────────────────────────────────
function OllamaSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await api.get("/settings/")
      setSettings(res.data)
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await api.put("/settings/", settings)
      setMessage({ type: "success", text: "Paramètres enregistrés avec succès" })
    } catch (err) {
      setMessage({ type: "error", text: "Échec de la sauvegarde" })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const fields = [
    { key: "OLLAMA_URL", label: "URL d'Ollama", type: "text" },
    { key: "OLLAMA_TIMEOUT", label: "Timeout (secondes)", type: "number", step: "1" },
    { key: "MODEL_TEMPERATURE", label: "Température", type: "number", step: "0.1", min: 0, max: 2 },
    { key: "MODEL_TOP_P", label: "Top P", type: "number", step: "0.05", min: 0, max: 1 },
    { key: "MODEL_TOP_K", label: "Top K", type: "number", step: "1", min: 1 },
    { key: "MODEL_REPEAT_PENALTY", label: "Repeat Penalty", type: "number", step: "0.1", min: 0 },
    { key: "MODEL_NUM_PREDICT", label: "Num Predict (max tokens)", type: "number", step: "1", min: 1 },
    { key: "MODEL_NUM_CTX", label: "Num Context (taille contexte)", type: "number", step: "1", min: 512 },
  ]

  return (
    <div className="space-y-6">
      {/* Default Model Selector — full width, prominent */}
      <div className="space-y-2 bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold">Modèle par défaut</label>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Le modèle Ollama utilisé par défaut pour les nouveaux agents
        </p>
        <ModelSelector
          value={settings.DEFAULT_MODEL_NAME ?? ""}
          onChange={(name) =>
            setSettings((prev) => ({ ...prev, DEFAULT_MODEL_NAME: name }))
          }
        />
      </div>

      {/* Other settings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label, type, ...props }) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <input
              type={type}
              value={settings[key] ?? ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                }))
              }
              {...props}
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in ${
            message.type === "success"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <Check className="w-4 h-4" />
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Enregistrer
      </button>
    </div>
  )
}

// ─── Agent Settings ─────────────────────────────────────────────────
function AgentSettings() {
  const { agents, fetchAgents } = useOutletContext()
  const [showForm, setShowForm] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  async function handleDeleteAgent() {
    const agentId = deleteConfirm.id
    setDeleteConfirm({ open: false, id: null })
    try {
      await api.delete(`/agents/${agentId}`)
      await fetchAgents()
      toast.success("Agent supprimé")
    } catch (err) {
      console.error("Failed to delete agent:", err)
      toast.error("Impossible de supprimer l'agent")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{agents.length} agent(s) configuré(s)</p>
        <button
          onClick={() => { setEditAgent(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Nouvel agent
        </button>
      </div>

      {/* Agent list */}
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/15 flex items-center justify-center shrink-0">
              {agent.logo_url ? (
                <img src={`http://localhost:8008${agent.logo_url}`} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <Bot className="w-6 h-6 text-primary/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{agent.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">{agent.model_name}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditAgent(agent); setShowForm(true); }}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ open: true, id: agent._id })}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent form modal */}
      {showForm && (
        <AgentForm
          agent={editAgent}
          onClose={() => setShowForm(false)}
          onSaved={async () => { await fetchAgents(); setShowForm(false); }}
        />
      )}
      {/* Agent delete confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Supprimer l'agent"
        message="Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteAgent}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        destructive
      />
    </div>
  )
}

function AgentForm({ agent, onClose, onSaved }) {
  const [name, setName] = useState(agent?.name || "")
  const [description, setDescription] = useState(agent?.description || "")
  const [modelName, setModelName] = useState(agent?.model_name || "")
  const [promptFile, setPromptFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("model_name", modelName)

    if (promptFile) {
      formData.append("prompt_file", promptFile)
    } else if (!agent) {
      setError("Un fichier prompt (.md) est requis")
      setSaving(false)
      return
    }
    if (logoFile) {
      formData.append("logo_file", logoFile)
    }

    try {
      if (agent) {
        await api.put(`/agents/${agent._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await api.post("/agents/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }
      await onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">
            {agent ? "Modifier l'agent" : "Nouvel agent"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Ex: Consultant Juridique"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              placeholder="Description courte de l'agent..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle Ollama</label>
            <ModelSelector
              value={modelName}
              onChange={(name) => setModelName(name)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fichier Prompt (.md){" "}
              {agent && <span className="text-muted-foreground font-normal">(optionnel si modification)</span>}
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border text-sm cursor-pointer hover:border-primary/30 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {promptFile ? promptFile.name : "Sélectionner un fichier .md"}
              </span>
              <input
                type="file"
                accept=".md"
                onChange={(e) => setPromptFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo (optionnel)</label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border text-sm cursor-pointer hover:border-primary/30 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {logoFile ? logoFile.name : "Sélectionner une image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {agent ? "Mettre à jour" : "Créer l'agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── User Management ────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await api.get("/auth/users")
      setUsers(res.data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePromote(userId) {
    try {
      await api.put(`/auth/users/${userId}/promote`)
      await fetchUsers()
      toast.success("Utilisateur promu administrateur")
    } catch (err) {
      console.error("Failed to promote user:", err)
      toast.error(err.response?.data?.detail || "Erreur")
    }
  }

  const [deleteUserConfirm, setDeleteUserConfirm] = useState({ open: false, id: null })

  async function handleDelete() {
    const userId = deleteUserConfirm.id
    setDeleteUserConfirm({ open: false, id: null })
    try {
      await api.delete(`/auth/users/${userId}`)
      await fetchUsers()
      toast.success("Utilisateur supprimé")
    } catch (err) {
      console.error("Failed to delete user:", err)
      toast.error(err.response?.data?.detail || "Erreur")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{users.length} utilisateur(s) enregistré(s)</p>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Utilisateur</span>
          <span>Email</span>
          <span>Rôle</span>
          <span>Actions</span>
        </div>

        {users.map((u) => (
          <div
            key={u._id}
            className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 border-t border-border/30 items-center hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center text-xs font-semibold shrink-0">
                {u.username[0].toUpperCase()}
              </div>
              <span className="text-sm truncate">{u.username}</span>
            </div>
            <span className="text-sm text-muted-foreground truncate">{u.email}</span>
            <div>
              {u.is_admin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                  User
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!u.is_admin && (
                <button
                  onClick={() => handlePromote(u._id)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  title="Promouvoir admin"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setDeleteUserConfirm({ open: true, id: u._id })}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
      {/* User delete confirm */}
      <ConfirmDialog
        open={deleteUserConfirm.open}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteUserConfirm({ open: false, id: null })}
        destructive
      />
    </div>
  )
}
