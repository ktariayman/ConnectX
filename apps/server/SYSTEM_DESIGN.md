# ConnectX System Design & Architecture

## 1. High-Level Architecture
The system follows a **Hexagonal / Clean Architecture** pattern, separating the core domain logic from external interfaces (API, WebSockets, Database).

```mermaid
graph TD
    subgraph "External Layers"
        Client[React Client]
        Redis[(Redis - Future Specific)]
    end

    subgraph "Presentation Layer (API & Socket)"
        WS[WebSocket Handlers]
        HTTP[HTTP Controllers]
    end

    subgraph "Application Layer (Use Cases)"
        GS[GameService]
        RS[RoomService]
        US[UserService]
        SS[SchedulerService]
    end

    subgraph "Domain Layer (Core Logic)"
        Room[Room Entity]
        Game[Game Logic]
    end

    subgraph "Infrastructure Layer (Persistence)"
        IRoom[RoomRepository]
        IUser[UserRepository]
    end

    Client <-->|Socket.IO| WS
    Client <-->|REST API| HTTP
    
    WS --> GS
    WS --> RS
    HTTP --> RSV[RoomService]
    
    GS --> Room
    RS --> Room
    
    GS --> IRoom
    RS --> IRoom
    US --> IUser
    
    IRoom -.->|Implements| Redis
```

## 2. Core Class Structure
The `GameService` is the heart of the system, coordinating between the repository, the scheduler, and the domain events.

```mermaid
classDiagram
    class GameService {
        +makeMove(roomId, user, col)
        +setPlayerReady(roomId, user)
        +handleForfeit(roomId, user)
        -scheduleTurnTimeout()
    }

    class RoomService {
        +createRoom(config)
        +joinRoom(roomId, user)
        +joinAsSpectator(roomId, user)
    }

    class SchedulerService {
        +schedule(key, ms, callback)
        +cancel(key)
    }

    class InMemoryRoomRepository {
        -rooms: Map<string, Room>
        +save(room)
        +findById(id)
    }

    class GameEventEmitter {
        +emit(event, payload)
        +on(event, handler)
    }

    GameService --> RoomService : uses
    GameService --> SchedulerService : uses
    GameService --> InMemoryRoomRepository : uses
    GameService --> GameEventEmitter : emits
```

## 3. Game Data Model (In-Memory)
The "Database" is currently an in-memory Map, but the structure is relational-ready.

```mermaid
erDiagram
    Room ||--|{ Player : contains
    Room ||--|{ Spectator : contains
    Room ||--|| GameState : has
    GameState ||--|{ Move : records

    Room {
        string id PK
        string status
        string difficulty
        map players
        map spectators
    }

    Player {
        string username PK
        string color
        boolean isReady
        boolean isVisible
    }

    GameState {
        matrix board
        string currentPlayer
        string winner
    }
```

## 4. Sequence: Making a Move
How data flows when a player clicks a column.

```mermaid
sequenceDiagram
    participant C as Client (Player)
    participant S as Socket Handler
    participant G as GameService
    participant R as RoomRepo
    participant E as EventEmitter
    participant C2 as Client (Opponent)

    C->>S: emit('game:move', { col: 3 })
    S->>G: makeMove(roomId, user, 3)
    
    G->>R: findById(roomId)
    R-->>G: Room Object
    
    Note over G: Validate Move & Turn
    
    G->>G: Update Board State
    G->>R: save(Room)
    
    G->>E: emit('game:move', { ... })
    
    par Update Clients
        E->>S: on('game:move')
        S->>C: emit('game:move')
        S->>C2: emit('game:move')
    end
```

## 5. Sequence: Turn Timeout (Event-Driven)
How the new SchedulerService creates an O(1) timeout mechanism.

```mermaid
sequenceDiagram
    participant User
    participant G as GameService
    participant SCH as SchedulerService
    participant NODE as Node Timer

    User->>G: makeMove()
    G->>SCH: cancel(roomId)
    SCH-->>NODE: clearTimeout(oldTimer)
    
    G->>G: Apply Move
    
    G->>SCH: schedule(roomId, 30s, callback)
    SCH-->>NODE: setTimeout(30s)
    
    Note over NODE: ... 30 seconds pass ...
    
    NODE-->>SCH: execute callback()
    SCH->>G: finishGame(TIMEOUT)
```
