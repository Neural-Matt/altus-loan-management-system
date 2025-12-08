#!/usr/bin/env python3
"""
Sync build folder to remote server via SCP
"""
import subprocess
import os

def sync_build_to_server(build_dir, host, username, remote_path):
    """Sync build directory to remote server via SCP"""
    try:
        print(f"Syncing {build_dir} to {host}:{remote_path}...")
        
        # First, remove old build on server
        print("Removing old build files...")
        result = subprocess.run([
            "ssh", 
            f"{username}@{host}",
            f"rm -rf {remote_path}; mkdir -p {remote_path}"
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error preparing directory: {result.stderr}")
            return False
        
        # Copy all files using SCP
        print("Copying build files...")
        result = subprocess.run(
            f'scp -r "{build_dir}" {username}@{host}:{remote_path}/',
            shell=True,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Count files
            file_count = sum([len(files) for _, _, files in os.walk(build_dir)])
            print(f"[OK] Sync complete! {file_count} files copied")
            return True
        else:
            print(f"Error copying files: {result.stderr}")
            return False
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    build_dir = r"c:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build"
    host = "72.60.187.1"
    username = "root"
    remote_path = "/opt/altus-app/current/build"
    
    sync_build_to_server(build_dir, host, username, remote_path)



