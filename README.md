# Medical Chatbot - Assistant Médical Virtuel


Un chatbot intelligent spécialisé dans le domaine médical, capable de répondre aux questions sur la santé, les symptômes, les médicaments et fournir des conseils généraux. Développé avec Flask et des modèles de langage avancés.

**⚠️ Important** : Ce chatbot ne remplace pas un avis médical professionnel. En cas d'urgence, contactez immédiatement les services d'urgence.

## Fonctionnalités

- Réponses aux questions médicales courantes
- Détection des situations d'urgence
- Interface conviviale et accessible
- Base de connaissances médicales intégrée
- Intégration avec des modèles de langage avancés (OpenAI)
- Adapté aux besoins des patients et professionnels de santé

## Prérequis

- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)
- Clé API OpenAI (ou autre service de modèle de langage)
- Navigateur web moderne

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/LOUGBEGNON/chatbot_medical.git
   cd medical-chatbot
   ```

2. **Créer un environnement virtuel (recommandé)** :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Linux/Mac
   venv\Scripts\activate     # Sur Windows
   ```

3. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurer l'application** :
   Créez un fichier `.env` à la racine du projet avec votre clé API :
   ```
   OPENAI_API_KEY=votre_cle_api_ici
   FLASK_SECRET_KEY=une_cle_secrete_pour_flask
   ```

## Lancement de l'application

1. **Mode développement** :
   ```bash
   flask run
   ```
   L'application sera accessible à l'adresse : [http://localhost:5000](http://localhost:5000)

2. **Mode production** :
   Pour déployer en production, utilisez un serveur WSGI comme Gunicorn :
   ```bash
   gunicorn app:app
   ```

## Structure des fichiers

```
medical-chatbot/
├── app.py                 # Application principale Flask
├── medical_knowledge.py   # Base de connaissances médicale
├── requirements.txt       # Dépendances Python
├── .env                   # Configuration (à créer)
├── static/
│   ├── css/style.css      # Styles CSS
│   └── js/script.js       # JavaScript pour l'interactivité
└── templates/
    └── index.html         # Template principal
```

## Configuration

Vous pouvez modifier les paramètres suivants dans `app.py` :

- Modèle de langage utilisé (`text-davinci-003` par défaut)
- Longueur maximale des réponses
- Style des réponses (ton professionnel, bienveillant, etc.)

Pour la base de connaissances, éditez le fichier `medical_knowledge.py` pour ajouter des questions/réponses spécifiques.

## Déploiement

Options recommandées :

1. **Heroku** :
   ```bash
   heroku create
   git push heroku main
   ```

2. **AWS Elastic Beanstalk** :
   ```bash
   eb init
   eb create
   ```

3. **Docker** :
   Créez un fichier `Dockerfile` :
   ```dockerfile
   FROM python:3.9
   WORKDIR /app
   COPY . .
   RUN pip install -r requirements.txt
   CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
   ```
   Puis :
   ```bash
   docker build -t medical-chatbot .
   docker run -p 5000:5000 medical-chatbot
   ```

## Sécurité et Confidentialité

- Ce chatbot ne stocke pas les conversations de manière permanente
- Les données de santé sont sensibles - conformez-vous au RGPD/HIPAA
- Utilisez toujours HTTPS en production
- Limitez l'accès si nécessaire (authentification)

## Contributions

Les contributions sont les bienvenues ! Voici comment participer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## Contact

LOUGBEGNON Amedee - amedeelougbegnon3@gmail.com
BERTHE Kadidiatou - amedeelougbegnon3@gmail.com

Lien du projet : [https://github.com/LOUGBEGNON/chatbot_medical.git](https://github.com/LOUGBEGNON/chatbot_medical.git)
