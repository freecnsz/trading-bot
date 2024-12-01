import asyncio
from app.core.binance_client import BinanceClient
from app.endpoints.websocket import broadcast_message
from app.utils.indicators_calculations import calculate_indicators
from app.core.strategy_manager import get_strategy


# Global variables for trading simulation
balance = 10000  # Initial balance for the trading simulation
positions = []   # Current open positions
is_trading = False
trading_task = None


async def trading_logic(symbol, interval):
    """
    Core trading logic that streams data, calculates indicators using historical and live data, and executes trades.
    """
    global balance, positions, is_trading

    # Binance Client for live data
    client = BinanceClient(symbol, interval)
    strategy = get_strategy()
    print(f"Strategy: {strategy}")

    # Step 1: Fetch historical data
    print("Fetching historical data...")
    historical_data = fetch_binance_historical_data(symbol, interval, limit=500)
    print("Historical data fetched.")

    # Step 2: Start streaming live data
    print(f"Starting simulation for {symbol} on {interval} interval.")
    async for live_data in client.stream_data():
        print(live_data)
        if not is_trading:  # Stop the loop if trading is disabled
            print("Trading logic stopped.")
            break

        # Step 3: Add live data to historical data
        print(f"Adding live data to historical data...")
        new_row = pd.DataFrame([live_data])  # Convert live data to DataFrame
        historical_data = pd.concat([historical_data, new_row], ignore_index=True)
        print(f"Live data added to historical data.")

        # Keep only the most recent 500 rows to save memory
        historical_data = historical_data.iloc[-500:]  # Keep only the last 500 rows

        # Step 4: Calculate indicators
        indicators = calculate_indicators(historical_data, strategy)
        print(f"Indicators: {indicators}")
        signal = generate_signal(historical_data, strategy, indicators)
        print(f"Signal: {signal}")

        # Step 5: Execute trades based on the signal
        if signal == "BUY" and balance > 0:
            # Simulate a buy
            amount = balance / live_data["close"]
            positions.append({"symbol": symbol, "price": live_data["close"], "amount": amount})
            balance = balance - amount * live_data["close"]

             #Calculate unrealized profit/loss as a percentage (if applicable)
            unrealized_profit_loss_percent = sum(
                [(live_data["close"] - position["price"]) / position["price"] for position in positions]
            ) * 100
            

            # Broadcast BUY action
            await broadcast_message({
                "action": "BUY",
                "symbol": symbol.upper(),
                "price": live_data["close"],
                "amount": amount,
                "timestamp": live_data["timestamp"],
                "balance": balance,
                "positions": positions,  # Send positions for better visibility
                "profit_loss": unrealized_profit_loss_percent  # Potansiyel kar/zarar
            })
            
            print(f"BUY signal: Bought at {live_data['close']}, Amount: {amount}, Unrealized P/L: {unrealized_profit_loss_percent}, New Balance: {balance}")

        elif signal == "SELL" and positions:
            # Simulate a sell
            position = positions.pop()
            sell_price = live_data["close"]
            buy_price = position["price"]
            amount = position["amount"]
            profit_loss_percent = ((sell_price - buy_price) / buy_price) * 100
            balance += amount * sell_price

            # Broadcast SELL action
            await broadcast_message({
                "action": "SELL",
                "symbol": symbol.upper(),
                "price": sell_price,
                "amount": amount,
                "timestamp": live_data["timestamp"],
                "balance": balance,
                "profit_loss": profit_loss_percent,
                "positions": positions  # Send remaining positions
            })
            
            print(f"SELL signal: Sold at {sell_price}, Profit/Loss: {profit_loss_percent}, New Balance: {balance}")

        elif signal == "HOLD":
            print(f"HOLD signal: No action taken.")

        # Log balance and positions for debugging
        print(f"Current Balance: {balance}, Positions: {positions}")



async def start_trading(symbol, interval):
    """
    Start the trading simulation by creating an asyncio task.
    """
    global is_trading, trading_task
    if not is_trading:
        is_trading = True
        trading_task = asyncio.create_task(trading_logic(symbol, interval))
        print("Trading started.")


def stop_trading():
    """
    Stop the trading simulation.
    """
    global is_trading, trading_task, balance
    if is_trading:
        is_trading = False
        if trading_task:
            trading_task.cancel()  # Cancel the asyncio task if it is running
            trading_task = None
            balance = 10000  # Reset the balance
        print("Trading simulation stopped.")
        

from binance.client import Client
import pandas as pd

# Binance Client setup (API key ve secret gerekli değilse, boş bırakabilirsiniz)
client = Client()

def fetch_binance_historical_data(symbol, interval, limit=500):
    """
    Fetch historical candlestick (kline) data using Binance API.

    Parameters:
        symbol (str): The trading pair symbol (e.g., "BTCUSDT").
        interval (str): The candlestick interval (e.g., "1m", "5m", "1h", "1d").
        limit (int): Number of candlesticks to fetch (default is 500, max is 1000).

    Returns:
        pd.DataFrame: A DataFrame containing the historical candlestick data.
                      Columns: ['open_time', 'open', 'high', 'low', 'close', 'volume', ...]
    """
    # Ensure symbol is uppercase and remove extra spaces
    symbol = symbol.strip().upper()

    # Fetch historical kline data
    try:
        klines = client.get_klines(symbol=symbol, interval=interval, limit=limit)
    except Exception as e:
        print(f"Error fetching Binance data: {e}")
        return pd.DataFrame()  # Return an empty DataFrame on error
    
    # Convert to a pandas DataFrame
    df = pd.DataFrame(klines, columns=[
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "quote_asset_volume", "number_of_trades",
        "taker_buy_base_asset_volume", "taker_buy_quote_asset_volume", "ignore"
    ])

    # Convert relevant columns to numeric
    numeric_columns = ["open", "high", "low", "close", "volume"]
    df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors="coerce")

    # Convert time columns to datetime
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
    df["close_time"] = pd.to_datetime(df["close_time"], unit="ms")

    return df

def generate_signal(historical_data, strategy, indicators):
    """
    Generates a trading signal ('BUY', 'SELL', 'HOLD') based on calculated indicator values and user-defined strategy.

    Parameters:
        historical_data (pd.DataFrame): Historical market data with a 'close' column.
        strategy (list): A list of indicator configurations with their parameters.
        indicators (dict): A dictionary of computed indicator values.

    Returns:
        str: 'BUY', 'SELL', or 'HOLD'
    """
    # Validate inputs
    if historical_data.empty or "close" not in historical_data.columns:
        raise ValueError("Historical data is missing or does not contain a 'close' column.")
    if not isinstance(indicators, dict) or not isinstance(strategy, list):
        raise ValueError("Invalid input format: 'indicators' must be a dict, and 'strategy' must be a list.")

    # Get the last close price
    close_price = historical_data["close"].iloc[-1]

    # Debug: Print the close price
    print(f"Last Close Price: {close_price}")

    # Flags for signals
    buy_signal = False
    sell_signal = False

    # Iterate through user-defined strategy
    for ind in strategy:
        if not hasattr(ind, "name"):
            print("Strategy configuration is missing the 'name' attribute.")
            continue

        ind_name = ind.name.lower()

        # Debug: Print the indicator being processed
        print(f"Processing Indicator: {ind_name}")

        # Dynamic handling of indicators based on their names
        if ind_name == "rsi" and "rsi_value" in indicators:
            rsi_value = indicators["rsi_value"]
            overbought = getattr(ind, "overbought", 70)
            oversold = getattr(ind, "oversold", 30)

            # Debug: Print RSI values
            print(f"RSI Value: {rsi_value}, Overbought: {overbought}, Oversold: {oversold}")

            if rsi_value < oversold:
                buy_signal = True
            elif rsi_value > overbought:
                sell_signal = True

        elif ind_name == "sma crossover" and "sma_value" in indicators:
            sma_value = indicators["sma_value"]

            # Debug: Print SMA values
            print(f"SMA Value: {sma_value}, Close Price: {close_price}")

            if close_price > sma_value:
                buy_signal = True
            elif close_price < sma_value:
                sell_signal = True

        elif ind_name == "macd" and "macd_value" in indicators and "signal_value" in indicators:
            macd_value = indicators["macd_value"]
            signal_value = indicators["signal_value"]

            # Debug: Print MACD values
            print(f"MACD Value: {macd_value}, Signal Value: {signal_value}")

            if macd_value > signal_value:
                buy_signal = True
            elif macd_value < signal_value:
                sell_signal = True

        elif ind_name == "bollinger bands" and "upper_band" in indicators and "lower_band" in indicators:
            upper_band = indicators["upper_band"]
            lower_band = indicators["lower_band"]

            # Debug: Print Bollinger Band values
            print(f"Upper Band: {upper_band}, Lower Band: {lower_band}, Close Price: {close_price}")

            if close_price < lower_band:
                buy_signal = True
            elif close_price > upper_band:
                sell_signal = True

    # Combine signals and return the final decision
    print(f"Buy Signal: {buy_signal}, Sell Signal: {sell_signal}")

    if buy_signal and not sell_signal:
        return "BUY"
    elif sell_signal and not buy_signal:
        return "SELL"
    else:
        return "HOLD"

    
