import argparse
from openai import OpenAI
import os

def upload_file(file_path: str):
    """Uploads a file to OpenAI."""
    client = OpenAI()
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    try:
        with open(file_path, "rb") as file:
            response = client.files.create(
                file=file,
                purpose="assistants"
            )
        print(f"File {file_path} uploaded successfully. File ID: {response.id}")
    except Exception as e:
        print(f"Error uploading file: {e}")

def main():
    """Main function to parse arguments and upload a file."""
    parser = argparse.ArgumentParser(description="Upload a file to OpenAI.")
    parser.add_argument("file_path", help="The path to the file to upload.")
    args = parser.parse_args()
    
    upload_file(args.file_path)

if __name__ == "__main__":
    main()
