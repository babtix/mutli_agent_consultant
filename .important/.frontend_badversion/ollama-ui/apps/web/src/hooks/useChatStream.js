import { useState, useRef } from "react"

const BASE_URL = "http://127.0.0.1:8008"

export function useChatStream(conversationId) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef(null)

  const setInitialMessages = (msgs) => {
    setMessages(msgs)
  }

  const sendMessage = async (content) => {
    if (!conversationId || streaming) return

    const userMsg = { role: "user", content, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])

    const assistantMsg = { role: "assistant", content: "", timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, assistantMsg])
    setStreaming(true)

    abortRef.current = new AbortController()

    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${BASE_URL}/conversations/${conversationId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No reader")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
          }
          return updated
        })
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === "assistant" && !last.content) {
            updated[updated.length - 1] = { ...last, content: "Error generating response.", error: true }
          }
          return updated
        })
      }
    } finally {
      setStreaming(false)
    }
  }

  const stopStream = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  return { messages, streaming, sendMessage, stopStream, setInitialMessages }
}
