from openai import OpenAI

def list_files():
    """Lists all files from OpenAI."""
    client = OpenAI()
    try:
        files = list(client.files.list())
        if files:
            for file in files:
                print(f"Filename: {file.filename}, ID: {file.id}")
        else:
            print("No files found.")
    except Exception as e:
        print(f"Error listing files: {e}")

if __name__ == "__main__":
    list_files()