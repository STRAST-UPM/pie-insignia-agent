from openai import OpenAI
client = OpenAI()

client.files.create(
  file=open("../files/PlantillaCasosUso-Cockburn.pdf", "rb"),
  purpose="assistants"
)

files = list(client.files.list())
print(files)
