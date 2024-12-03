from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.core.strategy_manager import set_strategy
from typing import Optional
from pydantic import BaseModel
import pandas as pd
from ta.momentum import RSIIndicator as TA_RSIIndicator
from ta.volatility import BollingerBands as TA_BollingerBands
from ta.trend import SMAIndicator as TA_SMAIndicator, MACD as TA_MACD

# RSI Gösterge Modeli
class RSIIndicator(BaseModel):
    name: str
    period: int = 14
    overbought: int = 70
    oversold: int = 30

    def compute(self, data: pd.DataFrame):
        rsi = TA_RSIIndicator(close=data["close"], window=self.period)
        rsi_value = rsi.rsi().iloc[-1]
        return {
            "rsi_value": rsi_value,
            "overbought": self.overbought,
            "oversold": self.oversold
        }

# SMA Crossover Gösterge Modeli
class SMAIndicator(BaseModel):
    name: str
    period: int = 20
    deviation: Optional[float] = 2.0

    def compute(self, data: pd.DataFrame):
        sma = TA_SMAIndicator(close=data["close"], window=self.period)
        sma_value = sma.sma_indicator().iloc[-1]
        return {
            "sma_value": sma_value
        }

# MACD Gösterge Modeli
class MACDIndicator(BaseModel):
    name: str
    fastLength: int = 12
    slowLength: int = 26
    signalLength: int = 9

    def compute(self, data: pd.DataFrame):
        macd = TA_MACD(
            close=data["close"],
            window_slow=self.slowLength,
            window_fast=self.fastLength,
            window_sign=self.signalLength
        )
        return {
            "macd_value": macd.macd().iloc[-1],
            "signal_value": macd.macd_signal().iloc[-1]
        }

# Bollinger Bands Gösterge Modeli
class BollingerBandsIndicator(BaseModel):
    name: str
    period: int = 20
    deviation: Optional[float] = 2.0

    def compute(self, data: pd.DataFrame):
        bb = TA_BollingerBands(
            close=data["close"],
            window=self.period,
            window_dev=self.deviation
        )
        return {
            "upper_band": bb.bollinger_hband().iloc[-1],
            "lower_band": bb.bollinger_lband().iloc[-1],
            "band_width": bb.bollinger_wband().iloc[-1]
        }


# Strategy router'ı
router = APIRouter()

@router.post("/set_strategy")
async def set_strategy_endpoint(indicators: List[dict]):
    """
    Endpoint to set a trading strategy.
    Indicators example:
    [
        {
            "name": "RSI",
            "period": 14,
            "overbought": 70,
            "oversold": 30
        },
        {
            "name": "MACD",
            "fastLength": 12,
            "slowLength": 26,
            "signalLength": 9
        }
    ]
   
    """
    if len(indicators) > 5:
        raise HTTPException(status_code=400, detail="Maximum 4 indicators allowed.")

    print(indicators)
    parsed_indicators = []
    for indicator in indicators:
        try:
            validate_indicator(indicator)
            if indicator["name"] == "RSI":
                parsed_indicators.append(RSIIndicator(**indicator))
            elif indicator["name"] == "SMA Crossover":
                parsed_indicators.append(SMAIndicator(**indicator))
            elif indicator["name"] == "MACD":
                parsed_indicators.append(MACDIndicator(**indicator))
            elif indicator["name"] == "Bollinger Bands":
                parsed_indicators.append(BollingerBandsIndicator(**indicator))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        print(parsed_indicators)
    
    # Stratejiyi set et
    try:
        set_strategy(parsed_indicators)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Yanıt olarak doğru şekilde işlenmiş göstergeleri dönüyoruz
    return {"message": "Strategy set successfully!", "indicators": [i.dict() for i in parsed_indicators]}

def validate_indicator(indicator):
    required_params = {
        "RSI": ["period", "overbought", "oversold"],
        "SMA Crossover": ["period", "deviation"],
        "MACD": ["fastLength", "slowLength", "signalLength"],
        "Bollinger Bands": ["period", "deviation"]
    }
    name = indicator.get("name")
    if name not in required_params:
        raise ValueError(f"Invalid indicator name: {name}")
    missing = [param for param in required_params[name] if param not in indicator]
    if missing:
        raise ValueError(f"Missing parameters for {name}: {missing}")
