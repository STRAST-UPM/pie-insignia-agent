from openai import OpenAI
client = OpenAI()

client.files.delete("file-HXV7bJFfud8J9j8HLLw521")
files = list(client.files.list())
print(files)

