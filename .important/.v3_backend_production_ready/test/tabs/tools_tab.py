import json
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout, QGroupBox,
    QLineEdit, QPushButton, QTextEdit, QComboBox, QFileDialog
)
import api_client as api


class ToolsTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        layout = QVBoxLayout(self)

        # ── PDF Extract ───────────────────────────────────────────────────────
        pdf_box = QGroupBox("Extract Text from PDF")
        pf = QFormLayout()
        self.pdf_path = QLineEdit()
        self.pdf_path.setPlaceholderText("Select a .pdf file…")
        pdf_browse = QPushButton("Browse…")
        pdf_browse.clicked.connect(lambda: self._pick(self.pdf_path, "PDF Files (*.pdf)"))
        pf.addRow("PDF File:", self.pdf_path)
        pf.addRow("", pdf_browse)
        pdf_btn = QPushButton("POST /tools/pdf/extract-text")
        pdf_btn.clicked.connect(self.do_pdf)
        pf.addRow(pdf_btn)
        pdf_box.setLayout(pf)
        layout.addWidget(pdf_box)

        # ── DOCX Extract ──────────────────────────────────────────────────────
        docx_box = QGroupBox("Extract Text from DOCX")
        df = QFormLayout()
        self.docx_path = QLineEdit()
        self.docx_path.setPlaceholderText("Select a .docx file…")
        docx_browse = QPushButton("Browse…")
        docx_browse.clicked.connect(lambda: self._pick(self.docx_path, "Word Files (*.docx)"))
        df.addRow("DOCX File:", self.docx_path)
        df.addRow("", docx_browse)
        docx_btn = QPushButton("POST /tools/docx/extract-text")
        docx_btn.clicked.connect(self.do_docx)
        df.addRow(docx_btn)
        docx_box.setLayout(df)
        layout.addWidget(docx_box)

        # ── Export Conversation ───────────────────────────────────────────────
        export_box = QGroupBox("Export Conversation")
        ef = QFormLayout()
        self.exp_conv_id = QLineEdit("<conversation_id>")
        self.exp_format = QComboBox()
        self.exp_format.addItems(["md", "txt", "json"])
        ef.addRow("Conversation ID:", self.exp_conv_id)
        ef.addRow("Format:", self.exp_format)
        export_btn = QPushButton("GET /tools/export/{id}")
        export_btn.clicked.connect(self.do_export)
        ef.addRow(export_btn)
        export_box.setLayout(ef)
        layout.addWidget(export_box)

        # ── Output ────────────────────────────────────────────────────────────
        self.output = QTextEdit()
        self.output.setReadOnly(True)
        layout.addWidget(self.output)

    def on_token_updated(self):
        pass

    def _pick(self, target: QLineEdit, filt: str):
        path, _ = QFileDialog.getOpenFileName(self, "Select file", "", filt)
        if path:
            target.setText(path)

    def _show(self, status, body):
        self.output.setPlainText(
            f"Status: {status}\n\n"
            f"{json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, (dict, list)) else body}"
        )

    def do_pdf(self):
        path = self.pdf_path.text().strip()
        if not path:
            self.output.setPlainText("Please select a PDF file first.")
            return
        status, body = api.extract_pdf(self.parent.token, path)
        self._show(status, body)

    def do_docx(self):
        path = self.docx_path.text().strip()
        if not path:
            self.output.setPlainText("Please select a DOCX file first.")
            return
        status, body = api.extract_docx(self.parent.token, path)
        self._show(status, body)

    def do_export(self):
        conv_id = self.exp_conv_id.text().strip()
        fmt = self.exp_format.currentText()
        status, body = api.export_conversation(self.parent.token, conv_id, fmt)
        self._show(status, body)
