# Live Poll Battle

A real-time polling application where users can create or join poll rooms and vote live. The results update instantly across all users in the same room.

## Features

- Create a new poll room or join an existing one using a room code
- Vote on one of two options or they can create there own options
- See real-time vote updates as other users vote
- 60-second countdown timer after which voting ends
- Persistence of user's vote across page refreshes using local storage
- Copy room code to share with friends
- Clean and responsive UI

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with WebSockets
- **Communication**: WebSocket protocol for real-time updates

## Vote State Sharing and Room Management

The application uses a centralized server architecture to manage poll rooms and vote states:

1. **Room Management**: The server maintains an in-memory map of active rooms, each with its unique ID, question, options, and user votes. Rooms are automatically deactivated after 60 seconds.

2. **Vote State Sharing**: When a user votes, the vote is sent to the server which stores it and then broadcasts the updated vote counts to all connected clients in the room. This ensures all users see real-time updates.

3. **Persistence**: User votes are saved in the browser's local storage to maintain state across page refreshes or reconnections.

4. **User Tracking**: The server assigns each client a unique ID and tracks which users have joined which rooms, preventing duplicate voting and maintaining room integrity.

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation and Running Locally

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/live-poll-battle.git
   cd live-poll-battle
   ```

2. Install and start the server:
   ```
   cd server
   npm install
   npm start
   ```

3. In a new terminal, install and start the client:
   ```
   cd client
   npm install
   npm start
   ```

4. Open your browser and navigate to http://localhost:3000

### Environment Variables

- **Server**:
  - `PORT`: Port number for the server (default: 8080)

- **Client**:
  - `REACT_APP_WS_URL`: WebSocket server URL (default: ws://localhost:8080)

## Development

### Running in Development Mode

- For backend development with hot reloading:
  ```
  cd server
  npm run dev
  ```

- For frontend development:
  ```
  cd client
  npm start
  ```

## Deployment

For production deployment:

1. Build the client:
   ```
   cd client
   npm run build
   ```

2. The built files in the `client/build` directory can be served from a static file server.

3. Configure the production server and client to use the appropriate WebSocket URL.

## License

This project is open source software.