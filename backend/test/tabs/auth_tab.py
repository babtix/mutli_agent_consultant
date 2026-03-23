import json
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLineEdit,
    QPushButton, QTextEdit, QGroupBox, QCheckBox, QFormLayout
)
import api_client as api


class AuthTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)

        # ── Register ──────────────────────────────────────────────────────────
        reg_box = QGroupBox("Register")
        reg_form = QFormLayout()
        self.reg_email = QLineEdit("test@example.com")
        self.reg_username = QLineEdit("testuser")
        self.reg_password = QLineEdit("password123")
        self.reg_password.setEchoMode(QLineEdit.Password)
        self.reg_is_admin = QCheckBox("Admin")
        reg_form.addRow("Email:", self.reg_email)
        reg_form.addRow("Username:", self.reg_username)
        reg_form.addRow("Password:", self.reg_password)
        reg_form.addRow("", self.reg_is_admin)
        reg_btn = QPushButton("Register")
        reg_btn.clicked.connect(self.do_register)
        reg_form.addRow(reg_btn)
        reg_box.setLayout(reg_form)
        layout.addWidget(reg_box)

        # ── Login ─────────────────────────────────────────────────────────────
        login_box = QGroupBox("Login")
        login_form = QFormLayout()
        self.login_username = QLineEdit("testuser")
        self.login_password = QLineEdit("password123")
        self.login_password.setEchoMode(QLineEdit.Password)
        login_form.addRow("Username/Email:", self.login_username)
        login_form.addRow("Password:", self.login_password)
        login_btn = QPushButton("Login")
        login_btn.clicked.connect(self.do_login)
        login_form.addRow(login_btn)
        login_box.setLayout(login_form)
        layout.addWidget(login_box)

        # ── Me ────────────────────────────────────────────────────────────────
        me_btn = QPushButton("GET /auth/me  (requires token)")
        me_btn.clicked.connect(self.do_me)
        layout.addWidget(me_btn)

        # ── Output ────────────────────────────────────────────────────────────
        self.output = QTextEdit()
        self.output.setReadOnly(True)
        layout.addWidget(self.output)

    def _show(self, status, body):
        self.output.setPlainText(f"Status: {status}\n\n{json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, (dict, list)) else body}")

    def do_register(self):
        status, body = api.register(
            self.reg_email.text(), self.reg_username.text(),
            self.reg_password.text(), self.reg_is_admin.isChecked()
        )
        self._show(status, body)

    def do_login(self):
        status, body = api.login(self.login_username.text(), self.login_password.text())
        self._show(status, body)
        if status == 200 and isinstance(body, dict) and "access_token" in body:
            self.parent.set_token(body["access_token"])
            self.output.append("\n✅ Token saved and shared with all tabs.")

    def do_me(self):
        status, body = api.get_me(self.parent.token)
        self._show(status, body)
