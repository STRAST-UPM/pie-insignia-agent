from openai import OpenAI
client = OpenAI()

vector_store = client.vector_stores.create(
    name="ISST Materials",
    file_ids=[
        "file-7FB2G9CsCtLPsYtnBuzj2i",
        "file-P4nPUX8T9YeaPQX1ansCMv",
        "file-NUjuDRmNkXpYTQahwAkHkX",
        "file-U749ahX7CfwEGG1mujMPTL",
        "file-Fnx12oRrtTBc6xM8n1b4pA",
        "file-MTSt5YWAhQxygLAxWpcd9y",
        "file-CGPgLY7mb5dQtojduFgFwj",
        "file-4SpV2ot6epvv7gFquS5Ccv",
        "file-JRxVcaufgWrtUqNuyqQcdu"
    ]
)
print(vector_store)
