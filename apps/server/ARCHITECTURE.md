# ConnectX Backend Architecture

This backend is built using **Hexagonal Architecture** (Ports & Adapters) and **Domain-Driven Design (DDD)** principles. It is designed for maximum testability, maintainability, and scalability.

## 🏗️ Folder Structure & Responsibilities

### 1. `domain/` (Core Rules)
The "Source of Truth" for the entire application. It contains the business rules and definitions that never change, regardless of technology.
- **`ports/`**: Interfaces that define how the application interacts with external services (e.g., `IRoomRepository`).
- **`events/`**: Definitions of domain events (e.g., `GameEvent.GAME_MOVE`).
- **Rule**: No external dependencies (no Express, no Socket.io).

### 2. `application/` (Orchestration)
This layer contains the **Services** that execute specific business use cases.
- **`services/`**: `RoomService` and `GameService`.
- **Role**: Coordinates the flow of data between the Domain and Infrastructure. It is the "Brain" of the operation.
- **Rule**: Does not know about HTTP requests or WebSocket connections.

### 3. `infrastructure/` (Hard Dependencies)
Contains implementations of the interfaces defined in the domain layer.
- **`persistence/`**: `InMemoryRoomRepository` (swappable for a real DB in the future).
- **Role**: Manages data storage and external system integration.

### 4. `presentation/` (Delivery/Entrypoints)
How the outside world talks to our backend.
- **`http/`**: REST API controllers and Express routers.
- **`websocket/`**: Socket.io handlers for real-time gameplay.
- **Role**: Translates network signals into commands for the Application layer.

---

## 🔄 Key Design Principles

### 🔌 Dependency Inversion
Inner layers (Domain, Application) never depend on outer layers (Infrastructure, Presentation). Instead, outer layers "plug in" to interfaces (Ports) defined in the inner layers. This allows us to swap a library or database without touching the core logic.

### 🔔 Event-Driven Logic
The Application layer emits **Domain Events** via a central `GameEventEmitter`. The Presentation layer (Sockets) listens to these events and broadcasts them. This decouples the "Doing" from the "Telling."

