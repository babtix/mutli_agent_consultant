# 🚀 Multi-IA Consultant — Feature Roadmap

> Based on full codebase analysis (FastAPI backend + React/Vite/Turborepo frontend)

---

## 🔴 Priority 1 — Fix & Complete Core UX

These are missing or broken pieces that directly affect usability.

| Feature | Why | Where |
|---|---|---|
| **File upload UI in Chat** | Backend has `pdf_reader_tool` & `docx_reader_tool` but no frontend button to trigger them | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) |
| **Agent selector in Chat** | Conversations are linked to agents but users can't switch agents mid-session | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) or [Dashboard.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Dashboard.jsx) |
| **Streaming indicator** | No visible token-by-token streaming animation while AI is typing | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) |
| **Message copy button** | Standard in any chat UI — let users copy AI responses | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) |
| **Markdown rendering** | AI responses often contain code blocks, lists, bold text — raw text looks broken | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) — use `react-markdown` + `highlight.js` |
| **Empty Dashboard state** | If there are no agents, dashboard shows nothing useful | [Dashboard.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Dashboard.jsx) |

---

## 🟠 Priority 2 — Agent Management (Frontend missing features)

Backend supports full CRUD for agents but the frontend Settings page may be incomplete.

| Feature | Why | Where |
|---|---|---|
| **Agent card display** | Show all existing agents as cards with logo, name, description, model | [Settings.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Settings.jsx) / new `AgentCard.jsx` |
| **Edit agent form** | PUT `/agents/{id}` exists in backend but may not be wired in UI | [Settings.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Settings.jsx) |
| **Provider badge** | Show whether agent uses `ollama` or `openrouter` | Agent cards |
| **Agent `provider` field** | Model in DB doesn't store `provider` — it's missing from `agent_dict` in [agents.py](file:///d:/xii/react_ollama_project_ali/backend/routers/agents.py) line 50-56 | [backend/routers/agents.py](file:///d:/xii/react_ollama_project_ali/backend/routers/agents.py) |
| **Prompt preview** | Let admin see the system prompt content before saving | [Settings.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Settings.jsx) |

---

## 🟡 Priority 3 — New Pages & Sections

These add significant value with moderate effort.

| Feature | Why | Where |
|---|---|---|
| **Agent Detail / Public Profile page** | Users can see what an agent does before chatting | New `pages/AgentProfile.jsx` |
| **Search conversations** | Users accumulate many chats — need full-text search | [Conversations.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Conversations.jsx) + new backend endpoint |
| **Pinned / Favourite conversations** | Let users star important chats | DB model update + UI |
| **User management page** | Admin can see, promote, or ban users | New `pages/UserManagement.jsx` + `backend/routers/users.py` |
| **Usage stats dashboard** | Show # messages sent, tokens used, most-used agents | New `pages/Stats.jsx` + analytics endpoints |

---

## 🟢 Priority 4 — Backend Capabilities

| Feature | Why | Where |
|---|---|---|
| **Token counting / usage tracking** | Store token usage per message for billing/monitoring | [conversation_service.py](file:///d:/xii/react_ollama_project_ali/backend/services/conversation_service.py), [Message](file:///d:/xii/react_ollama_project_ali/backend/models/conversation.py#5-9) model |
| **Conversation export** | [export_tool.py](file:///d:/xii/react_ollama_project_ali/backend/tools/export_tool.py) exists — wire it to a "Download" button in the UI | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) |
| **Rate limiting** | Prevent API abuse per user | FastAPI middleware (`slowapi`) |
| **Refresh token / session expiry** | Auth currently uses access tokens only — sessions expire and break silently | [auth.py](file:///d:/xii/react_ollama_project_ali/backend/routers/auth.py), [AuthContext.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/contexts/AuthContext.jsx) |
| **Image upload in chat** | Send images to vision-capable models (e.g. `llava`) | [Chat.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/pages/Chat.jsx) + new backend handler |
| **Web search tool** | Give agents ability to search the web (e.g. via DuckDuckGo API) | New `tools/web_search_tool.py` |

---

## 🔵 Priority 5 — Polish & Production Readiness

| Feature | Why | Where |
|---|---|---|
| **i18n (French/English toggle)** | App is in French but mixed — standardize with `react-i18next` | All pages |
| **PWA support** | Make it installable on desktop/mobile | [vite.config.js](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/vite.config.js) + `manifest.json` |
| **Dark/Light mode persistence** | Already implemented — verify `localStorage` survives refresh | [ThemeContext.jsx](file:///d:/xii/react_ollama_project_ali/frontend/apps/web/src/contexts/ThemeContext.jsx) |
| **Loading skeletons** | Replace empty states with animated skeletons | All pages |
| **Dockerfile + docker-compose** | One-command production deployment | Root of project |
| **Environment validation** | Crash early if [.env](file:///d:/xii/react_ollama_project_ali/backend/.env) is incorrectly configured | [backend/core/settings.py](file:///d:/xii/react_ollama_project_ali/backend/core/settings.py) |

---

## 💡 Advanced / Future Ideas

- **Multi-agent conversations** — Route messages to different agents in the same chat thread
- **Agent marketplace** — Let admins share/import agent configs as JSON
- **Voice input** — Use Web Speech API to dictate messages
- **Webhooks** — Notify external systems when a conversation ends
- **Audit log** — Track admin actions (agent created, user promoted, etc.)

---

## 📋 Suggested Next Steps (Quick Wins First)

1. ✅ Fix 404 routes ← **done**
2. ✅ Add **markdown rendering** to Chat ← **done** (react-markdown + syntax highlighting)
3. ✅ Add **file upload button** in Chat ← **done**
4. ✅ Fix **`provider` field** missing from agent creation ← **done**
5. ✅ Add **message copy button** in Chat ← **done**
6. ✅ Build **User Management** admin page ← **done**
7. ✅ Add **conversation search** (full-text backend) ← **done**
8. ✅ Add **provider badge** on agent cards ← **done**
9. ✅ Add **provider selector** in agent form ← **done**
10. 🔧 Add **conversation export** button in Chat ← wired
11. 📄 Add **Agent Detail / Profile page** (2h)
12. 📄 Add **Usage stats dashboard** (2h)
13. 📄 Add **Rate limiting** middleware (1h)
14. 📄 Add **i18n** support (3h)
15. 📄 Add **Dockerfile** + docker-compose (1.5h)
