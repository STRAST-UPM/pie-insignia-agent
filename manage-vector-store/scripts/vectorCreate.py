import argparse
from openai import OpenAI

def create_vector_store(name: str, file_ids: list):
    """Creates a vector store with the given name and file IDs."""
    client = OpenAI()
    try:
        vector_store = client.vector_stores.create(
            name=name,
            file_ids=file_ids
        )
        print(f"Vector store '{name}' created successfully. ID: {vector_store.id}")
        return vector_store
    except Exception as e:
        print(f"Error creating vector store: {e}")
        return None

def main():
    """Main function to parse arguments and create a vector store."""
    parser = argparse.ArgumentParser(description="Create a vector store in OpenAI.")
    parser.add_argument("name", help="The name of the vector store.")
    parser.add_argument("file_ids", nargs='+', help="A list of file IDs to include in the vector store.")
    args = parser.parse_args()
    
    create_vector_store(args.name, args.file_ids)

if __name__ == "__main__":
    main()
