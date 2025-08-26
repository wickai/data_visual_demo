import gradio as gr
from pathlib import Path
import os
import torch
from torchvision import transforms
from transformers import AutoModelForImageSegmentation
from PIL import Image
from datetime import datetime
import uuid

# 确保输出文件夹存在
output_dir = "./output"
os.makedirs(output_dir, exist_ok=True)

# 初始化模型和转换
transform_image = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# 加载模型（只初始化一次）
birefnet = AutoModelForImageSegmentation.from_pretrained(
    "briaai/RMBG-2.0", 
    trust_remote_code=True
).eval()
if torch.cuda.is_available():
    birefnet = birefnet.cuda()

green_bg_color = (0, 177, 64)

def process_image(input_img):
    # 转换输入图像
    image = input_img.convert("RGB")
    image_size = image.size
    
    # 预处理
    input_tensor = transform_image(image).unsqueeze(0)
    if torch.cuda.is_available():
        input_tensor = input_tensor.cuda()
    
    # 推理
    with torch.no_grad():
        preds = birefnet(input_tensor)[-1].sigmoid().cpu()
    
    # 后处理
    mask = transforms.ToPILImage()(preds[0].squeeze()).resize(image_size)
    
    # 创建绿色背景
    green_bg = Image.new("RGB", image_size, green_bg_color)
    processed_image = Image.composite(image, green_bg, mask.convert("L"))
    
    # 生成文件名
    current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")  # 当前时间
    unique_id = str(uuid.uuid4().int)[:4]  # 生成一个4位的唯一编号
    filename = f"{current_time}_{unique_id}_gb.png"  # 组合文件名
    filepath = os.path.join(output_dir, filename)  # 完整文件路径

    # 保存处理后的图片
    processed_image.save(filepath, format="PNG")
    
    return processed_image

# 创建Gradio界面
demo = gr.Interface(
    fn=process_image,
    inputs=gr.Image(type="pil", label="上传原始图片"),
    outputs=gr.Image(label="绿色背景结果", type="pil"),
    title="背景替换演示",
    description="上传图片自动替换为绿色背景。使用BRIA RMBG-2.0模型进行背景去除。",
    examples=[
        os.path.join(os.path.dirname(__file__), "data/frame_0000000001_ori.png"),
    ]
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0" if os.getenv('COLAB_GPU') else "127.0.0.1", share=True)