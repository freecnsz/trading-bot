from fastapi import FastAPI
from app.endpoints import strategy, trade
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Trading Bot API")

# CORS middleware'ini ekliyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints'i FastAPI'ye bağlama
app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
app.include_router(trade.router, prefix="/trade", tags=["Trade"])

@app.get("/")
async def root():
    return {"message": "Trading Bot API is running!"}
