from fastapi import APIRouter, HTTPException
from app.core.trading_engine import start_trading, stop_trading
from app.endpoints.websocket import start_server, stop_server



router = APIRouter()

@router.post("/start_trade")
async def start_trade_endpoint(symbol: str, interval: str):
    """
    Start trading simulation for a given symbol and interval.
    """
    if not symbol or not interval:
        raise HTTPException(status_code=400, detail="Symbol and interval are required.")
    
    try:
        await start_trading(symbol, interval)
        await start_server()
        return {"message": f"Trading simulation started for {symbol} with {interval} interval."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop_trade")
async def stop_trade_endpoint():
    """
    Stop the trading simulation.
    """
    balance = 10000  # Reset balance to 10000
    try:
        stop_trading()
        await stop_server()  # Async stop_server çağrısı
        json_data = {
            "balance": balance,
            "message": "Trading simulation stopped."
        }
        return json_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


