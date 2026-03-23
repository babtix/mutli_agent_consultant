import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, Bot, User } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors opacity-0 group-hover:opacity-100"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

export function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white",
          isUser
            ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"
            : "bg-[var(--color-surface-3)] border border-[var(--color-border)]"
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} className="text-[var(--color-primary)]" />}
      </div>

      <div className={cn("flex flex-col gap-1 max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-[var(--color-primary)] text-white rounded-tr-[4px]"
              : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-tl-[4px]"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  const codeStr = String(children).replace(/\n$/, "")
                  if (match) {
                    return (
                      <div className="relative group my-2 rounded-[var(--radius-md)] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-surface-3)] border-b border-[var(--color-border)]">
                          <span className="text-xs text-[var(--color-muted-foreground)] font-mono">{match[1]}</span>
                        </div>
                        <CopyButton text={codeStr} />
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0, background: "#0d0d14", fontSize: "12px" }}
                        >
                          {codeStr}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] font-mono text-xs text-[var(--color-primary-hover)]" {...props}>
                      {children}
                    </code>
                  )
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-[var(--color-primary)] pl-3 my-2 text-[var(--color-muted-foreground)] italic">
                      {children}
                    </blockquote>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && !isUser && (
            <span className="inline-block w-1.5 h-4 bg-[var(--color-primary)] ml-0.5 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
