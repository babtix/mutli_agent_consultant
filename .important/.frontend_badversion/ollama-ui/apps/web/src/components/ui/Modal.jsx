import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Modal({ open, onClose, title, children, className }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg",
              "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl",
              "p-6",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
