"""
Chat tab — streams the AI response in a background thread so the UI stays responsive.
"""
import threading
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFormLayout,
    QLineEdit, QPushButton, QTextEdit, QLabel
)
from PyQt5.QtCore import pyqtSignal, QObject
import api_client as api


class _Worker(QObject):
    chunk = pyqtSignal(str)
    done = pyqtSignal(int)

    def __init__(self, token, conv_id, message):
        super().__init__()
        self.token = token
        self.conv_id = conv_id
        self.message = message

    def run(self):
        status, text = api.chat_stream(self.token, self.conv_id, self.message)
        if status == 200:
            self.chunk.emit(text)
        else:
            self.chunk.emit(f"[Error {status}] {text}")
        self.done.emit(status)


class ChatTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)

        form = QFormLayout()
        self.conv_id = QLineEdit("<conversation_id>")
        form.addRow("Conversation ID:", self.conv_id)
        layout.addLayout(form)

        self.history = QTextEdit()
        self.history.setReadOnly(True)
        layout.addWidget(self.history)

        row = QHBoxLayout()
        self.msg_input = QLineEdit()
        self.msg_input.setPlaceholderText("Type your message…")
        self.msg_input.returnPressed.connect(self.do_send)
        self.send_btn = QPushButton("Send")
        self.send_btn.clicked.connect(self.do_send)
        row.addWidget(self.msg_input)
        row.addWidget(self.send_btn)
        layout.addLayout(row)

        self.status_label = QLabel("")
        layout.addWidget(self.status_label)

    def on_token_updated(self):
        pass

    def do_send(self):
        message = self.msg_input.text().strip()
        if not message:
            return
        conv_id = self.conv_id.text().strip()
        self.history.append(f"<b>You:</b> {message}")
        self.msg_input.clear()
        self.send_btn.setEnabled(False)
        self.status_label.setText("Waiting for response…")

        worker = _Worker(self.parent.token, conv_id, message)
        worker.chunk.connect(self._on_chunk)
        worker.done.connect(self._on_done)
        t = threading.Thread(target=worker.run, daemon=True)
        t.start()
        self._worker = worker  # keep reference

    def _on_chunk(self, text):
        self.history.append(f"<b>AI:</b> {text}")

    def _on_done(self, status):
        self.send_btn.setEnabled(True)
        self.status_label.setText(f"Done (status {status})")
