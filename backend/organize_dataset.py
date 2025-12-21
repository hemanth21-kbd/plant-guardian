import os
import shutil
import random
from pathlib import Path
from collections import defaultdict

# Configuration
RAW_DATA_DIR = Path("datasets/raw")
PROCESSED_DATA_DIR = Path("datasets/processed_v2")
SPLIT_RATIOS = {"train": 0.8, "val": 0.1, "test": 0.1}
SEED = 42

# Specific Source Directories to scan
# We list the exact paths where class folders are located
SOURCE_DIRS = [
    RAW_DATA_DIR / "archive (1)/PlantVillage",
    RAW_DATA_DIR / "archive (1)/PlantVillage/PlantVillage", # Nested path
    RAW_DATA_DIR / "paddy-disease-classification/train_images",
    RAW_DATA_DIR / "archive (2)/Banana Disease Recognition Dataset/Original Images/Original Images", # Nested path
    RAW_DATA_DIR / "archive (4)/images", # Fruit Classification
    RAW_DATA_DIR / "archive (5)/Banana Ripeness Classification Dataset/train", # Banana Ripeness (Train)
    RAW_DATA_DIR / "archive (5)/Banana Ripeness Classification Dataset/test", # Banana Ripeness (Test)
    RAW_DATA_DIR / "archive (5)/Banana Ripeness Classification Dataset/valid", # Banana Ripeness (Valid)
    # Add others if identified
]

# Standardized Class Names Mapping
CLASS_MAPPING = {
    # Tomato (PlantVillage)
    "Tomato_Bacterial_spot": "Tomato__Bacterial_spot",
    "Tomato_Early_blight": "Tomato__Early_blight",
    "Tomato_Late_blight": "Tomato__Late_blight",
    "Tomato_Leaf_Mold": "Tomato__Leaf_Mold",
    "Tomato_Septoria_leaf_spot": "Tomato__Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Tomato__Spider_mites",
    "Tomato__Target_Spot": "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Tomato__Yellow_Leaf_Curl_Virus",
    "Tomato__Tomato_mosaic_virus": "Tomato__Mosaic_virus",
    "Tomato_healthy": "Tomato__Healthy",
    
    # Pepper (PlantVillage)
    "Pepper__bell___Bacterial_spot": "Chilli__Bacterial_spot",
    "Pepper__bell___healthy": "Chilli__Healthy",
    
    # Potato (PlantVillage)
    "Potato___Early_blight": "Potato__Early_blight",
    "Potato___Late_blight": "Potato__Late_blight",
    "Potato___healthy": "Potato__Healthy",

    # Paddy (Paddy Doctor)
    "bacterial_leaf_blight": "Paddy__Bacterial_leaf_blight",
    "bacterial_leaf_streak": "Paddy__Bacterial_leaf_streak",
    "bacterial_panicle_blight": "Paddy__Bacterial_panicle_blight",
    "blast": "Paddy__Blast",
    "brown_spot": "Paddy__Brown_spot",
    "dead_heart": "Paddy__Dead_heart",
    "downy_mildew": "Paddy__Downy_mildew",
    "hispa": "Paddy__Hispa",
    "normal": "Paddy__Normal",
    "tungro": "Paddy__Tungro",
    
    # Banana Disease
    "Healthy": "Banana__Healthy",
    "Sigatoka": "Banana__Sigatoka",
    "Xanthomonas": "Banana__Xanthomonas",
    
    # Fruit Classification (archive 4)
    "apple fruit": "Fruit__Apple",
    "banana fruit": "Fruit__Banana",
    "cherry fruit": "Fruit__Cherry",
    "chickoo fruit": "Fruit__Chickoo",
    "grapes fruit": "Fruit__Grapes",
    "kiwi fruit": "Fruit__Kiwi",
    "mango fruit": "Fruit__Mango",
    "orange fruit": "Fruit__Orange",
    "strawberry fruit": "Fruit__Strawberry",
    
    # Banana Ripeness (archive 5)
    "overripe": "Banana__Ripeness__Overripe",
    "ripe": "Banana__Ripeness__Ripe",
    "rotten": "Banana__Ripeness__Rotten",
    "unripe": "Banana__Ripeness__Unripe",
}

def normalize_class_name(folder_name):
    if folder_name in CLASS_MAPPING:
        return CLASS_MAPPING[folder_name]
    
    # Fallback: Capitalize and prefix? 
    # Better to just return it cleaned up if not in mapping
    return folder_name.replace(" ", "_").replace("__", "_")

def organize_dataset():
    random.seed(SEED)
    
    # Create output directories
    if PROCESSED_DATA_DIR.exists():
        print(f"Removing existing {PROCESSED_DATA_DIR}...")
        shutil.rmtree(PROCESSED_DATA_DIR)
    
    for split in SPLIT_RATIOS:
        (PROCESSED_DATA_DIR / split).mkdir(parents=True, exist_ok=True)

    print("Scanning datasets...")
    class_images = defaultdict(list)
    
    for source_dir in SOURCE_DIRS:
        if not source_dir.exists():
            print(f"Skipping missing directory: {source_dir}")
            continue
            
        print(f"Scanning {source_dir}...")
        for entry in os.scandir(source_dir):
            if entry.is_dir():
                class_name = entry.name
                
                # Skip container folders that are not classes
                if class_name in ["PlantVillage", "Original Images", "Augmented images"]:
                    continue
                    
                normalized_name = normalize_class_name(class_name)
                
                # Collect images
                images = []
                for root, _, files in os.walk(entry.path):
                    for file in files:
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                            images.append(Path(root) / file)
                
                if images:
                    class_images[normalized_name].extend(images)
                    print(f"  Found {len(images)} images for {normalized_name} (from {class_name})")

    print(f"\nTotal classes found: {len(class_images)}")
    
    total_processed = 0
    for class_name, images in class_images.items():
        # Shuffle
        random.shuffle(images)
        
        # Split
        n_total = len(images)
        n_train = int(n_total * SPLIT_RATIOS["train"])
        n_val = int(n_total * SPLIT_RATIOS["val"])
        
        splits = {
            "train": images[:n_train],
            "val": images[n_train:n_train+n_val],
            "test": images[n_train+n_val:]
        }
        
        for split, split_images in splits.items():
            split_dir = PROCESSED_DATA_DIR / split / class_name
            split_dir.mkdir(parents=True, exist_ok=True)
            
            for img_path in split_images:
                dest_path = split_dir / img_path.name
                if dest_path.exists():
                    dest_path = split_dir / f"{img_path.stem}_{random.randint(1000,9999)}{img_path.suffix}"
                shutil.copy2(img_path, dest_path)
                total_processed += 1
                
    print(f"\nDone! Processed {total_processed} images into {PROCESSED_DATA_DIR}")

if __name__ == "__main__":
    organize_dataset()
