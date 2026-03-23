import os
import subprocess

def main():
    # Because we are inside 'frontend/', the base project dir is one level up
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Define exact paths relative to root project
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")
    python_exe = os.path.join(base_dir, ".venv", "Scripts", "python.exe")
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"

    print("🚀 Booting up Multi-IA Consultant...")

    # Boot Backend in a new visible console window
    print("-> Starting FastAPI Backend...")
    if os.name == 'nt':
        subprocess.Popen(
            f'start "Backend - Multi-IA" cmd /k "{python_exe} main.py"',
            cwd=backend_dir,
            shell=True
        )
    else:
        subprocess.Popen([python_exe, "main.py"], cwd=backend_dir)

    # Boot Frontend in a new visible console window
    print("-> Starting React/Vite Frontend (Turborepo)...")
    if os.name == 'nt':
        subprocess.Popen(
            f'start "Frontend - Multi-IA" cmd /k "{npm_cmd} run dev"',
            cwd=frontend_dir,
            shell=True
        )
    else:
        subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    print("\n✅ All services launched successfully in separate dedicated windows!")
    print("You can close this main script. The application windows will remain completely active.")

if __name__ == "__main__":
    main()
