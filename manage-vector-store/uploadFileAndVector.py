from openai import OpenAI
client = OpenAI()

# Subir el archivo
uploaded_file = client.files.create(
    file=open("files/ISST - Tema 1.1.pdf", "rb"),
    purpose="assistants"
)
file_id = uploaded_file.id  # Use dot notation to access the 'id' attribute
print(f"Archivo subido con file_id: {file_id}")

# Listar los archivos subidos
files = list(client.files.list())
print(files)

# Crear el vector store utilizando el file_id generado
vector_store = client.vector_stores.create(
    name="ISST Materials",
    file_ids=[file_id]
)
print(f"Vector store creado: {vector_store}")

# Recuperar el vector store
retrieved_vector_store = client.vector_stores.retrieve(
    vector_store_id=vector_store.id  # Use dot notation to access the 'id' attribute
)
print(f"Vector store recuperado: {retrieved_vector_store}")