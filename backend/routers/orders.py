from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db_session import get_db
import models
import schemas
from decimal import Decimal

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/checkout", response_model=schemas.OrderResponse)
def checkout(checkout_request: schemas.CheckoutRequest, db: Session = Depends(get_db)):
    # Create or get customer
    customer = db.query(models.Customer).filter(
        models.Customer.phone_number == checkout_request.customer_phone
    ).first()
    
    if not customer:
        customer = models.Customer(
            name=checkout_request.customer_name,
            phone_number=checkout_request.customer_phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    
    # Create payment
    payment = models.Payment(
        bank_name=checkout_request.payment_method,
        payment_link=None
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Create order
    total_price = Decimal('0.00')
    for item in checkout_request.items:
        total_price += item.price * item.quantity
    
    order = models.Order(
        customer_id=customer.id,
        payment_id=payment.id,
        delivery_address=checkout_request.delivery_address,
        status='new'
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items and update stock
    for item in checkout_request.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock_amount < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")
        
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.price
        )
        db.add(order_item)
        
        # Update stock
        product.stock_amount -= item.quantity
    
    db.commit()
    
    # Create check
    check = models.Check(
        order_id=order.id,
        total_price=total_price
    )
    db.add(check)
    db.commit()
    
    # Refresh order with items
    db.refresh(order)
    return order

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    db.refresh(order)
    return order
