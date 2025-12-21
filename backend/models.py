from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    diseases = relationship("Disease", back_populates="plant")

class Disease(Base):
    __tablename__ = "diseases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"))
    severity = Column(String)
    symptoms = Column(Text)
    prevention = Column(Text)
    
    plant = relationship("Plant", back_populates="diseases")
    treatments = relationship("Treatment", back_populates="disease")

class Treatment(Base):
    __tablename__ = "treatments"
    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"))
    type = Column(String) # organic, chemical
    name = Column(String)
    description = Column(Text)
    cost_approx = Column(String)
    
    disease = relationship("Disease", back_populates="treatments")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    plants = relationship("UserPlant", back_populates="owner")

class UserPlant(Base):
    __tablename__ = "user_plants"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plant_name = Column(String) # e.g., "My Tomato #1"
    species = Column(String) # e.g., "Tomato"
    date_planted = Column(String)
    image_url = Column(String)
    
    owner = relationship("User", back_populates="plants")
    logs = relationship("GardenLog", back_populates="user_plant")

class GardenLog(Base):
    __tablename__ = "garden_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_plant_id = Column(Integer, ForeignKey("user_plants.id"))
    date = Column(String)
    note = Column(Text)
    status = Column(String) # Healthy, diseased, etc.
    image_url = Column(String, nullable=True)
    
    user_plant = relationship("UserPlant", back_populates="logs")
