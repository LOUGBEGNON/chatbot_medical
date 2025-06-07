import uuid, os, openai
from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from requests.models import Response

openai.api_key = os.getenv("OPENAI_KEY")

app = Flask(__name__)

# Configuration de l'API OpenAI (ou autre service)

app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///conversations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=True)  # Peut être anonyme ou lié à un compte
    session_id = db.Column(db.String(100))
    message = db.Column(db.Text)
    response = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_medical_advice = db.Column(db.Boolean, default=False)

# Créer la base de données au premier lancement
with app.app_context():
    db.create_all()

def save_conversation(session_id, user_input, ai_response, user_id="anonymous"):
    try:
        is_medical = any(keyword in user_input.lower() for keyword in ['symptôme', 'maladie', 'traitement'])

        new_entry = Conversation(
            user_id=user_id,
            session_id=session_id,
            message=user_input,
            response=ai_response,
            is_medical_advice=is_medical
        )

        db.session.add(new_entry)
        db.session.commit()
    except Exception as e:
        app.logger.error(f"Error saving conversation: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())

    user_question = request.form['question'].lower()
    response = None

    try:
        # Utiliser un modèle de langue pour les questions complexes
        response = get_ai_response(user_question)
    except Exception as e:
        response = "Désolé, je rencontre des difficultés techniques. Veuillez reformuler votre question."

    # Sauvegarde de la conversation
    save_conversation(
        session_id=session['session_id'],
        user_input=user_question,
        ai_response=response
    )

    return jsonify({'response': response})


@app.route('/history', methods=['GET'])
def get_history():
    if 'session_id' not in session:
        return jsonify({'history': []})

    conversations = Conversation.query.filter_by(
        session_id=session['session_id']
    ).order_by(
        Conversation.timestamp.asc()
    ).all()

    history = [{
        'question': conv.message,
        'response': conv.response,
        'time': conv.timestamp.strftime('%Y-%m-%d %H:%M')
    } for conv in conversations]

    return jsonify({'history': history})


@app.route('/clear-history', methods=['POST'])
def clear_history():
    if 'session_id' in session:
        Conversation.query.filter_by(
            session_id=session['session_id']
        ).delete()
        db.session.commit()
    return jsonify({'status': 'success'})


@app.route('/export-history', methods=['GET'])
def export_history():
    if 'session_id' not in session:
        return jsonify({'error': 'Aucun historique'}), 404

    conversations = Conversation.query.filter_by(
        session_id=session['session_id']
    ).order_by(
        Conversation.timestamp.asc()
    ).all()

    output = "\n".join(
        f"{conv.timestamp} | Q: {conv.message}\nR: {conv.response}\n"
        for conv in conversations
    )

    return Response(
        output,
        mimetype="text/plain",
        headers={"Content-disposition":
                     "attachment; filename=historique-medical.txt"}
    )

def get_ai_response(question):
    """Obtenir une réponse d'un modèle GPT"""

    prompt = f"""
    Vous êtes un assistant médical expert. Répondez de manière précise, 
    professionnelle et bienveillante en français à la question suivante.

    Règles importantes :
    1. Soyez factuel et vérifié médicalement
    2. Pour les symptômes graves, recommandez immédiatement de consulter un médecin
    3. Ne proposez jamais de diagnostic définitif
    4. Précisez quand il s'agit de conseils généraux

    Question: {question}
    Réponse:"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # ou "gpt-4" si disponible
            messages=[
                {"role": "system", "content": "Vous êtes un assistant médical francophone professionnel."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Erreur OpenAI: {e}")
        return "Désolé, je ne peux pas répondre pour le moment. Veuillez reformuler votre question ou consulter un professionnel de santé."

# Création des tables
def create_tables():
    with app.app_context():
        try:
            db.create_all()
            print("Tables créées avec succès")
        except Exception as e:
            print(f"Erreur lors de la création des tables : {e}")


if __name__ == '__main__':
    create_tables()
    app.run(debug=True)