import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/lib/axiosClient"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("access_token"))
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me")
      setUser({ ...res.data, id: res.data._id ?? res.data.id })
    } catch {
      setUser(null)
      setToken(null)
      localStorage.removeItem("access_token")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token, fetchMe])

  const login = async (username, password) => {
    const form = new URLSearchParams()
    form.append("username", username)
    form.append("password", password)
    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    const { access_token } = res.data
    localStorage.setItem("access_token", access_token)
    setToken(access_token)
    const meRes = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    setUser({ ...meRes.data, id: meRes.data._id ?? meRes.data.id })
  }

  const register = async (email, username, password, is_admin = false) => {
    await api.post("/auth/register", { email, username, password, is_admin })
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
