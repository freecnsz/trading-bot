# app/core/indicator_calculation.py

import pandas as pd
from typing import List
from app.endpoints.strategy import RSIIndicator, SMAIndicator, MACDIndicator, BollingerBandsIndicator

def calculate_indicators(historical_data: pd.DataFrame, strategy: List):
    """
    Calculates technical indicators using historical data.

    Parameters:
        historical_data (pd.DataFrame): Historical market data with a 'close' column.
        strategy (list): A list of instantiated indicator objects.
        
    Returns:
        dict: Calculated indicator values.
    """
    if "close" not in historical_data.columns:
        raise ValueError("The input data must include a 'close' column.")

    results = {}
    for indicator in strategy:
        try:
            results.update(indicator.compute(historical_data))
        except Exception as e:
            print(f"Error calculating {indicator.__class__.__name__}: {e}")

    return results
