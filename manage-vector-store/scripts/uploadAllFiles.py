import os
from openai import OpenAI

client = OpenAI()

def upload_all_files_in_directory(directory_path):
    """
    Sube todos los archivos de una carpeta específica y devuelve los IDs de los archivos subidos.
    """
    files_to_upload = [os.path.join(directory_path, f) for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]

    uploaded_files = []
    for file_path in files_to_upload:
        uploaded_file = client.files.create(
            file=open(file_path, "rb"),
            purpose="assistants"
        )
        uploaded_files.append(uploaded_file.id)
        print(f"Archivo subido: {file_path} con file_id: {uploaded_file.id}")

    files = [{"filename": file.filename, "id": file.id} for file in client.files.list()]
    print(files)

    return uploaded_files

def create_vector_store(name, file_ids):
    """
    Crea un vector store utilizando los IDs de los archivos subidos.
    """
    vector_store = client.vector_stores.create(
        name=name,
        file_ids=file_ids
    )
    print(f"Vector store creado: {vector_store}")
    return vector_store

if __name__ == "__main__":
    directory = "files"
    uploaded_file_ids = upload_all_files_in_directory(directory)
    create_vector_store("ISST Materials", uploaded_file_ids)