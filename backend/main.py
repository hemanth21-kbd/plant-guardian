from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uvicorn
import shutil
import os
import hashlib
import time
import random

from . import models, schemas, database, gemini_client, places_service

# Try to create tables, but don't fail if database isn't available
try:
    models.Base.metadata.create_all(bind=database.engine)
    print("✅ Database tables created/verified")
except Exception as e:
    print(f"⚠️ Database connection issue: {e}")
    print("App will try to connect when needed...")

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
    allow_headers=["Content-Type", "Bypass-Tunnel-Reminder", "Authorization", "Accept"],
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
    return {"message": "Plant Disease Detection API is running (TEST 2)"}

class GoogleQuery(BaseModel):
    query: str

@app.post("/ask-google")
async def ask_google(query: GoogleQuery):
    return StreamingResponse(
        gemini_client.stream_gemini(query.query),
        media_type="text/event-stream"
    )

from fastapi import Form 

@app.post("/predict", response_model=schemas.PredictionResult)
def predict_disease(
    file: UploadFile = File(...), 
    language: str = Form("en"),
    db: Session = Depends(get_db)
):
    import tempfile
    temp_file = os.path.join(tempfile.gettempdir(), f"temp_{file.filename}")
    try:
        # Save temp file
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # PURE AI DIAGNOSIS (No local model to save RAM and build time)
        print(f"Analyzing plant health with Gemini AI (Language: {language})...")
        gemini_result = gemini_client.try_google_gemini(temp_file)
        
        if not gemini_result:
             # Fallback to a mock result if Gemini fails completely
             gemini_result = gemini_client.get_mock_result()

        # Handle potentially stringified 'details' from Gemini
        details_data = gemini_result.get("details", {})
        if isinstance(details_data, str):
            import json
            try:
                details_data = json.loads(details_data)
            except:
                details_data = {
                    "description": details_data,
                    "prevention": "Check plant health closely.",
                    "treatment": "Provide general care."
                }
                
        # Map Gemini result to response schema
        final_result = schemas.PredictionResult(
            plant_name=gemini_result.get("plant_name", "Unknown"),
            disease_name=gemini_result.get("disease_name", "Healthy"),
            confidence=float(gemini_result.get("confidence", 0.9)),
            details=schemas.DiseaseBase(
                name=gemini_result.get("disease_name", "Healthy"),
                severity="Moderate",
                symptoms=details_data.get("description", "No symptoms found.") if isinstance(details_data, dict) else "No symptoms found.",
                prevention=details_data.get("prevention", "No prevention info.") if isinstance(details_data, dict) else "No prevention info.",
                treatments=[
                    schemas.TreatmentBase(
                        type="General",
                        description=details_data.get("treatment", "No treatment info.") if isinstance(details_data, dict) else "No treatment info.",
                        cost_approx="Varies"
                    )
                ]
            )
        )

        # Translation Logic
        if language and language != 'en':
            try:
                translated_text = gemini_client.translate_text(
                    text=final_result.model_dump_json(),
                    target_language=language
                )
                import json
                translated_json = json.loads(translated_text)
                final_result = schemas.PredictionResult(**translated_json)
            except Exception as e:
                print(f"Translation failed: {e}")

        return final_result
        
    except Exception as e:
        print(f"CRITICAL PREDICT FAULT: {str(e)}")
        # Safe fallback so we NEVER return a 500 error that breaks CORS
        return schemas.PredictionResult(
            plant_name="Error in Backend",
            disease_name="Server Processing Failed",
            confidence=0.0,
            details=schemas.DiseaseBase(
                name="Server Fault",
                severity="Critical",
                symptoms=f"Error: {str(e)}",
                prevention="Redeploy or check Logs on Render.",
                treatments=[schemas.TreatmentBase(type="General", description="Contact administrator", cost_approx="N/A")]
            )
        )
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

# User Auth Routes
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not user.email:
         raise HTTPException(status_code=400, detail="Email is required")

    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
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

from typing import Dict, Any

OTP_STORE: Dict[str, Any] = {}

@app.post("/auth/request-otp")
def request_otp(data: schemas.OTPRequest):
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[data.identifier] = {"code": code, "expires": float(time.time() + 300)} # 5 mins
    print(f"\n{'='*40}\n[TEST OTP] Identifier: {data.identifier} | Code: {code}\n{'='*40}\n")
    return {"message": "OTP sent successfully! (Check console for code)"}

@app.post("/auth/verify-otp")
def verify_otp(data: schemas.OTPVerify, db: Session = Depends(get_db)):
    record = OTP_STORE.get(data.identifier)
    current_time: float = time.time()
    
    if not record or record["code"] != data.code or current_time > float(record["expires"]):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    OTP_STORE.pop(data.identifier, None)
    
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
    
    return {"url": f"/uploads/{file.filename}"}

# Places API - Real nearby shops and markets
app.include_router(places_service.router, prefix="/places", tags=["places"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
