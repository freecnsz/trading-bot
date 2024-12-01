import websockets
import asyncio
import json

class BinanceClient:
    def __init__(self, symbol, interval):
        self.symbol = symbol.lower()
        self.interval = interval
        self.url = f"wss://stream.binance.com:9443/ws/{self.symbol}@kline_{self.interval}"

    async def stream_data(self):
        """
        Connect to Binance WebSocket and yield candlestick data.
        """
        async with websockets.connect(self.url) as websocket:
            while True:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    kline = data['k']
                    yield {
                        "open": float(kline['o']),
                        "high": float(kline['h']),
                        "low": float(kline['l']),
                        "close": float(kline['c']),
                        "volume": float(kline['v']),
                        "timestamp": kline['t']
                    }
                    print(kline)
                except Exception as e:
                    print(f"WebSocket error: {e}")
                    break
