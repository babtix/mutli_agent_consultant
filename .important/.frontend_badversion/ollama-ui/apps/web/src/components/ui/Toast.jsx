import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastContext = createContext(undefined)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] shadow-xl border text-sm max-w-sm",
                t.type === "success" && "bg-[#0d1f14] border-[#22c55e33] text-[#4ade80]",
                t.type === "error" && "bg-[#1f0d0d] border-[#ef444433] text-[#f87171]",
                t.type === "info" && "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-foreground)]"
              )}
            >
              {t.type === "success" && <CheckCircle size={16} />}
              {t.type === "error" && <XCircle size={16} />}
              {t.type === "info" && <AlertCircle size={16} />}
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
