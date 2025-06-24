"""
Unified vector store management utility.
Orchestrates vector store operations by calling scripts.
"""

import argparse
import subprocess
import sys
import os

def get_script_path(script_name):
    """Constructs the absolute path to a script in the 'scripts' directory."""
    return os.path.join(os.path.dirname(__file__), "scripts", script_name)

def run_script(command, capture_output=False):
    """Runs a script and handles errors."""
    try:
        result = subprocess.run(
            command,
            check=True,
            text=True,
            capture_output=capture_output,
            encoding='utf-8'
        )
        if capture_output:
            return result.stdout.strip()
        return None
    except FileNotFoundError:
        print(f"Error: Script not found for command: {command}", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error executing script for command: {' '.join(command)}", file=sys.stderr)
        if e.stdout:
            print(f"STDOUT: {e.stdout}", file=sys.stderr)
        if e.stderr:
            print(f"STDERR: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> int:
    """CLI interface for vector store management."""
    parser = argparse.ArgumentParser(description="Manage OpenAI Vector Stores by orchestrating scripts.")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    # File commands
    upload_parser = subparsers.add_parser("upload-file", help="Upload a single file.")
    upload_parser.add_argument("path", help="File path to upload.")

    upload_all_parser = subparsers.add_parser("upload-files", help="Upload all files from a directory.")
    upload_all_parser.add_argument("path", help="Directory path to upload from.")

    list_files_parser = subparsers.add_parser("list-files", help="List all uploaded files.")

    delete_file_parser = subparsers.add_parser("delete-file", help="Delete a file by ID.")
    delete_file_parser.add_argument("id", help="File ID to delete.")

    # Vector Store commands
    create_store_parser = subparsers.add_parser("create-store", help="Create a vector store.")
    create_store_parser.add_argument("name", help="Vector store name.")
    create_store_parser.add_argument("file_ids", nargs="+", help="List of file IDs.")

    list_stores_parser = subparsers.add_parser("list-stores", help="List all vector stores.")

    get_store_parser = subparsers.add_parser("get-store", help="Get details of a vector store.")
    get_store_parser.add_argument("id", help="Vector store ID.")

    delete_store_parser = subparsers.add_parser("delete-store", help="Delete a vector store.")
    delete_store_parser.add_argument("id", help="Vector store ID.")

    # Workflow command
    setup_parser = subparsers.add_parser("setup", help="Complete workflow: upload files and create vector store.")
    setup_parser.add_argument("path", help="Directory path for files.")
    setup_parser.add_argument("name", help="Vector store name.")
    
    args = parser.parse_args()

    python_executable = sys.executable
    
    if args.command == "upload-file":
        script_path = get_script_path("fileUpload.py")
        run_script([python_executable, script_path, args.path])
    
    elif args.command == "upload-files":
        script_path = get_script_path("filesUploadAll.py")
        run_script([python_executable, script_path, args.path])

    elif args.command == "list-files":
        script_path = get_script_path("fileList.py")
        run_script([python_executable, script_path])

    elif args.command == "delete-file":
        script_path = get_script_path("fileDelete.py")
        run_script([python_executable, script_path, args.id])

    elif args.command == "create-store":
        script_path = get_script_path("vectorCreate.py")
        run_script([python_executable, script_path, args.name] + args.file_ids)

    elif args.command == "list-stores":
        script_path = get_script_path("vectorList.py")
        run_script([python_executable, script_path])

    elif args.command == "get-store":
        script_path = get_script_path("vectorRetrieve.py")
        run_script([python_executable, script_path, args.id])

    elif args.command == "delete-store":
        script_path = get_script_path("vectorDelete.py")
        run_script([python_executable, script_path, args.id])

    elif args.command == "setup":
        print(f"Starting setup for vector store '{args.name}'...")
        
        # 1. Upload files
        print(f"Uploading files from directory: {args.path}")
        upload_script_path = get_script_path("filesUploadAll.py")
        file_ids_str = run_script([python_executable, upload_script_path, args.path], capture_output=True)
        
        if not file_ids_str:
            print("No files were uploaded. Aborting setup.", file=sys.stderr)
            return 1
        
        file_ids = file_ids_str.split()
        print(f"Successfully uploaded {len(file_ids)} files.")

        # 2. Create vector store
        print(f"Creating vector store '{args.name}'...")
        create_script_path = get_script_path("vectorCreate.py")
        run_script([python_executable, create_script_path, args.name] + file_ids)
        
        print("Setup complete.")

    return 0

if __name__ == "__main__":
    sys.exit(main())
