from openai import OpenAI
client = OpenAI()

vector_store = client.vector_stores.retrieve(
  vector_store_id="vs_67f7c4e443948191905446535a8d73ed"
)
print(vector_store)
