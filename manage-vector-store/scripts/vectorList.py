from openai import OpenAI

def list_vector_stores():
    """Lists all vector stores from OpenAI."""
    client = OpenAI()
    try:
        vector_stores = client.vector_stores.list()
        if vector_stores.data:
            for store in vector_stores.data:
                print(f"Name: {store.name}, ID: {store.id}")
        else:
            print("No vector stores found.")
    except Exception as e:
        print(f"Error listing vector stores: {e}")

if __name__ == "__main__":
    list_vector_stores()
