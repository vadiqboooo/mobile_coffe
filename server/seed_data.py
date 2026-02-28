from sqlalchemy.orm import Session
import models


def seed_database(db: Session):
    """Seed the database with initial data"""

    # Check if already seeded
    if db.query(models.Drink).first():
        print("Database already seeded")
        return

    # Seed drinks
    drinks_data = [
        {
            "id": "americano",
            "name": "Американо",
            "description": "Классический эспрессо с горячей водой",
            "price": 150,
            "image": "https://images.unsplash.com/photo-1622465413095-2ee67c192522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBhbWVyaWNhbm98ZW58MXx8fHwxNzcxMDUzMTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            "id": "cappuccino",
            "name": "Капучино",
            "description": "Эспрессо с молочной пеной",
            "price": 180,
            "image": "https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDF8fHx8MTc3MTAyMTY1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            "id": "latte",
            "name": "Латте",
            "description": "Нежный кофе с молоком",
            "price": 190,
            "image": "https://images.unsplash.com/photo-1669162364316-a74b2d661d1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGNvZmZlZSUyMGFydHxlbnwxfHx8fDE3NzEwNDUyODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            "id": "filter",
            "name": "Фильтр кофе",
            "description": "Альтернативный способ заваривания",
            "price": 170,
            "image": "https://images.unsplash.com/photo-1637944220531-5f6fd15c1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWx0ZXIlMjBjb2ZmZWUlMjBwb3VyJTIwb3ZlcnxlbnwxfHx8fDE3NzEwNTMxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
        {
            "id": "hot-chocolate",
            "name": "Горячий шоколад",
            "description": "Согревающий напиток из шоколада",
            "price": 200,
            "image": "https://images.unsplash.com/photo-1643641543738-04aac0809fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBjaG9jb2xhdGUlMjBkcmlua3xlbnwxfHx8fDE3NzEwNTMxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        },
    ]

    for drink_data in drinks_data:
        drink = models.Drink(**drink_data)
        db.add(drink)

    # Seed bean options
    bean_options = [
        {"id": "arabica", "name": "Арабика", "price": 0},
        {"id": "robusta", "name": "Робуста", "price": 10},
        {"id": "blend", "name": "Смесь", "price": 5},
    ]
    for option in bean_options:
        db.add(models.BeanOption(**option))

    # Seed milk options
    milk_options = [
        {"id": "regular", "name": "Обычное", "price": 0},
        {"id": "almond", "name": "Миндальное", "price": 30},
        {"id": "oat", "name": "Овсяное", "price": 30},
        {"id": "soy", "name": "Соевое", "price": 25},
        {"id": "coconut", "name": "Кокосовое", "price": 35},
    ]
    for option in milk_options:
        db.add(models.MilkOption(**option))

    # Seed syrup options
    syrup_options = [
        {"id": "none", "name": "Без сиропа", "price": 0},
        {"id": "vanilla", "name": "Ваниль", "price": 40},
        {"id": "caramel", "name": "Карамель", "price": 40},
        {"id": "hazelnut", "name": "Фундук", "price": 40},
        {"id": "chocolate", "name": "Шоколад", "price": 40},
    ]
    for option in syrup_options:
        db.add(models.SyrupOption(**option))

    # Create default user
    default_user = models.User(
        id="user-1",
        name="Пользователь",
        points=250
    )
    db.add(default_user)

    db.commit()
    print("Database seeded successfully!")

    # Ensure default user exists (separate from drinks seeding)
    ensure_default_user(db)


def ensure_default_user(db: Session):
    """Ensure the default user exists"""
    default_user = db.query(models.User).filter(models.User.id == "user-1").first()
    if not default_user:
        default_user = models.User(
            id="user-1",
            name="Пользователь",
            points=250
        )
        db.add(default_user)
        db.commit()
        print("Default user created")
    else:
        print("Default user already exists")
