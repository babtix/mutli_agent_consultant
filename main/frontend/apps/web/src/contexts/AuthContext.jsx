import { createContext, useContext, useState, useEffect } from "react"
import api from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("access_token"))
  const [loading, setLoading] = useState(true)

  // On mount or token change, fetch current user
  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    try {
      const res = await api.get("/auth/me")
      setUser(res.data)
    } catch {
      // Token invalid/expired
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(username, password) {
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)

    const res = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    
    const { access_token } = res.data
    localStorage.setItem("access_token", access_token)
    setToken(access_token)
    
    // Fetch user after login
    const userRes = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    setUser(userRes.data)
    localStorage.setItem("user", JSON.stringify(userRes.data))
    
    return userRes.data
  }

  async function register(email, username, password) {
    const res = await api.post("/auth/register", { email, username, password })
    return res.data
  }

  function logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.is_admin || false,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
