from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/drinks", tags=["drinks"])


@router.get("", response_model=List[schemas.DrinkResponse])
def get_all_drinks(db: Session = Depends(get_db)):
    """Get all available drinks"""
    drinks = db.query(models.Drink).filter(models.Drink.is_active == 1).all()
    return drinks


@router.get("/{drink_id}", response_model=schemas.DrinkResponse)
def get_drink(drink_id: str, db: Session = Depends(get_db)):
    """Get a specific drink by ID"""
    drink = db.query(models.Drink).filter(
        models.Drink.id == drink_id,
        models.Drink.is_active == 1
    ).first()
    if not drink:
        raise HTTPException(status_code=404, detail="Drink not found")
    return drink


@router.get("/options/beans", response_model=List[schemas.OptionResponse])
def get_bean_options(db: Session = Depends(get_db)):
    """Get all bean options"""
    options = db.query(models.BeanOption).all()
    return options


@router.get("/options/milk", response_model=List[schemas.OptionResponse])
def get_milk_options(db: Session = Depends(get_db)):
    """Get all milk options"""
    options = db.query(models.MilkOption).all()
    return options


@router.get("/options/syrups", response_model=List[schemas.OptionResponse])
def get_syrup_options(db: Session = Depends(get_db)):
    """Get all syrup options"""
    options = db.query(models.SyrupOption).all()
    return options
