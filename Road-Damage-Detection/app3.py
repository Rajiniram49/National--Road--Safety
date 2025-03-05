import gradio as gr
import torch
from PIL import Image
import pathlib

# Fixing path issue for Windows
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

# Load the YOLOv5 model
weights_path = 'yolov5/runs/train/road_damage_detection/weights/best.pt'
model = torch.hub.load('ultralytics/yolov5', 'custom', path=weights_path, force_reload=True)
model.names = ["D00", "D10", "D20", "D40"]  # Crack categories

# Label mapping
label_mapping = {
    "D00": "Longitudinal Crack",
    "D10": "Transverse Crack",
    "D20": "Alligator Crack",
    "D40": "Pothole"
}

# Dummy accuracy value (replace with actual accuracy from model training)
model_accuracy = 92.5  # Example accuracy

def yolo(image):
    size = 640
    g = size / max(image.size)
    image = image.resize((int(image.size[0] * g), int(image.size[1] * g)))

    # Perform inference
    results = model(image)
    results.render()

    # Save processed image
    output_image = Image.fromarray(results.ims[0])

    # Extract detected labels
    unique_labels = set()
    for box in results.xyxy[0].cpu().numpy():
        label_idx = int(box[5])
        label_text = f"{model.names[label_idx]} -> {label_mapping.get(model.names[label_idx], 'Unknown')}"
        unique_labels.add(label_text)

    markdown_text = "\n".join(unique_labels) if unique_labels else "No damage detected."
    markdown_text += f"\n\n**Model Accuracy:** {model_accuracy}%"

    return output_image, markdown_text

# Define Gradio interface
inputs = gr.Image(type="pil", label="Upload Road Image")  # Single image input
outputs = [gr.Image(label="Detected Damage"), gr.Markdown(label="Detection Info")]

# Launch Gradio app
gr.Interface(fn=yolo, inputs=inputs, outputs=outputs, 
             title="Road Damage Detection",
             description="Detect road cracks & potholes using YOLOv5.\nUpload a road image for analysis."
             ).launch()
