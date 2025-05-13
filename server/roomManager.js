class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, question = "Cats vs Dogs", options = ["Cats", "Dogs"]) {
    if (this.rooms.has(roomId)) {
      return { success: false, message: "Room already exists" };
    }

    const votesObj = {};
    options.forEach(option => {
      votesObj[option] = 0;
    });

    const room = {
      id: roomId,
      question,
      options,
      votes: votesObj,
      users: new Map(),
      active: true,
      startTime: Date.now(),
      duration: 60000 
    };

    this.rooms.set(roomId, room);
    return { success: true, room };
  }

  joinRoom(roomId, userId, username) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    if (!room.active) {
      return { success: false, message: "Room is no longer active" };
    }

    for (const [id, user] of room.users.entries()) {
      if (user.username === username && id !== userId) {
        return { success: false, message: "Username already taken in this room" };
      }
    }

    room.users.set(userId, { username, voted: null });
    return { success: true, room };
  }

  vote(roomId, userId, option) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    if (!room.active) {
      return { success: false, message: "Voting has ended for this room" };
    }

    const user = room.users.get(userId);
    if (!user) {
      return { success: false, message: "User not found in room" };
    }

    if (user.voted) {
      return { success: false, message: "User has already voted" };
    }

    if (!room.options.includes(option)) {
      return { success: false, message: "Invalid voting option" };
    }

    room.votes[option]++;
    user.voted = option;

    return { success: true, room, username: user.username };
  }

  getRoomStatus(roomId) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    const elapsedTime = Date.now() - room.startTime;
    if (room.active && elapsedTime >= room.duration) {
      room.active = false;
    }

    const users = {};
    room.users.forEach((userData, userId) => {
      users[userId] = {
        username: userData.username,
        voted: userData.voted !== null
      };
    });

    return {
      success: true,
      room: {
        id: room.id,
        question: room.question,
        options: room.options,
        votes: room.votes,
        users: users,
        userCount: room.users.size,
        active: room.active,
        timeRemaining: Math.max(0, room.duration - elapsedTime),
      }
    };
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(userId);
    if (!user) return;

    if (user.voted) {
      room.votes[user.voted]--;
    }

    room.users.delete(userId);

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}

module.exports = RoomManager;