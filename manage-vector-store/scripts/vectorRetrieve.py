import argparse
from openai import OpenAI

def retrieve_vector_store(vector_store_id: str):
    """Retrieves a vector store from OpenAI."""
    client = OpenAI()
    try:
        vector_store = client.vector_stores.retrieve(vector_store_id)
        print(f"Vector store retrieved successfully: {vector_store}")
    except Exception as e:
        print(f"Error retrieving vector store {vector_store_id}: {e}")

def main():
    """Main function to parse arguments and retrieve a vector store."""
    parser = argparse.ArgumentParser(description="Retrieve a vector store from OpenAI.")
    parser.add_argument("vector_store_id", help="The ID of the vector store to retrieve.")
    args = parser.parse_args()
    
    retrieve_vector_store(args.vector_store_id)

if __name__ == "__main__":
    main()
