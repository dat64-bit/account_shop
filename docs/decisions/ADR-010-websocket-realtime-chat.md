# ADR-010: Use WebSocket (STOMP) for Realtime Chat

## Status
Accepted

## Date
2026-06-08

## Context
The application needs to replace the traditional issue-based support ticket system with a real-time chat interface. Previously, users submitted a `Ticket` and both sides (Customer/Admin) would communicate via `TicketReply` records, requiring the user to manually refresh the page or the frontend to implement long-polling to see new replies. 

A real-time messaging solution is required to:
- Allow instant delivery of messages between customers and the admin.
- Reduce unnecessary HTTP request overhead that polling introduces.
- Provide a smooth, "messenger-like" user experience.

## Decision
We will integrate **WebSocket with STOMP (Simple Text Oriented Messaging Protocol)** into the existing Spring Boot backend and Next.js frontend.

### Backend Architecture (Spring Boot)
1. **Dependency:** `spring-boot-starter-websocket`.
2. **Message Broker:** Enable a simple in-memory message broker with prefix `/topic`. Application destination prefix is `/app`.
3. **Endpoint:** Expose `/ws-endpoint` with SockJS fallback enabled for older browsers or restricted networks.
4. **Controller:** Use `@MessageMapping("/chat.sendMessage")` and `@SendTo("/topic/public")` to broadcast incoming messages to all connected clients.
5. **Data Structure:** We will use a `ChatMessage` DTO to exchange payloads (sender, content, timestamp, orderId). Underlying persistence will utilize the existing `Conversation` and `Message` tables to retain chat history.

### Frontend Architecture (Next.js)
1. **Dependencies:** `sockjs-client` and `@stomp/stompjs`.
2. **Connection:** Establish a connection to `http://localhost:8080/ws-endpoint` upon component mount using `useEffect`.
3. **Subscriptions:** The client subscribes to `/topic/public`. Incoming messages are parsed and appended to the local state array.
4. **Publishing:** Messages are sent using `stompClient.publish()` to the destination `/app/chat.sendMessage`.

## Alternatives Considered

### HTTP Long-Polling
- **Pros:** Easy to implement, requires zero additional dependencies or configuration on the Spring Boot side. Works over standard HTTP/HTTPS.
- **Cons:** High latency, wastes server resources keeping connections open, does not scale well with many concurrent users.
- **Rejected:** The user explicitly requested WebSockets for true real-time performance.

### Server-Sent Events (SSE)
- **Pros:** Native browser support, simpler over HTTP. Good for one-way streams (Server -> Client).
- **Cons:** Only supports one-way communication. Clients still need to use standard POST requests to send messages. STOMP over WebSocket provides a cleaner bi-directional Pub/Sub model.
- **Rejected:** WebSocket + STOMP is more suitable for a two-way chat application.

## Consequences
- **Infrastructure:** The server now has to maintain open TCP connections. For a single instance deployment, the in-memory Simple Broker is sufficient. If the backend scales horizontally, we will need an external broker like RabbitMQ or Redis Pub/Sub.
- **Frontend Complexity:** The React state must handle connection drops, reconnects, and cleanup properly (avoiding memory leaks by disconnecting in `useEffect` cleanup).
- **Security:** WebSocket endpoints bypass the standard Spring Security HTTP filters. We will need to configure `ChannelInterceptor` if we want to authenticate WebSocket connections strictly, or rely on HTTP-Only cookie presence during the initial Handshake. For now, public access to the chat room is assumed per specifications.
