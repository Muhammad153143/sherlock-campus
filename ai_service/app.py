import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = None

# ✅ LOAD MODEL ONLY WHEN NEEDED
def load_model():
    global model

    if model is None:

        print("Loading MobileNetV2 model...")

        weights = models.MobileNet_V2_Weights.DEFAULT
        model_instance = models.mobilenet_v2(weights=weights)

        class Identity(nn.Module):
            def forward(self, x):
                return x

        model_instance.classifier = Identity()

        model_instance.eval()

        model = model_instance

        print("Model loaded successfully")


# preprocessing
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# ✅ ROOT ROUTE (IMPORTANT FOR RENDER)
@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "service": "Sherlock AI Service"
    })


# ✅ HEALTH ROUTE (FAST RESPONSE — NO MODEL LOAD)
@app.route("/health")
def health():

    return jsonify({
        "status": "ok"
    })


# ✅ EMBEDDING ROUTE (MODEL LOAD HERE ONLY)
@app.route("/embed", methods=["POST"])
def embed():

    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    try:

        load_model()

        image = Image.open(request.files["image"])

        if image.mode != "RGB":
            image = image.convert("RGB")

        tensor = preprocess(image)

        tensor = tensor.unsqueeze(0)

        with torch.no_grad():

            embedding = model(tensor)

        vector = embedding[0].tolist()

        return jsonify({"embedding": vector})

    except Exception as e:

        print(e)

        return jsonify({"error": str(e)}), 500


# similarity route
@app.route("/similarity", methods=["POST"])
def similarity():

    data = request.json

    target = torch.tensor(data["target"])
    candidates = torch.tensor(data["candidates"])

    if target.dim() == 1:
        target = target.unsqueeze(0)

    scores = torch.nn.functional.cosine_similarity(
        target,
        candidates,
        dim=1
    )

    return jsonify({
        "scores": scores.tolist()
    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    print("Starting AI Service...")

    app.run(
        host="0.0.0.0",
        port=port
    )
