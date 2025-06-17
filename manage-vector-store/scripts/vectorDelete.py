from openai import OpenAI
client = OpenAI()

deleted_vector_store = client.vector_stores.delete(
  vector_store_id="vs_6811e5e7b408819181438da9db84d1a6"
)
print(deleted_vector_store)

vector_stores = client.vector_stores.list()
print(vector_stores)