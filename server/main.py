from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routes import drinks, users, admin
from seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Seed database
db = SessionLocal()
seed_database(db)
db.close()

app = FastAPI(title="Coffee Shop API", version="1.0.0")

# CORS middleware - allow client to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(drinks.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Coffee Shop API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
