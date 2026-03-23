#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup script for Multi-Agent Consultant project
Installs backend Python requirements and frontend npm dependencies
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# Set UTF-8 encoding for Windows console
if platform.system() == "Windows":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a formatted header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}[OK] {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKCYAN}[INFO] {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}[WARNING] {message}{Colors.ENDC}")

def run_command(command, cwd=None, shell=True):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python():
    """Check if Python is installed and version is adequate"""
    print_info("Checking Python installation...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} found")
        return True
    else:
        print_error(f"Python 3.8+ required, found {version.major}.{version.minor}.{version.micro}")
        return False

def check_node():
    """Check if Node.js is installed"""
    print_info("Checking Node.js installation...")
    success, output = run_command("node --version")
    if success:
        version = output.strip()
        print_success(f"Node.js {version} found")
        return True
    else:
        print_error("Node.js not found. Please install Node.js from https://nodejs.org/")
        return False

def check_npm():
    """Check if npm is installed"""
    print_info("Checking npm installation...")
    success, output = run_command("npm --version")
    if success:
        version = output.strip()
        print_success(f"npm {version} found")
        return True
    else:
        print_error("npm not found. Please install npm")
        return False

def install_backend_requirements():
    """Install Python backend requirements"""
    print_header("Installing Backend Requirements")
    
    backend_path = Path("backend")
    requirements_file = backend_path / "requirements.txt"
    
    if not requirements_file.exists():
        print_error(f"Requirements file not found: {requirements_file}")
        return False
    
    print_info(f"Installing requirements from {requirements_file}...")
    
    # Try to use pip or pip3
    pip_command = "pip" if platform.system() == "Windows" else "pip3"
    
    success, output = run_command(
        f"{pip_command} install -r {requirements_file}",
        cwd=None
    )
    
    if success:
        print_success("Backend requirements installed successfully")
        return True
    else:
        print_error("Failed to install backend requirements")
        print(output)
        return False

def install_frontend_dependencies(frontend_path):
    """Install npm dependencies for a frontend project"""
    frontend_name = frontend_path.name
    print_info(f"Installing dependencies for {frontend_name}...")
    
    package_json = frontend_path / "package.json"
    if not package_json.exists():
        print_warning(f"No package.json found in {frontend_path}, skipping...")
        return True
    
    success, output = run_command("npm install", cwd=str(frontend_path))
    
    if success:
        print_success(f"{frontend_name} dependencies installed")
        return True
    else:
        print_error(f"Failed to install {frontend_name} dependencies")
        print(output)
        return False

def install_all_frontends():
    """Install npm dependencies for all frontend projects"""
    print_header("Installing Frontend Dependencies")
    
    # List of frontend directories to install
    frontend_dirs = [
        Path("frontend"),
        Path(".frontend1"),
        Path(".frontend_2"),
        Path("main/frontend")
    ]
    
    success_count = 0
    total_count = 0
    
    for frontend_dir in frontend_dirs:
        if frontend_dir.exists():
            total_count += 1
            if install_frontend_dependencies(frontend_dir):
                success_count += 1
        else:
            print_warning(f"Frontend directory not found: {frontend_dir}, skipping...")
    
    if success_count == total_count and total_count > 0:
        print_success(f"All {total_count} frontend projects installed successfully")
        return True
    elif success_count > 0:
        print_warning(f"{success_count}/{total_count} frontend projects installed")
        return True
    else:
        print_error("Failed to install frontend dependencies")
        return False

def create_env_file():
    """Create .env file from .env.example if it doesn't exist"""
    print_header("Setting up Environment Files")
    
    backend_path = Path("backend")
    env_file = backend_path / ".env"
    env_example = backend_path / ".env.example"
    
    if env_file.exists():
        print_info(".env file already exists, skipping...")
        return True
    
    if not env_example.exists():
        print_warning(".env.example not found, skipping environment setup...")
        return True
    
    try:
        # Copy .env.example to .env
        with open(env_example, 'r') as src:
            content = src.read()
        with open(env_file, 'w') as dst:
            dst.write(content)
        print_success("Created .env file from .env.example")
        print_warning("Please update .env file with your configuration")
        return True
    except Exception as e:
        print_error(f"Failed to create .env file: {e}")
        return False

def main():
    """Main setup function"""
    print_header("Multi-Agent Consultant - Setup Script")
    
    # Check prerequisites
    if not check_python():
        sys.exit(1)
    
    if not check_node():
        sys.exit(1)
    
    if not check_npm():
        sys.exit(1)
    
    # Install backend requirements
    if not install_backend_requirements():
        print_error("Backend setup failed")
        sys.exit(1)
    
    # Create environment file
    create_env_file()
    
    # Install frontend dependencies
    if not install_all_frontends():
        print_error("Frontend setup failed")
        sys.exit(1)
    
    # Final success message
    print_header("Setup Complete!")
    print_success("All dependencies installed successfully")
    print_info("\nNext steps:")
    print("  1. Update backend/.env with your configuration")
    print("  2. Start MongoDB (if using local instance)")
    print("  3. Start Ollama (if using local LLM)")
    print("  4. Run backend: python run.py or cd backend && uvicorn main:app --reload")
    print("  5. Run frontend: cd frontend && npm run dev")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_warning("\n\nSetup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nUnexpected error: {e}")
        sys.exit(1)
