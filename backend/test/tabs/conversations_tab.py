import json
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout, QGroupBox,
    QLineEdit, QPushButton, QTextEdit, QSpinBox
)
import api_client as api


class ConversationsTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)

        # ── Create ────────────────────────────────────────────────────────────
        create_box = QGroupBox("Create Conversation")
        cf = QFormLayout()
        self.c_title = QLineEdit("My Chat")
        self.c_agent_id = QLineEdit("<agent_id>")
        cf.addRow("Title:", self.c_title)
        cf.addRow("Agent ID:", self.c_agent_id)
        create_btn = QPushButton("POST /conversations")
        create_btn.clicked.connect(self.do_create)
        cf.addRow(create_btn)
        create_box.setLayout(cf)
        layout.addWidget(create_box)

        # ── List ──────────────────────────────────────────────────────────────
        list_box = QGroupBox("List Conversations")
        lf = QFormLayout()
        self.l_skip = QSpinBox(); self.l_skip.setRange(0, 9999)
        self.l_limit = QSpinBox(); self.l_limit.setRange(1, 100); self.l_limit.setValue(20)
        lf.addRow("Skip:", self.l_skip)
        lf.addRow("Limit:", self.l_limit)
        list_btn = QPushButton("GET /conversations")
        list_btn.clicked.connect(self.do_list)
        lf.addRow(list_btn)
        list_box.setLayout(lf)
        layout.addWidget(list_box)

        # ── Get ───────────────────────────────────────────────────────────────
        get_box = QGroupBox("Get Conversation")
        gf = QFormLayout()
        self.g_id = QLineEdit("<conversation_id>")
        gf.addRow("Conversation ID:", self.g_id)
        get_btn = QPushButton("GET /conversations/{id}")
        get_btn.clicked.connect(self.do_get)
        gf.addRow(get_btn)
        get_box.setLayout(gf)
        layout.addWidget(get_box)

        # ── Rename ────────────────────────────────────────────────────────────
        rename_box = QGroupBox("Rename Conversation")
        rf = QFormLayout()
        self.r_id = QLineEdit("<conversation_id>")
        self.r_title = QLineEdit("New Title")
        rf.addRow("Conversation ID:", self.r_id)
        rf.addRow("New Title:", self.r_title)
        rename_btn = QPushButton("PUT /conversations/{id}")
        rename_btn.clicked.connect(self.do_rename)
        rf.addRow(rename_btn)
        rename_box.setLayout(rf)
        layout.addWidget(rename_box)

        # ── Delete ────────────────────────────────────────────────────────────
        del_box = QGroupBox("Delete Conversation")
        df = QFormLayout()
        self.d_id = QLineEdit("<conversation_id>")
        df.addRow("Conversation ID:", self.d_id)
        del_btn = QPushButton("DELETE /conversations/{id}")
        del_btn.clicked.connect(self.do_delete)
        df.addRow(del_btn)
        del_box.setLayout(df)
        layout.addWidget(del_box)

        # ── Output ────────────────────────────────────────────────────────────
        self.output = QTextEdit()
        self.output.setReadOnly(True)
        layout.addWidget(self.output)

    def on_token_updated(self):
        pass

    def _show(self, status, body):
        self.output.setPlainText(f"Status: {status}\n\n{json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, (dict, list)) else body}")

    def do_create(self):
        status, body = api.create_conversation(self.parent.token, self.c_title.text(), self.c_agent_id.text())
        self._show(status, body)

    def do_list(self):
        status, body = api.list_conversations(self.parent.token, self.l_skip.value(), self.l_limit.value())
        self._show(status, body)

    def do_get(self):
        status, body = api.get_conversation(self.parent.token, self.g_id.text())
        self._show(status, body)

    def do_rename(self):
        status, body = api.rename_conversation(self.parent.token, self.r_id.text(), self.r_title.text())
        self._show(status, body)

    def do_delete(self):
        status, body = api.delete_conversation(self.parent.token, self.d_id.text())
        self._show(status, body)
