from fastapi import FastAPI, StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from db_session import init_db, engine
from models import Base
from routers import api_router
import models
from pathlib import Path

app = FastAPI(title="Food Store API", description="Internet store with food delivery")

# Mount static files for uploaded images
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

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
            shop = models.Shop(company_id=company.id, address="Main street 10")
            db.add(shop)
            db.commit()
            db.refresh(shop)
            
            # Create categories
            drink_category = models.Category(name="Drinks", description="Various drinks")
            snacks_category = models.Category(name="Snacks", description="Tasty snacks")
            db.add_all([drink_category, snacks_category])
            db.commit()
            
            # Create manufacturers
            coca_manufacturer = models.Manufacturer(name="Coca Cola", location="USA")
            lays_manufacturer = models.Manufacturer(name="Lays", location="USA")
            db.add_all([coca_manufacturer, lays_manufacturer])
            db.commit()
            db.refresh(coca_manufacturer)
            db.refresh(lays_manufacturer)
            
            # Create courier post
            courier_post = models.Post(name="Courier", salary=500.00)
            db.add(courier_post)
            db.commit()
            db.refresh(courier_post)
            
            # Create sample worker (courier)
            sample_courier = models.Worker(
                full_name="John Doe",
                email="john@example.com",
                phone_number="+1234567890",
                post_id=courier_post.id
            )
            db.add(sample_courier)
            db.commit()
            db.refresh(sample_courier)
            
            # Create products
            cola_product = models.Product(
                shop_id=shop.id,
                category_id=drink_category.id,
                manufacturer_id=coca_manufacturer.id,
                name="Cola 1L",
                price=2.50,
                stock_amount=100
            )
            chips_product = models.Product(
                shop_id=shop.id,
                category_id=snacks_category.id,
                manufacturer_id=lays_manufacturer.id,
                name="Chips",
                price=1.80,
                stock_amount=50
            )
            db.add_all([cola_product, chips_product])
            db.commit()
            
            # Create image group and images for products
            cola_image_group = models.ProductImageGroup(product_id=cola_product.id)
            db.add(cola_image_group)
            db.commit()
            db.refresh(cola_image_group)
            
            cola_image = models.Image(
                image_group_id=cola_image_group.id,
                link="https://example.com/images/cola.jpg"
            )
            db.add(cola_image)
            db.commit()
            
            chips_image_group = models.ProductImageGroup(product_id=chips_product.id)
            db.add(chips_image_group)
            db.commit()
            db.refresh(chips_image_group)
            
            chips_image = models.Image(
                image_group_id=chips_image_group.id,
                link="https://example.com/images/chips.jpg"
            )
            db.add(chips_image)
            db.commit()
            
            print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Food Store API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
