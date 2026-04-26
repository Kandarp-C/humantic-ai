from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

active_connections: dict[str, list[WebSocket]] = {}


async def push_to_user(user_id: str, data: dict):
    connections = active_connections.get(user_id, [])
    dead = []
    for ws in connections:
        try:
            await ws.send_json(data)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


@router.websocket("/ws/findings")
async def findings_websocket(websocket: WebSocket, token: str):
    from app.services.supabase import supabase
    try:
        response = supabase.auth.get_user(token)
        if response is None or response.user is None:
            await websocket.close(code=1008)
            return
        user_id = str(response.user.id)
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    active_connections.setdefault(user_id, []).append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.get(user_id, []).remove(websocket)
