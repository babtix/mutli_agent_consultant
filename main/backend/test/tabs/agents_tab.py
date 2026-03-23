import json
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout, QGroupBox,
    QLineEdit, QPushButton, QTextEdit, QPlainTextEdit, QFileDialog
)
import api_client as api


class AgentsTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)

        # ── List ──────────────────────────────────────────────────────────────
        list_btn = QPushButton("GET /agents  (list all)")
        list_btn.clicked.connect(self.do_list)
        layout.addWidget(list_btn)

        # ── Create ────────────────────────────────────────────────────────────
        create_box = QGroupBox("Create Agent  (admin)")
        cf = QFormLayout()
        self.c_name = QLineEdit("My Agent")
        self.c_desc = QLineEdit("A helpful assistant")
        self.c_model = QLineEdit("deepseek-v3.1:671b-cloud")
        self.c_prompt = QPlainTextEdit("You are a helpful assistant.")
        self.c_prompt.setFixedHeight(60)
        self.c_logo = QLineEdit()
        logo_btn = QPushButton("Browse logo…")
        logo_btn.clicked.connect(lambda: self._pick_file(self.c_logo, "Images (*.png *.jpg *.jpeg *.gif)"))
        cf.addRow("Name:", self.c_name)
        cf.addRow("Description:", self.c_desc)
        cf.addRow("Model:", self.c_model)
        cf.addRow("System Prompt:", self.c_prompt)
        cf.addRow("Logo (optional):", self.c_logo)
        cf.addRow("", logo_btn)
        create_btn = QPushButton("POST /agents")
        create_btn.clicked.connect(self.do_create)
        cf.addRow(create_btn)
        create_box.setLayout(cf)
        layout.addWidget(create_box)

        # ── Update ────────────────────────────────────────────────────────────
        update_box = QGroupBox("Update Agent  (admin)")
        uf = QFormLayout()
        self.u_id = QLineEdit("<agent_id>")
        self.u_name = QLineEdit("Updated Agent")
        self.u_desc = QLineEdit("Updated description")
        self.u_model = QLineEdit("deepseek-v3.1:671b-cloud")
        self.u_prompt = QPlainTextEdit()
        self.u_prompt.setFixedHeight(50)
        self.u_prompt.setPlaceholderText("Leave empty to keep existing prompt")
        uf.addRow("Agent ID:", self.u_id)
        uf.addRow("Name:", self.u_name)
        uf.addRow("Description:", self.u_desc)
        uf.addRow("Model:", self.u_model)
        uf.addRow("New Prompt:", self.u_prompt)
        update_btn = QPushButton("PUT /agents/{id}")
        update_btn.clicked.connect(self.do_update)
        uf.addRow(update_btn)
        update_box.setLayout(uf)
        layout.addWidget(update_box)

        # ── Delete ────────────────────────────────────────────────────────────
        del_box = QGroupBox("Delete Agent  (admin)")
        df = QFormLayout()
        self.d_id = QLineEdit("<agent_id>")
        df.addRow("Agent ID:", self.d_id)
        del_btn = QPushButton("DELETE /agents/{id}")
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

    def _pick_file(self, target: QLineEdit, filt: str):
        path, _ = QFileDialog.getOpenFileName(self, "Select file", "", filt)
        if path:
            target.setText(path)

    def _show(self, status, body):
        self.output.setPlainText(f"Status: {status}\n\n{json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, (dict, list)) else body}")

    def do_list(self):
        status, body = api.list_agents(self.parent.token)
        self._show(status, body)

    def do_create(self):
        logo = self.c_logo.text().strip() or None
        status, body = api.create_agent(
            self.parent.token, self.c_name.text(), self.c_desc.text(),
            self.c_model.text(), self.c_prompt.toPlainText(), logo
        )
        self._show(status, body)

    def do_update(self):
        prompt = self.u_prompt.toPlainText().strip() or None
        status, body = api.update_agent(
            self.parent.token, self.u_id.text(), self.u_name.text(),
            self.u_desc.text(), self.u_model.text(), prompt
        )
        self._show(status, body)

    def do_delete(self):
        status, body = api.delete_agent(self.parent.token, self.d_id.text())
        self._show(status, body)
