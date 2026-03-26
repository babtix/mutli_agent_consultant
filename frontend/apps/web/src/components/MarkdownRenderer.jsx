import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || "")
  const language = match ? match[1] : null
  const codeString = String(children).replace(/\n$/, "")

  if (!match) {
    // Inline code
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono text-primary"
        {...props}
      >
        {children}
      </code>
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group/code rounded-xl overflow-hidden my-3 border border-border/50">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-white/5">
        <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
        >
          {copied ? (
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
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem 1.25rem",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          background: "#282a36",
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
}

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono text-primary"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <CodeBlock className={className} {...props}>{children}</CodeBlock>
          },
          // Better table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-border/50">
                <table className="w-full text-sm">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b border-border/50">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 border-b border-border/30">
                {children}
              </td>
            )
          },
          // Better blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-primary/40 pl-4 my-3 text-muted-foreground italic">
                {children}
              </blockquote>
            )
          },
          // Better links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
