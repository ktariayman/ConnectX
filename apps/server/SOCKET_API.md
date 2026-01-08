#  Socket.IO Event API

The Real-Time API for ConnectX.
**Base URL**: `ws://localhost:4000`

---

##  Client -> Server Events
Events emitted by the frontend to perform actions.

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `room:join` | `{ roomId: string, username: string }` | Join a room as a player. |
| `room:spectate` | `{ roomId: string, username: string }` | Join a room as a spectator. |
| `room:leave` | `void` | Leave the current room. |
| `room:forfeit` | `void` | Forfeit the current game (loss). |
| `player:ready` | `void` | Mark self as ready to start. |
| `game:move` | `{ roomId: string, column: number }` | Drop a disc in a column. |
| `game:rematch` | `void` | Request a rematch after game end. |
| `game:visibility-change` | `{ isVisible: boolean }` | Toggle "Green Dot" status (tab focus). |

---

## 📥 Server -> Client Events
Events received by the frontend to update UI.

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `room:updated` | `{ roomId: string, room: Room }` | Full room state update. Emitted on join, leave, ready, etc. |
| `player:joined` | `{ displayName: string }` | Notification: User joined. |
| `player:left` | `{ playerId: string }` | Notification: User left. |
| `spectator:joined` | `{ username: string }` | Notification: Spectator joined. |
| `spectator:left` | `{ username: string }` | Notification: Spectator left. |
| `game:started` | `{ gameState: GameState }` | The game has officially begun. |
| `game:move` | `{ move: Move, gameState: GameState, turnStartedAt: string }` | A valid move was made. |
| `game:over` | `{ gameState: GameState, reason: string }` | Game finished (Win/Draw/Forfeit). |
| `game:player-visibility-change` | `{ username: string, isVisible: boolean }` | Update presence indicator for a player. |
| `error` | `{ code: string, message: string }` | Operation failed (e.g. invalid move). |
