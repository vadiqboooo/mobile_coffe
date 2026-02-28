from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Drink schemas
class DrinkBase(BaseModel):
    name: str
    description: str
    price: int
    image: str


class DrinkCreate(DrinkBase):
    pass


class DrinkResponse(DrinkBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True


# Customization options schemas
class OptionBase(BaseModel):
    name: str
    price: int = 0


class OptionCreate(OptionBase):
    pass


class OptionResponse(OptionBase):
    id: str

    class Config:
        from_attributes = True


# Order Item schemas
class OrderItemBase(BaseModel):
    drink_id: str
    quantity: int = 1
    bean_option: str
    milk_option: str
    syrup_option: str
    price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: str
    order_id: str
    drink: Optional[DrinkResponse] = None

    class Config:
        from_attributes = True


# Order schemas
class OrderBase(BaseModel):
    total: float
    points_earned: int = 0


class OrderCreate(OrderBase):
    user_id: str
    items: List[OrderItemCreate]


class OrderResponse(OrderBase):
    id: str
    user_id: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    name: str
    points: int = 0
    avatar: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    points: Optional[int] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderHistoryResponse(BaseModel):
    id: str
    date: datetime
    items: List[OrderItemResponse]
    total: float
    pointsEarned: int

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    user: UserResponse
    orderHistory: List[OrderHistoryResponse]
    totalSpent: float
    totalPointsEarned: int


class AdminLogin(BaseModel):
    username: str
    password: str


class DrinkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
