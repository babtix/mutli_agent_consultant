"""
PyQt5 Test App for Multi-IA Consultant Backend
Base URL: http://127.0.0.1:8008
"""
import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QTabWidget
from tabs.auth_tab import AuthTab
from tabs.agents_tab import AgentsTab
from tabs.conversations_tab import ConversationsTab
from tabs.chat_tab import ChatTab
from tabs.tools_tab import ToolsTab


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Multi-IA Backend Tester")
        self.setMinimumSize(900, 700)

        self.token = None  # shared JWT token

        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)

        self.auth_tab = AuthTab(self)
        self.agents_tab = AgentsTab(self)
        self.conversations_tab = ConversationsTab(self)
        self.chat_tab = ChatTab(self)
        self.tools_tab = ToolsTab(self)

        self.tabs.addTab(self.auth_tab, "Auth")
        self.tabs.addTab(self.agents_tab, "Agents")
        self.tabs.addTab(self.conversations_tab, "Conversations")
        self.tabs.addTab(self.chat_tab, "Chat")
        self.tabs.addTab(self.tools_tab, "Tools")

    def set_token(self, token: str):
        self.token = token
        self.agents_tab.on_token_updated()
        self.conversations_tab.on_token_updated()
        self.chat_tab.on_token_updated()
        self.tools_tab.on_token_updated()

    def get_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
