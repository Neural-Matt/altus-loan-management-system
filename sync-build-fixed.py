#!/usr/bin/env python3
"""
Sync build folder contents (not folder itself) to remote server
"""
import subprocess
import os
import glob

def sync_build_contents(build_dir, host, username, remote_path):
    """Sync build directory contents to remote server via SCP"""
    try:
        print(f"Syncing {build_dir} contents to {host}:{remote_path}...")
        
        # Remove old build on server
        print("Removing old build files...")
        result = subprocess.run([
            "ssh", 
            f"{username}@{host}",
            f"rm -rf {remote_path}; mkdir -p {remote_path}"
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error preparing directory: {result.stderr}")
            return False
        
        # Get list of all files and directories
        items = []
        for item in os.listdir(build_dir):
            item_path = os.path.join(build_dir, item)
            items.append(item_path)
        
        # Copy all items
        for item in items:
            item_name = os.path.basename(item)
            if os.path.isdir(item):
                print(f"Copying directory: {item_name}...")
                result = subprocess.run(
                    f'scp -r "{item}" {username}@{host}:{remote_path}/',
                    shell=True,
                    capture_output=True,
                    text=True
                )
            else:
                print(f"Copying file: {item_name}...")
                result = subprocess.run(
                    f'scp "{item}" {username}@{host}:{remote_path}/',
                    shell=True,
                    capture_output=True,
                    text=True
                )
            
            if result.returncode != 0:
                print(f"Error copying {item_name}: {result.stderr}")
                return False
        
        # Verify
        print("\nVerifying...")
        result = subprocess.run([
            "ssh",
            f"{username}@{host}",
            f"ls -lh {remote_path}/static/js/main.*.js | head -1"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"[OK] Sync complete! New bundle: {result.stdout.strip()}")
            return True
        else:
            print(f"Verification failed")
            return False
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    build_dir = r"c:\Users\Admin\OneDrive\Documents\NCE Builds\Altus Loan Management System\Build\my-react-app-1\build"
    host = "72.60.187.1"
    username = "root"
    remote_path = "/opt/altus-app/current/build"
    
    sync_build_contents(build_dir, host, username, remote_path)
