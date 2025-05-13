const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const RoomManager = require('./roomManager');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

const wss = new WebSocket.Server({ server });
const roomManager = new RoomManager();

const clients = new Map();

wss.on('connection', (ws) => {
  const userId = uuidv4();
  clients.set(userId, ws);
  
  console.log(`New client connected: ${userId}`);
  
  let currentRoomId = null;

  ws.send(JSON.stringify({
    type: 'connection',
    userId
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'create_room': {
  const roomId = data.roomId || roomManager.generateRoomId();
  const question = data.question || "Cats vs Dogs";
  const options = data.options || ["Cats", "Dogs"];
  
  const result = roomManager.createRoom(roomId, question, options);
  
  if (result.success) {
    ws.send(JSON.stringify({
      type: 'room_created',
      roomId: result.room.id,
      success: true
    }));
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      message: result.message
    }));
  }
  break;
}

        
        case 'join_room': {
          const { roomId, username } = data;
          const result = roomManager.joinRoom(roomId, userId, username);
          
          if (result.success) {
            currentRoomId = roomId;
            
            ws.send(JSON.stringify({
              type: 'room_joined',
              roomId,
              status: roomManager.getRoomStatus(roomId).room,
              success: true
            }));
            
            broadcastToRoom(roomId, {
              type: 'room_update',
              status: roomManager.getRoomStatus(roomId).room
            }, userId);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: result.message
            }));
          }
          break;
        }
        
        case 'vote': {
  const { roomId, option } = data;
  const result = roomManager.vote(roomId, userId, option);
  
  if (result.success) {
    ws.send(JSON.stringify({
      type: 'vote_recorded',
      option,
      success: true
    }));
    
    broadcastToRoom(roomId, {
      type: 'room_update',
      status: roomManager.getRoomStatus(roomId).room,
      lastVote: {
        username: result.username,
        option: option
      }
    });
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      message: result.message
    }));
  }
  break;
}
        
        case 'get_room_status': {
          const { roomId } = data;
          const result = roomManager.getRoomStatus(roomId);
          
          if (result.success) {
            ws.send(JSON.stringify({
              type: 'room_status',
              status: result.room
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: result.message
            }));
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${userId}`);
    
    if (currentRoomId) {
      roomManager.leaveRoom(currentRoomId, userId);
      
      broadcastToRoom(currentRoomId, {
        type: 'room_update',
        status: roomManager.getRoomStatus(currentRoomId)?.room
      });
    }
    
    clients.delete(userId);
  });

  function broadcastToRoom(roomId, message, excludeUserId = null) {
    const roomStatus = roomManager.getRoomStatus(roomId);
    if (!roomStatus.success) return;
    
    const room = roomManager.rooms.get(roomId);
    if (!room) return;
    
    for (const clientId of room.users.keys()) {
      if (excludeUserId && clientId === excludeUserId) continue;
      
      const client = clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
});

setInterval(() => {
  roomManager.rooms.forEach((room, roomId) => {
    const prevActive = room.active;
    const status = roomManager.getRoomStatus(roomId);
    
    if (prevActive && !status.room.active) {
      broadcastToRoom(roomId, {
        type: 'room_update',
        status: status.room
      });
    }
  });
}, 1000);

function broadcastToRoom(roomId, message, excludeUserId = null) {
  const roomStatus = roomManager.getRoomStatus(roomId);
  if (!roomStatus.success) return;
  
  const room = roomManager.rooms.get(roomId);
  if (!room) return;
  
  for (const clientId of room.users.keys()) {
    if (excludeUserId && clientId === excludeUserId) continue;
    
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});