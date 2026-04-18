from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from db_session import get_db
import models
import schemas

router = APIRouter(prefix="/workers", tags=["workers"])

@router.get("/", response_model=List[schemas.WorkerResponse])
def get_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workers."""
    workers = db.query(models.Worker).offset(skip).limit(limit).all()
    return workers

@router.get("/{worker_id}", response_model=schemas.WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a specific worker by ID."""
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.post("/", response_model=schemas.WorkerResponse)
def create_worker(worker: schemas.WorkerCreate, db: Session = Depends(get_db)):
    """Create a new worker."""
    # Check if post exists if post_id is provided
    if worker.post_id:
        post = db.query(models.Post).filter(models.Post.id == worker.post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
    
    db_worker = models.Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.put("/{worker_id}", response_model=schemas.WorkerResponse)
def update_worker(worker_id: int, worker: schemas.WorkerUpdate, db: Session = Depends(get_db)):
    """Update a worker."""
    db_worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Check if post exists if post_id is provided
    update_data = worker.model_dump(exclude_unset=True)
    if 'post_id' in update_data and update_data['post_id']:
        post = db.query(models.Post).filter(models.Post.id == update_data['post_id']).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
    
    for key, value in update_data.items():
        setattr(db_worker, key, value)
    
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.delete("/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    """Delete a worker."""
    db_worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    db.delete(db_worker)
    db.commit()
    return {"message": "Worker deleted successfully"}

@router.get("/couriers/", response_model=List[schemas.WorkerResponse])
def get_couriers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workers with courier post."""
    # Find courier post
    courier_post = db.query(models.Post).filter(models.Post.name.ilike("%courier%")).first()
    
    if not courier_post:
        return []
    
    couriers = db.query(models.Worker).filter(
        models.Worker.post_id == courier_post.id
    ).offset(skip).limit(limit).all()
    
    return couriers
