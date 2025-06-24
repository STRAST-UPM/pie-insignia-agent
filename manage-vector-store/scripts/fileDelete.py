import argparse
from openai import OpenAI

def delete_file(file_id: str):
    """Deletes a file from OpenAI."""
    client = OpenAI()
    try:
        client.files.delete(file_id)
        print(f"File {file_id} deleted successfully.")
    except Exception as e:
        print(f"Error deleting file {file_id}: {e}")

def main():
    """Main function to parse arguments and delete a file."""
    parser = argparse.ArgumentParser(description="Delete a file from OpenAI.")
    parser.add_argument("file_id", help="The ID of the file to delete.")
    args = parser.parse_args()
    
    delete_file(args.file_id)

if __name__ == "__main__":
    main()

