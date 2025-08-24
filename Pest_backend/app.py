
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import io
from utils import predict_image_class, ask_openai
from PIL import Image
from dotenv import load_dotenv
import openai  

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils import predict_image_class, generate_llm_response
from typing import Optional

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Paddy Pest Prediction API is running."}

# Original combined route

@app.post("/predict-all/")
async def predict_all(image: UploadFile = File(...), query: Optional[str] = Form(None)):
    """
    Handles combined image + optional text input.
    Returns pest prediction and LLM response (contextualized if query is given).
    """
    contents = await image.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    prediction = predict_image_class(img)

    # LLM response with or without query
    llm_response = generate_llm_response(prediction, query)

    return {"prediction": prediction, "explanation": llm_response}


# ✅ New route: only for image upload and prediction
@app.post("/predict-image/")
async def predict_image(image: UploadFile = File(...)):
    image_path = f"temp_images/{image.filename}"
    os.makedirs("temp_images", exist_ok=True)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    image = Image.open(image_path)
    prediction = predict_image_class(image)
    prompt = f"Explain what '{prediction}' is and how to solve it in simple terms."
    explanation = ask_openai(prompt)
    return {"prediction": prediction, "response": explanation.content}



# ✅ Agricultural-Only Chat endpoint with Markdown response
@app.post("/chat/")
async def chat_with_llm(text: str = Form(...)):
    try:
        # Check if the question is agriculture-related
        agriculture_keywords = [
            'pest', 'crop', 'plant', 'farming', 'agriculture', 'soil', 'fertilizer', 
            'seed', 'harvest', 'disease', 'insect', 'rice', 'paddy', 'wheat', 'corn',
            'vegetable', 'fruit', 'irrigation', 'pesticide', 'herbicide', 'fungicide',
            'cultivation', 'plantation', 'greenhouse', 'organic', 'yield', 'growth',
            'nutrient', 'compost', 'weed', 'farmer', 'field', 'garden', 'agricultural'
        ]
        
        # Convert query to lowercase for checking
        query_lower = text.lower()
        
        # Check if any agriculture keyword is present
        is_agricultural = any(keyword in query_lower for keyword in agriculture_keywords)
        
        if not is_agricultural:
            # If not agricultural, provide a polite redirect
            response = """## 🌾 Agricultural Assistant Only

I'm specialized in **agricultural topics only**. I can help you with:

- **🐛 Pest identification and control**
- **🌱 Crop diseases and treatments** 
- **🚜 Farming techniques and best practices**
- **🌾 Rice, wheat, and other crop cultivation**
- **💧 Irrigation and soil management**
- **🧪 Fertilizers and organic farming**
- **🌿 Plant nutrition and growth**

Please ask me questions related to **agriculture, farming, or crop management**."""
            
            return {"response": response}
        
        # If agricultural question, create specialized prompt for markdown response
        prompt = f"""You are an expert agricultural consultant specializing in crop management, pest control, and farming practices. 
        
        Answer this agricultural question in a well-structured markdown format with clear headings, bullet points, and practical advice: {text}
        
        Please format your response with:
        - Clear headings using ## or ###
        - Bullet points for lists
        - **Bold text** for important terms
        - Practical, actionable advice
        - If relevant, include prevention and treatment methods
        """
        
        explanation = ask_openai(prompt)
        
        # Extract the response content
        response_content = explanation.content if hasattr(explanation, 'content') else str(explanation)
        
        return {"response": response_content}
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        error_response = """## ⚠️ Error

**Sorry, I couldn't process your request at the moment.**

Please try asking your agricultural question again, or check:
- Your internet connection
- If the question is related to agriculture/farming

I'm here to help with all your **farming and crop management needs**! 🌱"""
        
        return JSONResponse(content={"response": error_response}, status_code=500)


# @app.post("/predict/text")
# async def predict_text(query: str = Form(...)):
#     try:
#         llm_response = ask_openai(f"Rice pest chatbot query: {query}")
#         return JSONResponse(content={"response": llm_response})
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)



# # ✅ New route: only for text-based chat with LLM
# @app.post("/chat/")
# async def chat_with_llm(text: str = Form(...)):
#     explanation = ask_openai(text)
#     return {"response": explanation.content}
 