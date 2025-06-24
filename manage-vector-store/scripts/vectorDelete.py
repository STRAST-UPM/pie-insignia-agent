import argparse
from openai import OpenAI

def delete_vector_store(vector_store_id: str):
    """Deletes a vector store from OpenAI."""
    client = OpenAI()
    try:
        client.vector_stores.delete(vector_store_id)
        print(f"Vector store {vector_store_id} deleted successfully.")
    except Exception as e:
        print(f"Error deleting vector store {vector_store_id}: {e}")

def main():
    """Main function to parse arguments and delete a vector store."""
    parser = argparse.ArgumentParser(description="Delete a vector store from OpenAI.")
    parser.add_argument("vector_store_id", help="The ID of the vector store to delete.")
    args = parser.parse_args()
    
    delete_vector_store(args.vector_store_id)

if __name__ == "__main__":
    main()