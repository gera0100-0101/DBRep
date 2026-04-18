from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db_session import init_db, engine
from models import Base
from routers import api_router
import models

app = FastAPI(title="Food Store API", description="Internet store with food delivery")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed initial data if empty
    from sqlalchemy.orm import Session
    from db_session import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if data exists
        if db.query(models.Company).count() == 0:
            # Create company
            company = models.Company(company_name="Fresh Market LLC")
            db.add(company)
            db.commit()
            db.refresh(company)
            
            # Create shop
            shop = models.Company(company_id=company.id, address="Main street 10")
            db.add(shop)
            db.commit()
            db.refresh(shop)
            
            # Create categories
            drink_category = models.Category(name="Drinks")
            snacks_category = models.Category(name="Snacks")
            db.add_all([drink_category, snacks_category])
            db.commit()
            
            # Create manufacturers
            coca_manufacturer = models.Manufacturer(name="Coca Cola")
            lays_manufacturer = models.Manufacturer(name="Lays")
            db.add_all([coca_manufacturer, lays_manufacturer])
            db.commit()
            
            print("Database seeded successfully!")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Food Store API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
