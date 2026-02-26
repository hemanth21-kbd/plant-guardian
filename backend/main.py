from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import uvicorn
import shutil
import os
import hashlib
import time
import random

from . import models, schemas, database, ml_engine, gemini_client

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Plant Disease Detection API")

# Ensure the directory exists
os.makedirs("backend/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins (for now, to fix tunnel issues)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Plant Disease Detection API is running"}

class GoogleQuery(BaseModel):
    query: str

@app.post("/ask-google")
async def ask_google(query: GoogleQuery):
    response = gemini_client.ask_gemini(query.query)
    return {"answer": response}

from fastapi import Form 

@app.post("/predict", response_model=schemas.PredictionResult)
async def predict_disease(
    file: UploadFile = File(...), 
    language: str = Form("en"),
    db: Session = Depends(get_db)
):
    # Save temp file
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Run inference
        result = ml_engine.detector.predict(temp_file)
        
        final_result = None

        # Check for Unknown label, low confidence, or Model Error (Cloud deployment)
        if result["label"] == "Unknown" or result["label"].startswith("Error"):
            print("Local model unavailable/uncertain. Falling back to Gemini...")
            gemini_result = gemini_client.analyze_plant_disease(temp_file)
            
            if gemini_result:
                # Map Gemini result to response schema
                final_result = schemas.PredictionResult(
                    plant_name=gemini_result.get("plant_name", "Unknown"),
                    disease_name=gemini_result.get("disease_name", "Unknown"),
                    confidence=gemini_result.get("confidence", 0.0),
                    details=schemas.DiseaseBase(
                        name=gemini_result.get("disease_name", "Unknown"),
                        severity="Moderate", # Default
                        symptoms=gemini_result.get("details", {}).get("description", ""),
                        prevention=gemini_result.get("details", {}).get("prevention", ""),
                        treatments=[
                            schemas.TreatmentBase(
                                type="General",
                                description=gemini_result.get("details", {}).get("treatment", ""),
                                cost_approx="Varies"
                            )
                        ]
                    )
                )
        
        if not final_result:
            # Standard processing for local model results
            parts = result["label"].split("_")
            plant_name = parts[0]
            disease_name = " ".join(parts[1:])
            
            # Fetch details from DB
            db_disease = db.query(models.Disease).filter(
                models.Disease.name.contains(disease_name)
            ).first()
            
            details = None
            if db_disease:
                details = schemas.DiseaseBase(
                    name=db_disease.name,
                    severity=db_disease.severity,
                    symptoms=db_disease.symptoms,
                    prevention=db_disease.prevention,
                    treatments=[
                        schemas.TreatmentBase(
                            type=t.type,
                            description=t.description,
                            cost_approx=t.cost_approx
                        ) for t in db_disease.treatments
                    ]
                )
                
            final_result = schemas.PredictionResult(
                plant_name=plant_name,
                disease_name=disease_name,
                confidence=result["confidence"],
                details=details
            )

        # Translation Logic
        if language and language != 'en':
            try:
                translated_text = gemini_client.translate_text(
                    text=final_result.model_dump_json(),
                    target_language=language
                )
                # Parse back to object purely for structure or return raw dict?
                # Ideally, schema validation might fail if keys are translated.
                # We need to ask Gemini to ONLY translate specific value fields, OR
                # we pass the JSON and ask it to return the SAME JSON structure but with translated content values.
                import json
                translated_json = json.loads(translated_text)
                final_result = schemas.PredictionResult(**translated_json)
            except Exception as e:
                print(f"Translation failed: {e}")

        return final_result
        
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

# User Auth Routes
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.email:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    if user.phone_number:
        db_phone = db.query(models.User).filter(models.User.phone_number == user.phone_number).first()
        if db_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
    new_user = models.User(username=user.username, email=user.email, phone_number=user.phone_number, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
    db_user = db.query(models.User).filter(
        models.User.username == user.username,
        models.User.hashed_password == hashed_password
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": "Login successful", "user_id": db_user.id, "username": db_user.username}

OTP_STORE = {}

@app.post("/auth/request-otp")
def request_otp(data: schemas.OTPRequest):
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[data.identifier] = {"code": code, "expires": time.time() + 300} # 5 mins
    print(f"\n{'='*40}\n[TEST OTP] Identifier: {data.identifier} | Code: {code}\n{'='*40}\n")
    return {"message": "OTP sent successfully! (Check console for code)"}

@app.post("/auth/verify-otp")
def verify_otp(data: schemas.OTPVerify, db: Session = Depends(get_db)):
    record = OTP_STORE.get(data.identifier)
    if not record or record["code"] != data.code or time.time() > record["expires"]:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    del OTP_STORE[data.identifier]
    
    # Check if user exists by email, phone, or username
    db_user = db.query(models.User).filter(
        (models.User.email == data.identifier) | 
        (models.User.phone_number == data.identifier) | 
        (models.User.username == data.identifier)
    ).first()
    
    if not db_user:
        name_part = data.identifier.split("@")[0] if "@" in data.identifier else data.identifier
        new_user = models.User(
            username=name_part,
            email=data.identifier if "@" in data.identifier else None,
            phone_number=data.identifier if "@" not in data.identifier else None
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db_user = new_user
        
    return {"message": "OTP Login successful", "user_id": db_user.id, "username": db_user.username}

# My Garden Routes
@app.post("/my-garden/add", response_model=schemas.UserPlantResponse)
def add_to_garden(plant: schemas.UserPlantCreate, db: Session = Depends(get_db)):
    db_plant = models.UserPlant(**plant.model_dump())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@app.get("/my-garden/{user_id}", response_model=List[schemas.UserPlantResponse])
def get_my_garden(user_id: int, db: Session = Depends(get_db)):
    plants = db.query(models.UserPlant).filter(models.UserPlant.user_id == user_id).all()
    return plants

@app.delete("/my-garden/{plant_id}")
def delete_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(models.UserPlant).filter(models.UserPlant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    db.delete(plant)
    db.commit()
    return {"message": "Plant deleted successfully"}

# History / Logs Routes
@app.post("/my-garden/logs/add", response_model=schemas.GardenLogResponse)
def add_log(log: schemas.GardenLogCreate, db: Session = Depends(get_db)):
    db_log = models.GardenLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/my-garden/logs/{plant_id}", response_model=List[schemas.GardenLogResponse])
def get_logs(plant_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.GardenLog).filter(models.GardenLog.user_plant_id == plant_id).all()
    return logs

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_location = f"backend/uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"http://127.0.0.1:8000/uploads/{file.filename}"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
