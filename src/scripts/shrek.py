from openai import OpenAI
from dotenv import load_dotenv
import os

path_to_env = os.path.join(os.path.dirname(__file__), '..', '.env')

load_dotenv(path_to_env)

api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

user_input = input("Tell me a joke?")
response = client.responses.create(
 model="gpt-5-nano",
    input=user_input
)
print(response.output_text)