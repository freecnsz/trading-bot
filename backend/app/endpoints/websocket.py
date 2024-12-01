import json
from typing import Set
import asyncio
import websockets

websocket_server = None

connected_clients: Set[websockets.WebSocketServerProtocol] = set()

async def websocket_handler(websocket):
    """
    WebSocket bağlantısını yöneten fonksiyon.
    """
    global connected_clients
    connected_clients.add(websocket)
    print(f"Yeni bir WebSocket istemcisi bağlandı. Toplam: {len(connected_clients)}")
    
    try:
        while True:
            message = await websocket.recv()
            print(f"Alınan mesaj: {message}")
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"Bir WebSocket istemcisi ayrıldı. Toplam: {len(connected_clients)}")

async def broadcast_message(message):
    """
    Broadcasts a message to all connected WebSocket clients.
    """
    # Mesajı JSON formatına dönüştürün
    message_json = json.dumps(message)  # dict verisini JSON string'e dönüştürün
    for client in connected_clients:
        try:
            await client.send(message_json)  # JSON string olarak gönder
        except Exception as e:
            print(f"Error sending message to client: {e}")

    
async def start_server():
    global websocket_server
    websocket_server = await websockets.serve(websocket_handler, "localhost", 8765)
    print("WebSocket sunucusu başlatıldı. ws://localhost:8765")

async def stop_server():
    global websocket_server
    if websocket_server is None:
        print("WebSocket sunucusu zaten durdurulmuş.")
        return

    websocket_server.close()  # Sunucuyu kapat
    print("WebSocket sunucusu durduruldu.")
    websocket_server = None


