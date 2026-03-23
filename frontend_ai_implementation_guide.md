# Multi-IA Consultant Frontend Implementation Plan

This is a comprehensive guide tailored for any AI agent that will build the `Multi-IA Consultant` frontend web application. The frontend must interact seamlessly with the existing FastAPI backend (`http://127.0.0.1:8008`).

---

## 1. Context & Objective
Your objective is to build a robust, production-ready frontend web application. The backend is an intelligent, multi-agent AI system (using Ollama) that can process files (PDFs/DOCX), handle chat streams, manage custom agents, and maintain conversations.

### Key Rules for the AI Builder:
- **Aesthetics First**: Design should be modern, clean, and extremely premium. Use a tech-oriented vibrant dark mode styling with subtle micro-animations. The user should be "wowed" at a glance.
- **Robust State Management**: Handle JWT bearer token lifecycle smoothly and ensure authenticated requests.
- **Error Handling**: Gracefully intercept `401 Unauthorized` or `500 Server Error` and display elegant Toasts to the user.
- **Component Reusability**: Do not write monolithic components. Break files down structurally into `Atomic Components`.

---

## 2. Technology Stack
- **Framework:** React 18+ created via Vite (TypeScript).
- **Styling:** Vanilla CSS or Tailwind CSS + Framer Motion for micro-interactions.
- **Components:** Shadcn UI + Radix UI Primitives (optional/recommended for speed).
- **Routing:** React Router DOM (v6).
- **Icons:** Lucide-React.
- **Network Requests:** Axios or JS Fetch with interceptors for JWT token injection.

---

## 3. Backend API Overview
The FastAPI backend runs on `http://127.0.0.1:8008`. All guarded routes use Bearer Token (`Authorization: Bearer <token>`).

### Routers Available:
1. **`/auth`**
   - `POST /auth/register`: `email`, `username`, `password`, `is_admin`. Returns basic User object (200) or 400.
   - `POST /auth/login`: Requires `username` and `password` via `OAuth2PasswordRequestForm`. Returns `{ "access_token": "...", "token_type": "bearer" }`.
   - `GET /auth/me`: Requires Bearer Auth. Returns the authenticated User object.

2. **`/agents`** (Requires Token)
   - `GET /agents/`: List agents.
   - `POST /agents/`: Create agent (`name`, `description`, `system_prompt`, `model_name`, `tools`).
   - `GET /agents/{agent_id}`: Detail.

3. **`/conversations`** (Requires Token)
   - `GET /conversations/`: List threads.
   - `POST /conversations/`: Create thread.
   - `POST /conversations/{conversation_id}/messages`: Post a string, returns AI response stream using Ollama backend.

---

## 4. Proposed Application Structure
```text
frontend/
├── src/
│   ├── assets/        (images, global css, logos)
│   ├── components/
│   │   ├── ui/        (buttons, inputs, modals, toasts etc)
│   │   ├── layout/    (Sidebar, Topbar, ProtectedRouteWrapper)
│   │   └── chat/      (ChatBubble, MessageList, FileUploadArea)
│   ├── hooks/         (useAuth, useAgents, useChatStream)
│   ├── lib/           (axiosClient.ts, utils)
│   ├── pages/         
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx    (Overview / metrics)
│   │   ├── AgentsList.tsx   (Agent Management)
│   │   └── ChatView.tsx     (Conversational interface)
│   ├── App.tsx        (React Router setup)
│   └── main.tsx
└── package.json
```

---

## 5. Step-by-Step Implementation Guide

### Phase 1: Foundation & Auth
> [!IMPORTANT]
> Always secure the JWT Token. Avoid `localStorage` XSS vectors if possible, but for initial iteration, `localStorage` is acceptable with an Axios interceptor.

1. Initialize the Vite+React application in `frontend/`.
2. Configure **Tailwind CSS** or global design tokens in CSS. Set up a sleek, "glassmorphism" tech theme (dark grays/blacks with vibrant blue/purple accents).
3. Build the `axiosClient` passing the `Bearer Token` to each request.
4. Implement `Login.tsx` and `Register.tsx` pages. Build the `useAuth` hook & context to protect the main dashboard.

### Phase 2: Navigation & Agents
1. Create a `Layout` component consisting of a modern lateral Sidebar (collapsible) and a Topbar displaying the logged-in user.
2. Build the **Agents Management** dashboard. The user must be able to view, edit, or create custom Ollama system-prompted agents.

### Phase 3: The Chat Interface
> [!CAUTION] 
> Processing the Chat response requires streaming (unless backend buffers the response). Make sure you handle chunked transfer encoding smoothly to simulate the "typing" effect on the UI.

1. Implement the `ChatView.tsx`.
2. Incorporate a file dropzone (for handling PDFs/DOCXs using the `pdf_reader` backend tool).
3. The message bubbles should support Markdown rendering (using `react-markdown` and `remark-gfm`). Code blocks should have syntax highlighting and "copy" buttons.

### Phase 4: Polish & Deploy
> [!TIP]
> This is what separates average from great. Address empty states, loading skeletons, error toasts, and responsive design for mobile.

1. Ensure the UI relies heavily on Skeleton loaders (not just spinners) while waiting for backend `GET /agents`.
2. Wrap operations in a global Toast provider for displaying success/error visually.
3. Validate forms cleanly before hitting the backend directly.
