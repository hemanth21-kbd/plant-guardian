from pydantic import BaseModel
from typing import List, Optional

class TreatmentBase(BaseModel):
    type: str  # 'organic' or 'chemical'
    description: str
    cost_approx: Optional[str] = None

class DiseaseBase(BaseModel):
    name: str
    severity: str
    symptoms: str
    prevention: str
    treatments: List[TreatmentBase]

class PredictionResult(BaseModel):
    plant_name: str
    disease_name: str
    confidence: float
    details: Optional[DiseaseBase] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    id: int
    class Config:
        from_attributes = True

class UserPlantCreate(BaseModel):
    user_id: int
    plant_name: str
    species: str
    date_planted: str
    image_url: Optional[str] = None

class UserPlantResponse(UserPlantCreate):
    id: int
    class Config:
        from_attributes = True

class GardenLogCreate(BaseModel):
    user_plant_id: int
    date: str
    note: str
    status: str
    image_url: Optional[str] = None

class GardenLogResponse(GardenLogCreate):
    id: int
    class Config:
        from_attributes = True
