# app/core/strategy_manager.py

from typing import List

# Global variable to store the current strategy
strategy = []

def set_strategy(indicators: List[dict]):
    """
    Sets the trading strategy based on the given list of indicators.
    """
    global strategy
    strategy = indicators

    print("Strategy set to:", strategy)

def get_strategy():
    """
    Returns the current trading strategy.
    """
    global strategy
    return strategy
