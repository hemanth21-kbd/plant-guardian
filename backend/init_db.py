from sqlalchemy.orm import Session
from . import models, database

def init_db():
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=database.engine)
    
    db = database.SessionLocal()
    
    # Check if data exists
    if db.query(models.Plant).count() > 0:
        print("Database already seeded.")
        return

    # Create Plants
    tomato = models.Plant(name="Tomato")
    potato = models.Plant(name="Potato")
    corn = models.Plant(name="Corn")
    
    db.add_all([tomato, potato, corn])
    db.commit()
    
    # Create Diseases & Treatments
    # Tomato Early Blight
    early_blight = models.Disease(
        name="Early Blight",
        plant=tomato,
        severity="Moderate",
        symptoms="Dark spots on leaves, yellowing.",
        prevention="Crop rotation, proper spacing."
    )
    
    eb_treatment_organic = models.Treatment(
        disease=early_blight,
        type="Organic",
        name="Neem Oil",
        description="Spray Neem oil every 7 days.",
        cost_approx="$5 - $10"
    )
    
    eb_treatment_chem = models.Treatment(
        disease=early_blight,
        type="Chemical",
        name="Copper Fungicide",
        description="Apply copper-based fungicide.",
        cost_approx="$15 - $20"
    )
    
    db.add(early_blight)
    db.add(eb_treatment_organic)
    db.add(eb_treatment_chem)
    
    # Tomato Late Blight
    late_blight = models.Disease(
        name="Late Blight",
        plant=tomato,
        severity="High",
        symptoms="Large dark patches on leaves, white fungal growth.",
        prevention="Avoid overhead watering, use resistant varieties."
    )
    
    lb_treatment = models.Treatment(
        disease=late_blight,
        type="Chemical",
        name="Chlorothalonil",
        description="Apply fungicides containing chlorothalonil.",
        cost_approx="$20 - $30"
    )
    
    db.add(late_blight)
    db.add(lb_treatment)

    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    init_db()
