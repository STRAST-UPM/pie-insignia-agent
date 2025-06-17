from openai import OpenAI
client = OpenAI()

files = list(client.files.list())
print(files)

print("-------------------------------------------------------------------------------")

fileIds = [{"filename": file.filename, "id": file.id} for file in client.files.list()]
print(fileIds)