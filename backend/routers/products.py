from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from db_session import get_db
import models
import schemas
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/products", tags=["products"])

# Directory for storing uploaded images
UPLOAD_DIR = Path("/app/uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.get("/category/{category_id}", response_model=List[schemas.ProductResponse])
def get_products_by_category(category_id: int, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.category_id == category_id).all()
    return products

# Image management endpoints
@router.post("/{product_id}/images", response_model=schemas.ImageResponse)
def add_product_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Add an image to a product by uploading a file. Creates image group if it doesn't exist."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate file type
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
    
    # Get or create image group for this product
    image_group = db.query(models.ProductImageGroup).filter(
        models.ProductImageGroup.product_id == product_id
    ).first()
    
    if not image_group:
        image_group = models.ProductImageGroup(product_id=product_id)
        db.add(image_group)
        db.commit()
        db.refresh(image_group)
    
    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create the image record with relative path
    image_link = f"/uploads/images/{unique_filename}"
    image = models.Image(
        image_group_id=image_group.id,
        link=image_link
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return image

@router.get("/{product_id}/images", response_model=List[schemas.ImageResponse])
def get_product_images(product_id: int, db: Session = Depends(get_db)):
    """Get all images for a product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    image_group = db.query(models.ProductImageGroup).filter(
        models.ProductImageGroup.product_id == product_id
    ).first()
    
    if not image_group:
        return []
    
    return image_group.images

@router.put("/{product_id}/images/{image_id}", response_model=schemas.ImageResponse)
def update_product_image(product_id: int, image_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Update an image file for a product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Verify image belongs to this product
    image_group = db.query(models.ProductImageGroup).filter(
        models.ProductImageGroup.product_id == product_id
    ).first()
    
    if not image_group or image.image_group_id != image_group.id:
        raise HTTPException(status_code=400, detail="Image does not belong to this product")
    
    # Validate file type
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
    
    # Delete old file if it exists
    old_path = Path("/app") / image.link.lstrip("/")
    if old_path.exists():
        old_path.unlink()
    
    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save the new file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update the image record with new path
    image.link = f"/uploads/images/{unique_filename}"
    db.commit()
    db.refresh(image)
    
    return image

@router.delete("/{product_id}/images/{image_id}")
def delete_product_image(product_id: int, image_id: int, db: Session = Depends(get_db)):
    """Delete an image from a product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Verify image belongs to this product
    image_group = db.query(models.ProductImageGroup).filter(
        models.ProductImageGroup.product_id == product_id
    ).first()
    
    if not image_group or image.image_group_id != image_group.id:
        raise HTTPException(status_code=400, detail="Image does not belong to this product")
    
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted successfully"}
