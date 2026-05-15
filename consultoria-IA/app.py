from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# ──────────────────────────────────────────
#  CONFIGURAÇÃO
# ──────────────────────────────────────────

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash")

app = Flask(__name__)
CORS(app)   # permite chamadas do frontend (arquivo local ou outro domínio)


# ──────────────────────────────────────────
#  ROTA PRINCIPAL
# ──────────────────────────────────────────
@app.route("/consultar", methods=["POST"])
def consultar():
    dados = request.get_json()

    cabelo    = dados.get("cabelo", "").strip()
    orcamento = dados.get("orcamento", 0)

    if not cabelo:
        return jsonify({"erro": "Descrição do cabelo não informada."}), 400
    if not orcamento or float(orcamento) <= 0:
        return jsonify({"erro": "Orçamento inválido."}), 400

    prompt = (
        f"Você é a especialista do salão Lili Cabeleireiro. "
        f"Cliente: Cabelo {cabelo}, Orçamento: R$ {orcamento:.2f}. "
        "Responda em no máximo 7 linhas. "
        "Seja direta: Liste produtos (marca + nome), o preço estimado de cada um e como usar. "
        "A soma total deve ser obrigatoriamente menor ou igual ao orçamento. "
        "Use um tom acolhedor mas muito resumido."
    )

    try:
        resposta = model.generate_content(prompt)
        texto    = resposta.text.strip()
        return jsonify({"recomendacao": texto})

    except Exception as e:
        return jsonify({"erro": f"Erro ao chamar a API Gemini: {str(e)}"}), 500


# ──────────────────────────────────────────
#  INICIALIZAÇÃO
# ──────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)