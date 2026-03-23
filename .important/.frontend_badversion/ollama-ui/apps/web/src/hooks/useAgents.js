import { useState, useEffect } from "react"
import { api } from "@/lib/axiosClient"

export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await api.get("/agents/")
      setAgents(res.data.map((a) => ({ ...a, id: a._id ?? a.id })))
      setError(null)
    } catch {
      setError("Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return { agents, loading, error, refetch: fetchAgents }
}
