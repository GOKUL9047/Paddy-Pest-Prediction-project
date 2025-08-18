
# Paddy Pest Prediction Chatbot

AI-powered application to help identify rice crop pests and provide explanations.

---

##  Features

- **Image-only Input**: Upload a pest image and get a prediction along with a simple LLM-generated explanation.
- **Image + Optional Text**: Add custom questions along with an image to get more tailored responses.
- **Text-only Chat**: Ask pest-related questions and receive insightful answers via LLM.
- **Responsive React Frontend**: Clean UI with navbar-driven navigation, optimized for mobile, tablet, and desktop.
- **FastAPI Backend**: Handles model inference using a trained CNN model and triggers LLM via OpenAI.
- **Modular Code Structure**: Clean separation of components, pages, and API logic for easy maintenance.

---

##  Tech Stack

| Layer      | Technologies                        |
|------------|-------------------------------------|
| Backend    | Python, FastAPI, PyTorch (ResNet)   |
| LLM        | OpenAI API (via `ask_openai` / `generate_llm_response`) |
| Frontend   | React, React Router, Tailwind CSS   |

---

##  Project Structure

Paddy-Pest-Prediction-project/
├── Pest_backend/
├── Pest_frontend/ (React app)
├── .gitignore (e.g., node_modules, .env)
└── README.md