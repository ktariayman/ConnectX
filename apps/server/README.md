# @connect-x/server

The backend for ConnectX. Built with **Express**, **Socket.io**, using the  **Hexagonal Architecture**.

## 🚀 Key Features
- **Event-Driven**: Uses internal `GameEventEmitter` with `EventEmitter` to emit events to the application layer.
- **Type-Safe**: Integrates with `@connect-x/shared` for request/response validation.

## 🧱 Architecture Layers
The codebase follows Domain-Driven Design (DDD) principles:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Presentation** | `src/presentation` | Handling HTTP/Socket requests (Controllers, Handlers) |
| **Application** | `src/application` | Orchestrating use cases (GameService, RoomService) |
| **Domain** | `src/domain` | Core business logic, Entities, and Port interfaces |
| **Infrastructure** | `src/infrastructure` | Persistence (Repositories) and external tools |

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Real-time**: Socket.io
- **Testing**: Vitest
- **Validation**: Zod

## 📖 Documentation
- **[System Design](./SYSTEM_DESIGN.md)**: Detailed architecture diagrams, data flows, and class structure.

## ⚡ Development
```bash
# Start development server
pnpm dev

# Run tests
pnpm test
```
