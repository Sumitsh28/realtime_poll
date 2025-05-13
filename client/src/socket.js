const socketClient = {
  socket: null,
  callbacks: {},
  
  connect() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket('ws://localhost:8080');
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        this.socket = socket;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connection') {
            resolve(data.userId);
          }
          
          const callbacks = this.callbacks[data.type] || [];
          callbacks.forEach(callback => callback(data));
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  },
  
  on(eventType, callback) {
    if (!this.callbacks[eventType]) {
      this.callbacks[eventType] = [];
    }
    
    this.callbacks[eventType].push(callback);
    
    return () => {
      this.callbacks[eventType] = this.callbacks[eventType].filter(cb => cb !== callback);
    };
  },
  
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not connected');
    }
    
    this.socket.send(JSON.stringify(message));
  },
  
  createRoom(question = null, options = null) {
    this.send({
      type: 'create_room',
      question: question,
      options: options
    });
  },
  
  joinRoom(roomId, username) {
    this.send({
      type: 'join_room',
      roomId,
      username
    });
  },
  
  vote(roomId, option) {
    this.send({
      type: 'vote',
      roomId,
      option
    });
  },
  
  getRoomStatus(roomId) {
    this.send({
      type: 'get_room_status',
      roomId
    });
  },
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
};

export default socketClient;