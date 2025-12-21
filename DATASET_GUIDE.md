# Dataset Setup Guide

To train the Plant Disease Detection model, you need to download and organize the datasets manually.

## 1. Create Directory Structure
Create a folder named `datasets` in the root of your project, and inside it, a folder named `raw`.
```
plant firtiizers/
│   └── raw/
```

## 2. Download Datasets
Download the following datasets and extract them into `datasets/raw`.

### Core Dataset (Tomato & Chilli)
- **Source**: [PlantVillage (Kaggle)](https://www.kaggle.com/datasets/emmarex/plantdisease)
- **Action**: Extract the `PlantVillage` folder into `datasets/raw`.
- **Result**: `datasets/raw/PlantVillage/Tomato___Bacterial_spot/...`

### Paddy (Rice)
- **Source**: [Paddy Doctor (Kaggle)](https://www.kaggle.com/competitions/paddy-disease-classification/data)
- **Action**: Extract into `datasets/raw/Paddy`.

### Coconut
- **Source**: [Coconut Tree Disease Dataset (Mendeley)](https://data.mendeley.com/datasets/33458555-3129-47f8-8424-38668f177152)
- **Action**: Extract into `datasets/raw/Coconut`.

### Other Plants (Banana, Mango, Rose, Groundnut, Cotton, Lemon)
- Search for the specific datasets mentioned in the chat on Kaggle or Mendeley Data.
- Extract each into its own folder inside `datasets/raw`, e.g., `datasets/raw/Banana`, `datasets/raw/Mango`.

### New Datasets (Fruit & Ripeness)
- **Fruit Classification**: Search for "Fruit Classification" (contains apple, banana, etc.).
- **Banana Ripeness**: Search for "Banana Ripeness Classification".
- **Action**: Extract these into `datasets/raw` as well.

## 3. Run Organization Script
Once you have downloaded and extracted at least one dataset:

1.  Open a terminal in the project root.
2.  Run the script:
    ```bash
    python backend/organize_dataset.py
    ```
3.  The script will:
    - Scan `datasets/raw` for images.
    - Normalize class names (e.g., `Tomato___Bacterial_spot` -> `Tomato__Bacterial_spot`).
    - Split data into `train` (80%), `val` (10%), and `test` (10%).
    - Save the organized data to `datasets/processed`.

## 4. Verify
Check the `datasets/processed` folder. It should look like this:
```
datasets/processed/
├── train/
│   ├── Tomato__Bacterial_spot/
│   ├── Tomato__Healthy/
│   └── ...
├── val/
│   └── ...
└── test/
    └── ...
```
