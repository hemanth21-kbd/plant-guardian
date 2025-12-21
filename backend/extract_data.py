import os
import zipfile
from pathlib import Path

RAW_DIR = Path("datasets/raw")

def extract_zip_files():
    if not RAW_DIR.exists():
        print(f"Directory {RAW_DIR} does not exist.")
        return

    zip_files = list(RAW_DIR.glob("*.zip"))
    print(f"Found {len(zip_files)} zip files.")

    for zip_path in zip_files:
        # Create a folder name based on the zip file name
        folder_name = zip_path.stem
        extract_to = RAW_DIR / folder_name
        
        print(f"Extracting {zip_path.name} to {extract_to}...")
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            print(f"Done.")
            
            # Optional: Delete zip file after extraction to save space? 
            # Let's keep it for now to be safe.
            
        except zipfile.BadZipFile:
            print(f"Error: {zip_path.name} is a bad zip file.")
        except Exception as e:
            print(f"Error extracting {zip_path.name}: {e}")

if __name__ == "__main__":
    extract_zip_files()
