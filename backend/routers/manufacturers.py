from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db_session import get_db
import models
import schemas

router = APIRouter(prefix="/manufacturers", tags=["manufacturers"])

@router.get("/", response_model=List[schemas.ManufacturerResponse])
def get_manufacturers(db: Session = Depends(get_db)):
    manufacturers = db.query(models.Manufacturer).all()
    return manufacturers

@router.post("/", response_model=schemas.ManufacturerResponse)
def create_manufacturer(manufacturer: schemas.ManufacturerCreate, db: Session = Depends(get_db)):
    db_manufacturer = models.Manufacturer(**manufacturer.model_dump())
    db.add(db_manufacturer)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer

@router.delete("/{manufacturer_id}")
def delete_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if not db_manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    
    db.delete(db_manufacturer)
    db.commit()
    return {"message": "Manufacturer deleted successfully"}
