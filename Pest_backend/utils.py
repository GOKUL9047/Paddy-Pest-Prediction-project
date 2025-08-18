import torch
from torchvision import transforms, models
from PIL import Image
import openai
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from typing import Optional


# Load environment variables from .env file
load_dotenv()

# Load OpenAI API key securely from environment variable
API_KEY = os.getenv("OPENAI_API_KEY")

# Define class names used during model training
class_names = [
    'Brown Planthopper',
    'Larval Stage Leaf Folder',
    'Nilaparvata lugens',
    'Rice Gall Midge',
    'Rice Leaf Folder',
    'Rice White Stem Borer',
    'Rice Yellow Stem Borer',
    'White-Backed Planthopper'
]

# Image transformation to match model's expected input format
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize image to 224x224
    transforms.ToTensor(),          # Convert image to PyTorch tensor
])

# Function to load the trained PyTorch model
def load_model():
    """
    Loads a ResNet-18 model with custom final layer and pretrained weights.
    """
    model = models.resnet18(pretrained=False)  # Load base model without pretrained weights
    model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))  # Modify final layer to match class count
    model.load_state_dict(torch.load("model/pest_model.pth", map_location=torch.device('cpu')))  # Load trained weights
    model.eval()  # Set model to evaluation mode
    return model

# Function to predict pest class from input image
def predict_image_class(image: Image.Image) -> str:
    """
    Takes a PIL Image, transforms it, passes it through the model,
    and returns the predicted class name.
    """
    model = load_model()
    img_tensor = transform(image).unsqueeze(0)  # Transform and add batch dimension
    with torch.no_grad():  # Disable gradient computation for inference
        outputs = model(img_tensor)  # Get model output
        _, predicted = torch.max(outputs, 1)  # Get index of max logit
        return class_names[predicted.item()]  # Return corresponding class name

# ✅ Renamed function for LLM-based explanation

def generate_llm_response(pest_name: str, query: Optional[str] = None) -> str:
    """
    Generates a response from the LLM based on the pest name and optional user query.
    """
    if query:
        prompt = (
            f"The user has a query about '{pest_name}': \"{query}\". "
            f"Provide an expert explanation considering the pest."
        )
    else:
        prompt = f"Explain the symptoms, causes, and solutions for the rice pest: {pest_name}."

    return ask_openai(prompt)





def ask_openai(prompt: str) -> str:
    """
    Sends a prompt to the OpenAI model via OpenRouter API and returns the response.
    """
    LLM = ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",  # API endpoint
        api_key=API_KEY,                          # API key from environment
        model="gpt-3.5-turbo",                    # Chosen model
        temperature=0.7                           # Response creativity
    )
    response = LLM.invoke(prompt)  # Send prompt and get response
    return response.content.strip()  # Return only the content text (no metadata)
