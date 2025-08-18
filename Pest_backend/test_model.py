# test_model.py
from PIL import Image
from utils import predict_image_class

img_path = "sample/test_leaf.jpeg"  # Use one of your uploaded leaf images
image = Image.open(img_path)
result = predict_image_class(image)

print("Predicted class:", result)
