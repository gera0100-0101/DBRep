from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from decimal import Decimal

# Product schemas
class ProductBase(BaseModel):
    name: str
    price: Decimal
    weight: Optional[Decimal] = None
    calories: Optional[Decimal] = None
    structure: Optional[str] = None
    stock_amount: int = 0
    shop_id: int
    category_id: Optional[int] = None
    manufacturer_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    calories: Optional[Decimal] = None
    structure: Optional[str] = None
    stock_amount: Optional[int] = None
    shop_id: Optional[int] = None
    category_id: Optional[int] = None
    manufacturer_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    
    class Config:
        from_attributes = True

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Manufacturer schemas
class ManufacturerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None

class ManufacturerCreate(ManufacturerBase):
    pass

class ManufacturerResponse(ManufacturerBase):
    id: int
    
    class Config:
        from_attributes = True

# Shop schemas
class ShopBase(BaseModel):
    company_id: int
    address: str

class ShopCreate(ShopBase):
    pass

class ShopResponse(ShopBase):
    id: int
    
    class Config:
        from_attributes = True

# Company schemas
class CompanyBase(BaseModel):
    company_name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    
    class Config:
        from_attributes = True

# Image schemas
class ImageBase(BaseModel):
    link: str

class ImageCreate(ImageBase):
    image_group_id: int

class ImageResponse(ImageBase):
    id: int
    image_group_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Customer schemas
class CustomerBase(BaseModel):
    name: str
    phone_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    
    class Config:
        from_attributes = True

# Payment schemas
class PaymentBase(BaseModel):
    bank_name: str
    payment_link: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    
    class Config:
        from_attributes = True

# Post schemas
class PostBase(BaseModel):
    name: str
    salary: Decimal

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    
    class Config:
        from_attributes = True

# Worker schemas
class WorkerBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    post_id: Optional[int] = None

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    post_id: Optional[int] = None

class WorkerResponse(WorkerBase):
    id: int
    post: Optional[PostResponse] = None
    
    class Config:
        from_attributes = True

# Check schema (must be before OrderResponse due to forward reference)
class CheckBase(BaseModel):
    order_id: int
    total_price: Decimal

class CheckCreate(CheckBase):
    created_date: Optional[date] = None
    created_time: Optional[time] = None

class CheckResponse(CheckBase):
    id: int
    created_date: date
    created_time: time
    
    class Config:
        from_attributes = True

# Order Item schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal

class OrderItemCreate(OrderItemBase):
    order_id: int

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    customer_id: int
    delivery_address: str
    payment_id: Optional[int] = None
    courier_id: Optional[int] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    courier_id: Optional[int] = None

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    status: str
    items: List[OrderItemResponse] = []
    courier: Optional[WorkerResponse] = None
    customer: Optional[CustomerResponse] = None
    check: Optional[CheckResponse] = None
    
    class Config:
        from_attributes = True

class AdminOrderResponse(OrderBase):
    id: int
    created_at: datetime
    status: str
    items: List[OrderItemResponse] = []
    courier: Optional[WorkerResponse] = None
    customer: Optional[CustomerResponse] = None
    check: Optional[CheckResponse] = None
    payment: Optional[PaymentResponse] = None
    
    class Config:
        from_attributes = True

# Cart item schema (for frontend)
class CartItem(BaseModel):
    product_id: int
    quantity: int
    name: str
    price: Decimal
    image_url: Optional[str] = None

# Cart schema
class Cart(BaseModel):
    items: List[CartItem] = []
    total: Decimal = Decimal('0.00')

# Checkout schema
class CheckoutRequest(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    delivery_address: str
    payment_method: str
    items: List[CartItem]

# Auth schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
