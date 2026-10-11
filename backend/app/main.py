import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import Base, engine
from app.routers import (
    auth_router,
    products_router,
    categories_router,
    cart_router,
    orders_router,
    farmers_router,
    admin_router,
)

load_dotenv()

# Automatically create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KisanBazar – Farmer Marketplace API",
    description="A direct agricultural marketplace connecting local farmers with consumers.",
    version="1.0.0",
)

# CORS Configuration
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(farmers_router)
app.include_router(admin_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "KisanBazar – Farmer Marketplace API",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
