from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import jwt
import hashlib

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Simple JWT-like auth (for demo purposes)
SECRET_KEY = "coffee-shop-secret-key-change-in-production"
ALGORITHM = "HS256"

# Hardcoded admin credentials (in production, use proper auth)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = hashlib.sha256("admin123".encode()).hexdigest()

security = HTTPBearer(auto_error=False)


def verify_password(password: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == ADMIN_PASSWORD_HASH


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/login")
def admin_login(credentials: schemas.AdminLogin):
    """Admin login endpoint"""
    print(f"Login attempt: username={credentials.username}, password={credentials.password}")
    print(f"Expected username: {ADMIN_USERNAME}")
    print(f"Expected password hash: {ADMIN_PASSWORD_HASH}")
    print(f"Provided password hash: {hashlib.sha256(credentials.password.encode()).hexdigest()}")
    
    if credentials.username != ADMIN_USERNAME or not verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": credentials.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all orders (admin only)"""
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return orders


@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(models.User).all()
    return users


@router.get("/drinks", response_model=List[schemas.DrinkResponse])
def get_all_drinks_admin(
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all drinks including inactive (admin only)"""
    drinks = db.query(models.Drink).all()
    return drinks


@router.post("/drinks", response_model=schemas.DrinkResponse)
def create_drink_admin(
    drink: schemas.DrinkCreate,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new drink (admin only)"""
    db_drink = models.Drink(**drink.model_dump())
    db.add(db_drink)
    db.commit()
    db.refresh(db_drink)
    return db_drink


@router.put("/drinks/{drink_id}", response_model=schemas.DrinkResponse)
def update_drink_admin(
    drink_id: str,
    drink_update: schemas.DrinkUpdate,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a drink (admin only)"""
    db_drink = db.query(models.Drink).filter(models.Drink.id == drink_id).first()
    if not db_drink:
        raise HTTPException(status_code=404, detail="Drink not found")
    
    update_data = drink_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_drink, field, value)
    
    db.commit()
    db.refresh(db_drink)
    return db_drink


@router.delete("/drinks/{drink_id}")
def delete_drink_admin(
    drink_id: str,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a drink (admin only)"""
    db_drink = db.query(models.Drink).filter(models.Drink.id == drink_id).first()
    if not db_drink:
        raise HTTPException(status_code=404, detail="Drink not found")
    
    db.delete(db_drink)
    db.commit()
    return {"message": "Drink deleted"}
