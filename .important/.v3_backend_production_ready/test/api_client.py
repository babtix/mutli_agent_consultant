"""
Thin synchronous HTTP client wrapping requests.
All methods return (status_code, response_body_dict_or_text).
"""
import requests

BASE_URL = "http://127.0.0.1:8008"
TIMEOUT = 30  # seconds for all non-streaming calls


def _headers(token=None):
    h = {"Accept": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


# ── Auth ──────────────────────────────────────────────────────────────────────

def register(email, username, password, is_admin=False):
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email, "username": username,
        "password": password, "is_admin": is_admin
    }, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def login(username, password):
    r = requests.post(f"{BASE_URL}/auth/login", data={
        "username": username, "password": password
    }, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def get_me(token):
    r = requests.get(f"{BASE_URL}/auth/me", headers=_headers(token), timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


# ── Agents ────────────────────────────────────────────────────────────────────

def list_agents(token):
    r = requests.get(f"{BASE_URL}/agents/", headers=_headers(token), timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def create_agent(token, name, description, model_name, prompt_text, logo_path=None):
    files = {"prompt_file": (f"{name}.md", prompt_text.encode(), "text/markdown")}
    if logo_path:
        with open(logo_path, "rb") as lf:
            files["logo_file"] = (logo_path, lf.read())
    data = {"name": name, "description": description, "model_name": model_name}
    r = requests.post(f"{BASE_URL}/agents/", headers=_headers(token),
                      data=data, files=files, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def update_agent(token, agent_id, name, description, model_name, prompt_text=None, logo_path=None):
    files = {}
    if prompt_text is not None:
        files["prompt_file"] = (f"{name}.md", prompt_text.encode(), "text/markdown")
    if logo_path:
        with open(logo_path, "rb") as lf:
            files["logo_file"] = (logo_path, lf.read())
    data = {"name": name, "description": description, "model_name": model_name}
    r = requests.put(f"{BASE_URL}/agents/{agent_id}", headers=_headers(token),
                     data=data, files=files or None, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def delete_agent(token, agent_id):
    r = requests.delete(f"{BASE_URL}/agents/{agent_id}",
                        headers=_headers(token), timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


# ── Conversations ─────────────────────────────────────────────────────────────

def create_conversation(token, title, agent_id):
    r = requests.post(f"{BASE_URL}/conversations/", headers=_headers(token),
                      json={"title": title, "agent_id": agent_id}, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def list_conversations(token, skip=0, limit=20):
    r = requests.get(f"{BASE_URL}/conversations/", headers=_headers(token),
                     params={"skip": skip, "limit": limit}, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def get_conversation(token, conv_id):
    r = requests.get(f"{BASE_URL}/conversations/{conv_id}",
                     headers=_headers(token), timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def rename_conversation(token, conv_id, title):
    r = requests.put(f"{BASE_URL}/conversations/{conv_id}", headers=_headers(token),
                     json={"title": title}, timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def delete_conversation(token, conv_id):
    r = requests.delete(f"{BASE_URL}/conversations/{conv_id}",
                        headers=_headers(token), timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def chat_stream(token, conv_id, message):
    """Returns full streamed text (blocking). Uses 180s timeout for AI generation."""
    r = requests.post(
        f"{BASE_URL}/conversations/{conv_id}/chat",
        headers=_headers(token),
        json={"message": message},
        stream=True,
        timeout=180
    )
    if r.status_code != 200:
        return r.status_code, _safe_json(r)
    text = ""
    for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
        if chunk:
            text += chunk
    return 200, text


# ── Tools ─────────────────────────────────────────────────────────────────────

def extract_pdf(token, file_path):
    with open(file_path, "rb") as f:
        r = requests.post(f"{BASE_URL}/tools/pdf/extract-text",
                          headers=_headers(token),
                          files={"file": (file_path, f, "application/pdf")},
                          timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def extract_docx(token, file_path):
    mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    with open(file_path, "rb") as f:
        r = requests.post(f"{BASE_URL}/tools/docx/extract-text",
                          headers=_headers(token),
                          files={"file": (file_path, f, mime)},
                          timeout=TIMEOUT)
    return r.status_code, _safe_json(r)


def export_conversation(token, conv_id, fmt="md"):
    r = requests.get(f"{BASE_URL}/tools/export/{conv_id}",
                     headers=_headers(token), params={"format": fmt}, timeout=TIMEOUT)
    return r.status_code, r.text


# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe_json(r):
    try:
        return r.json()
    except ValueError:
        return r.text
