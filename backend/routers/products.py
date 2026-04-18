from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from db_session import get_db
import models
import schemas

router = APIRouter(prefix="/products", tags=["products"])

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
def add_product_image(product_id: int, image_data: schemas.ImageCreate, db: Session = Depends(get_db)):
    """Add an image to a product. Creates image group if it doesn't exist."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create image group for this product
    image_group = db.query(models.ProductImageGroup).filter(
        models.ProductImageGroup.product_id == product_id
    ).first()
    
    if not image_group:
        image_group = models.ProductImageGroup(product_id=product_id)
        db.add(image_group)
        db.commit()
        db.refresh(image_group)
    
    # Create the image
    image = models.Image(
        image_group_id=image_group.id,
        link=image_data.link
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
def update_product_image(product_id: int, image_id: int, image_data: schemas.ImageBase, db: Session = Depends(get_db)):
    """Update an image link for a product."""
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
    
    image.link = image_data.link
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
