from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import hashlib

import models
import schemas
from database import get_db, SessionLocal

router = APIRouter(prefix="/api/users", tags=["users"])

# User auth
USER_SECRET_KEY = "coffee-shop-user-secret-key-change-in-production"
USER_ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


def create_user_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, USER_SECRET_KEY, algorithm=USER_ALGORITHM)


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    if credentials is None:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, USER_SECRET_KEY, algorithms=[USER_ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except jwt.PyJWTError:
        return None


def calculate_points(total: float) -> int:
    """Calculate loyalty points: 10% of order total"""
    return int(total * 0.1)


@router.post("/login", response_model=dict)
def user_login(credentials: schemas.UserBase):
    """
    Login or register a user.
    If user exists by name, return existing user.
    If not, create new user.
    """
    db = SessionLocal()
    try:
        # Try to find existing user by name
        user = db.query(models.User).filter(
            models.User.name == credentials.name
        ).first()

        if user:
            # Existing user - return token
            access_token = create_user_access_token(user.id)
            return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}
        else:
            # New user - create and return token
            new_user = models.User(
                name=credentials.name,
                points=0,
                avatar=credentials.avatar
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            access_token = create_user_access_token(new_user.id)
            return {"access_token": access_token, "token_type": "bearer", "user_id": new_user.id}
    finally:
        db.close()


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Get current authenticated user"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = models.User(
        name=user.name,
        points=user.points,
        avatar=user.avatar
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: str, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update user information"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/{user_id}/profile", response_model=schemas.UserProfileResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Get user profile with order history"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    orders = db.query(models.Order).filter(
        models.Order.user_id == user_id
    ).order_by(models.Order.created_at.desc()).all()

    total_spent = sum(order.total for order in orders)
    total_points_earned = sum(order.points_earned for order in orders)

    order_history = []
    for order in orders:
        order_history.append(schemas.OrderHistoryResponse(
            id=order.id,
            date=order.created_at,
            items=order.items,
            total=order.total,
            pointsEarned=order.points_earned
        ))

    return schemas.UserProfileResponse(
        user=user,
        orderHistory=order_history,
        totalSpent=total_spent,
        totalPointsEarned=total_points_earned
    )


@router.get("/{user_id}/orders", response_model=List[schemas.OrderResponse])
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    """Get all orders for a user"""
    orders = db.query(models.Order).filter(
        models.Order.user_id == user_id
    ).order_by(models.Order.created_at.desc()).all()
    return orders


@router.post("/{user_id}/orders", response_model=schemas.OrderResponse)
def create_order(user_id: str, order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order for a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate drinks exist and calculate total
    total = 0
    db_items = []

    for item_data in order_data.items:
        drink = db.query(models.Drink).filter(
            models.Drink.id == item_data.drink_id,
            models.Drink.is_active == 1
        ).first()
        if not drink:
            raise HTTPException(
                status_code=404,
                detail=f"Drink {item_data.drink_id} not found"
            )

        item_total = item_data.price * item_data.quantity
        total += item_total

        db_item = models.OrderItem(
            drink_id=item_data.drink_id,
            quantity=item_data.quantity,
            bean_option=item_data.bean_option,
            milk_option=item_data.milk_option,
            syrup_option=item_data.syrup_option,
            price=item_data.price
        )
        db_items.append(db_item)

    # Create order
    points_earned = calculate_points(total)

    db_order = models.Order(
        user_id=user_id,
        total=total,
        points_earned=points_earned
    )
    db_order.items = db_items

    # Add points to user
    user.points += points_earned

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order
