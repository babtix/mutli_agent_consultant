import sys
import requests
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLineEdit, QTextEdit, QLabel, QListWidget, QTabWidget, QMessageBox)
from PyQt5.QtCore import Qt

BASE_URL = "http://localhost:8000"

class TestApp(QWidget):
    def __init__(self):
        super().__init__()
        self.token = None
        self.current_conversation = None
        self.agents_data = []
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('Backend Tester - Multi-IA Consultant')
        self.resize(800, 600)
        
        layout = QVBoxLayout()
        self.tabs = QTabWidget()
        
        # Setup Tabs
        self.setupAuthTab()
        self.setupAgentsTab()
        self.setupChatTab()
        
        self.tabs.addTab(self.auth_tab, "Auth")
        self.tabs.addTab(self.agents_tab, "Agents")
        self.tabs.addTab(self.chat_tab, "Chat")
        
        layout.addWidget(self.tabs)
        self.setLayout(layout)
        
    def setupAuthTab(self):
        self.auth_tab = QWidget()
        layout = QVBoxLayout()
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Email")
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        btn_register = QPushButton("Register")
        btn_register.clicked.connect(self.register)
        
        btn_login = QPushButton("Login")
        btn_login.clicked.connect(self.login)
        
        layout.addWidget(QLabel("Authentication"))
        layout.addWidget(self.email_input)
        layout.addWidget(self.username_input)
        layout.addWidget(self.password_input)
        layout.addWidget(btn_register)
        layout.addWidget(btn_login)
        layout.addStretch()
        self.auth_tab.setLayout(layout)
        
    def setupAgentsTab(self):
        self.agents_tab = QWidget()
        layout = QVBoxLayout()
        
        self.agent_list = QListWidget()
        btn_refresh = QPushButton("Refresh Agents")
        btn_refresh.clicked.connect(self.fetch_agents)
        
        btn_create_agent = QPushButton("Create Test Agent")
        btn_create_agent.clicked.connect(self.create_test_agent)
        
        btn_start_conv = QPushButton("Start Conversation with Selected Agent")
        btn_start_conv.clicked.connect(self.start_conversation)
        
        layout.addWidget(QLabel("Agents"))
        layout.addWidget(btn_refresh)
        layout.addWidget(self.agent_list)
        layout.addWidget(btn_create_agent)
        layout.addWidget(btn_start_conv)
        self.agents_tab.setLayout(layout)
        
    def setupChatTab(self):
        self.chat_tab = QWidget()
        layout = QVBoxLayout()
        
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        
        self.msg_input = QLineEdit()
        self.msg_input.setPlaceholderText("Type a message...")
        
        btn_send = QPushButton("Send")
        btn_send.clicked.connect(self.send_message)
        
        input_layout = QHBoxLayout()
        input_layout.addWidget(self.msg_input)
        input_layout.addWidget(btn_send)
        
        self.conv_label = QLabel("No active conversation")
        
        layout.addWidget(self.conv_label)
        layout.addWidget(self.chat_display)
        layout.addLayout(input_layout)
        self.chat_tab.setLayout(layout)
        
    def get_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
        
    def register(self):
        data = {
            "email": self.email_input.text(),
            "username": self.username_input.text(),
            "password": self.password_input.text()
        }
        res = requests.post(f"{BASE_URL}/auth/register", json=data)
        if res.status_code == 200:
            QMessageBox.information(self, "Success", "Registered Successfully")
        else:
            QMessageBox.warning(self, "Error", f"Registration Failed: {res.text}")
            
    def login(self):
        # Swagger OAuth2 password bearer uses Form Data, so we pass `data` instead of `json`
        data = {
            "username": self.username_input.text() or self.email_input.text(),
            "password": self.password_input.text()
        }
        res = requests.post(f"{BASE_URL}/auth/login", data=data) 
        if res.status_code == 200:
            self.token = res.json().get("access_token")
            QMessageBox.information(self, "Success", "Login Successful. Token saved.")
            self.fetch_agents()
        else:
            QMessageBox.warning(self, "Error", f"Login Failed: {res.text}")

    def fetch_agents(self):
        if not self.token:
            return QMessageBox.warning(self, "Error", "Please login first")
        res = requests.get(f"{BASE_URL}/agents/", headers=self.get_headers())
        if res.status_code == 200:
            agents = res.json()
            self.agent_list.clear()
            self.agents_data = agents
            for r in agents:
                self.agent_list.addItem(f"{r['name']} ({r['_id']})")
                
    def create_test_agent(self):
        if not self.token:
            return QMessageBox.warning(self, "Error", "Please login first")
            
        data = {
            "name": "Consultant Test",
            "description": "Un test d'agent",
            "system_prompt": "Tu es un assistant IA. Réponds de façon très concise en français.",
            "model_name": "deepseek-v3.1:671b-cloud"
        }
        res = requests.post(f"{BASE_URL}/agents/", json=data, headers=self.get_headers())
        if res.status_code == 200:
            self.fetch_agents()
            QMessageBox.information(self, "Success", "Test Agent created")
        else:
            QMessageBox.warning(self, "Error", f"Failed: {res.text}")
            
    def start_conversation(self):
        if not self.token:
            return QMessageBox.warning(self, "Error", "Please login first")
            
        sel = self.agent_list.currentRow()
        if sel < 0:
            return QMessageBox.warning(self, "Warning", "Select an agent first from the list.")
            
        agent = self.agents_data[sel]
        data = {
            "title": "Test Chat",
            "agent_id": agent["_id"]
        }
        res = requests.post(f"{BASE_URL}/conversations/", json=data, headers=self.get_headers())
        if res.status_code == 200:
            conv = res.json()
            self.current_conversation = conv["_id"]
            self.conv_label.setText(f"Active Conversation: {conv['_id']}")
            self.chat_display.clear()
            self.tabs.setCurrentWidget(self.chat_tab)
            QMessageBox.information(self, "Success", "Conversation Started! You can now chat.")
        else:
            QMessageBox.warning(self, "Error", f"Conversation failed: {res.text}")
            
    def send_message(self):
        if not self.current_conversation:
            return QMessageBox.warning(self, "Warning", "No active conversation")
            
        msg = self.msg_input.text()
        if not msg:
            return
            
        self.chat_display.append(f"Vous: {msg}")
        self.msg_input.clear()
        
        # Disable input while waiting
        self.msg_input.setEnabled(False)
        self.chat_display.append("... L'IA réfléchit ...")
        QApplication.processEvents()
        
        data = {"message": msg}
        res = requests.post(f"{BASE_URL}/conversations/{self.current_conversation}/chat", 
                            json=data, headers=self.get_headers(), stream=True)
                            
        self.msg_input.setEnabled(True)
        # remove the "L'IA réfléchit" feedback
        cursor = self.chat_display.textCursor()
        cursor.movePosition(cursor.End)
        cursor.movePosition(cursor.StartOfLine, cursor.KeepAnchor)
        cursor.removeSelectedText()
        cursor.deletePreviousChar()

        if res.status_code == 200:
            self.chat_display.append("Agent: ")
            for chunk in res.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    cursor = self.chat_display.textCursor()
                    cursor.movePosition(cursor.End)
                    cursor.insertText(chunk)
                    QApplication.processEvents()
        else:
            self.chat_display.append(f"Error: {res.text}")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = TestApp()
    ex.show()
    sys.exit(app.exec_())
