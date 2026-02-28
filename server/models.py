from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, default="Пользователь")
    points = Column(Integer, default=0)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Drink(Base):
    __tablename__ = "drinks"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False, default=0)
    image = Column(String, nullable=False)
    is_active = Column(Integer, default=1)

    order_items = relationship("OrderItem", back_populates="drink")


class BeanOption(Base):
    __tablename__ = "bean_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    price = Column(Integer, default=0)


class MilkOption(Base):
    __tablename__ = "milk_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    price = Column(Integer, default=0)


class SyrupOption(Base):
    __tablename__ = "syrup_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    price = Column(Integer, default=0)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    total = Column(Float, nullable=False, default=0)
    points_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    drink_id = Column(String, ForeignKey("drinks.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    bean_option = Column(String, nullable=False)
    milk_option = Column(String, nullable=False)
    syrup_option = Column(String, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    drink = relationship("Drink", back_populates="order_items")
