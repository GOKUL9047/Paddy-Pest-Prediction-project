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
    allow_origins=["*"],
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





# @app.post("/chatbot/")
# async def chatbot_endpoint(
#     image: UploadFile = File(...),        # Required image file
#     text: Optional[str] = Form(None)      # Optional text input
# ):
#     """
#     Main chatbot endpoint that:
#     - Accepts an image (required)
#     - Accepts a text input (optional)
#     - Returns model prediction + LLM explanation (based on input type)
#     """

#     # Step 1: Run model prediction on the image
#     try:
#         predicted_class = await predict_image_class(image)
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": f"Model prediction failed: {str(e)}"})

#     # Step 2: Generate LLM response based on input mode
#     try:
#         if text:
#             # If user also provides a text → use it to customize LLM response
#             llm_response = await generate_llm_response(predicted_class, user_input=text)
#         else:
#             # If only image → generate general explanation for the predicted class
#             llm_response = await generate_llm_response(predicted_class)
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": f"LLM generation failed: {str(e)}"})

#     # Step 3: Return both results
#     return {
#         "prediction": predicted_class,
#         "llm_response": llm_response
#     }

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
    return {"prediction": prediction, "response": explanation}

# ✅ New route: only for text-based chat with LLM
@app.post("/chat/")
async def chat_with_llm(text: str = Form(...)):
    explanation = ask_openai(text)
    return {"response": explanation}
