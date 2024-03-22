from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import io
import requests
from flask import Flask, jsonify, render_template_string, request
from pdfminer.high_level import extract_text
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SERVICE_ACCOUNT_FILE = '/Users/thomaslorenc/Sites/google/port-authority-416712-c86cdbf84fd0.json'
project_id = "port-authority-416712"
region = "us-central1"


app = Flask(__name__)
CORS(app)

def ask_ai(ask_ai_text, temperature='HIGH'):
    prompt = ask_ai_text
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )

    response = query_llm_with_prompt(credentials, project_id, region, prompt, temperature)
    print(response)
    questions = []
    if response and isinstance(response, list):
        for item in response:
            if 'candidates' in item:
                for candidate in item['candidates']:
                    if 'content' in candidate and 'parts' in candidate['content']:
                        for part in candidate['content']['parts']:
                            questions.append(part['text'])
    return questions




def get_interview_questions(temperature='HIGH'):
    pdf_file_path = "/Users/thomaslorenc/Sites/google/port_authority_sample_comptecy_questions.pdf"
    pdf_text = extract_text_from_pdf(pdf_file_path)

    prompt = f"""
    You are a port authority interview assistant that creates interview questions one question for each Competency and one Level A: 
    Competency Analytical Thinking Level A, Competency Time Management Level A, Competency Sense of Urgency Level A, Competency Project Management Level A, Competency Problem Solving Level A, Competency Planning and Organization Level A, 
    Competency Initiative Level A, Competency Entrepreneurship Level A, and Competency Attention to Detail Level A similar to this text: {pdf_text} but new and creative. 
    Make sure to clearly state the Competency name and Level name before the question, then ask one follow-up probe. Make you return one question for every Competency 
    """

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )

    response = query_llm_with_prompt(credentials, project_id, region, prompt, temperature)
    print(response)
    questions = []
    if response and isinstance(response, list):
        for item in response:
            if 'candidates' in item:
                for candidate in item['candidates']:
                    if 'content' in candidate and 'parts' in candidate['content']:
                        for part in candidate['content']['parts']:
                            questions.append(part['text'])
    return questions

def extract_text_from_pdf(pdf_file_path):
    return extract_text(pdf_file_path)

def query_llm_with_prompt(credentials, project_id, region, prompt, mytemp='HIGH'):
    temp_set = 0.9 if mytemp == 'HIGH' else 0.2
    credentials.refresh(Request())
    access_token = credentials.token

    endpoint_url = f"https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{region}/publishers/google/models/gemini-1.0-pro:streamGenerateContent"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [{"role": "USER", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temp_set, "maxOutputTokens": 8192}
    }

    response = requests.post(endpoint_url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to query LLM API: {response.text}")

# Configure the Google Gemini API
genai.configure(api_key="AIzaSyClsisVq0yJYbHFcz-Hxq7ADu63morM6rY")
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}
safety_settings = [
    # Define your safety settings here...
]
model = genai.GenerativeModel(
    model_name="gemini-1.0-pro",
    generation_config=generation_config,
    safety_settings=safety_settings
)

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    user_input = data['message']

    if user_input == "generate questions":
        print('here')
        response_text = get_interview_questions('HIGH')
        #print(response_text)
    else:
        convo = model.start_chat(history=[])
        #convo.send_message(user_input)
        #response_text = convo.last.text
        answer = ask_ai(user_input, temperature='HIGH')
        #print(answer)
        response_text = answer

    response_text = [f"{item.replace('**', '<br>')}" for item in response_text]
    response_text = [f"{item.replace(',', '')}" for item in response_text]
    response_text = [f"{item.replace('?', '? <br><br>')}" for item in response_text]



    return jsonify({"response": response_text})

if __name__ == "__main__":
    app.run(debug=True)