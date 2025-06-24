"""
Uploads all files in a directory to OpenAI and prints their IDs to stdout.
"""

import argparse
import os
import sys
from openai import OpenAI

def upload_all_files(directory_path: str):
    """Uploads all files in a directory to OpenAI and prints their IDs to stdout."""
    client = OpenAI()
    if not os.path.isdir(directory_path):
        print(f"Error: Directory not found at {directory_path}", file=sys.stderr)
        sys.exit(1)

    file_ids = []
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        if os.path.isfile(file_path):
            try:
                with open(file_path, "rb") as file:
                    response = client.files.create(
                        file=file,
                        purpose="assistants"
                    )
                file_ids.append(response.id)
                print(f"Uploaded file: {filename} (ID: {response.id})", file=sys.stderr)
            except Exception as e:
                print(f"Error uploading file {filename}: {e}", file=sys.stderr)
    
    print(" ".join(file_ids))

def main():
    """Main function to parse arguments and upload files."""
    parser = argparse.ArgumentParser(description="Upload all files in a directory to OpenAI and print their IDs.")
    parser.add_argument("directory_path", help="The path to the directory containing files to upload.")
    args = parser.parse_args()
    
    upload_all_files(args.directory_path)

if __name__ == "__main__":
    main()