import subprocess
import time
import urllib.request
import urllib.error
import sys
import os

def is_up(url):
    try:
        response = urllib.request.urlopen(url, timeout=2)
        return response.getcode() == 200
    except (urllib.error.URLError, ConnectionResetError):
        return False

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Absolute Paths
    python_exe = os.path.join(base_dir, ".venv", "Scripts", "python.exe")
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend", "apps", "web")
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"

    print("🚀 Starting Backend Server...")
    backend_process = subprocess.Popen(
        [python_exe, "main.py"],
        cwd=backend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT
    )

    print("🚀 Starting Frontend Server...")
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT
    )

    try:
        print("\n⏳ Waiting for services to become healthy...")
        
        backend_up = False
        frontend_up = False
        
        # Test Backend
        for i in range(30):
            if is_up("http://127.0.0.1:8008/"):
                backend_up = True
                print("✅ Backend is UP and healthy! (http://127.0.0.1:8008)")
                break
            time.sleep(1)
            
        if not backend_up:
            print("❌ Backend failed to start or respond internally within 30 seconds.")
        
        # Test Frontend
        for i in range(30):
            if is_up("http://localhost:5173/"):
                frontend_up = True
                print("✅ Frontend is UP and healthy! (http://localhost:5173)")
                break
            time.sleep(1)
            
        if not frontend_up:
            print("❌ Frontend failed to start or respond internally within 30 seconds.")

        if backend_up and frontend_up:
            print("\n🎉 Both services are running successfully!")
            print("To stop them, press CTRL+C in this terminal window.\n")
            
            while True:
                time.sleep(1)
        else:
            print("\n⚠️ Not all services started correctly. Shutting down...")
            backend_process.terminate()
            frontend_process.terminate()
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n🛑 Shutting down processes...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Done. Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    main()
