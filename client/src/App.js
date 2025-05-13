import React, { useState, useEffect } from 'react';
import socketClient from './socket';
import CreateJoin from './components/CreateJoin';
import PollRoom from './components/PollRoom';
import Toast from './components/Toast';
import './App.css';

function App() {
  const [userId, setUserId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        setLoading(true);
        const id = await socketClient.connect();
        setUserId(id);
        setConnected(true);
        setLoading(false);
      } catch (err) {
        console.error('Failed to connect:', err);
        setError('Failed to connect to the server. Please refresh and try again.');
        setLoading(false);
      }
    };

    initializeSocket();

    const roomUpdateListener = socketClient.on('room_update', (data) => {
      setRoomStatus(data.status);
      
      if (data.lastVote && data.lastVote.username) {
        addToast(`${data.lastVote.username} voted for ${data.lastVote.option}`);
      }
    });

    const errorListener = socketClient.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      roomUpdateListener();
      errorListener();
      socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const roomJoinedListener = socketClient.on('room_joined', (data) => {
      if (data.success) {
        setRoomStatus(data.status);
        setError(null);
      }
    });

    const voteRecordedListener = socketClient.on('vote_recorded', (data) => {
      if (data.success) {
        setError(null);
      }
    });

    return () => {
      roomJoinedListener();
      voteRecordedListener();
    };
  }, [roomId]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };
  
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  };

  const handleCreateRoom = async (name, question = null, options = null) => {
    try {
      setUsername(name);
      setLoading(true);
      await socketClient.createRoom(question, options);
      
      const roomCreatedPromise = new Promise((resolve) => {
        const unsubscribe = socketClient.on('room_created', (data) => {
          unsubscribe();
          resolve(data);
        });
      });
      
      const roomData = await roomCreatedPromise;
      
      if (roomData.success) {
        await socketClient.joinRoom(roomData.roomId, name);
        setRoomId(roomData.roomId);
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room, name) => {
    try {
      setUsername(name);
      setLoading(true);
      await socketClient.joinRoom(room, name);
      setRoomId(room);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please check the room code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option) => {
    try {
      await socketClient.vote(roomId, option);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to register vote. Please try again.');
    }
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setRoomStatus(null);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !connected) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button 
            className="btn primary" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!roomId ? (
        <CreateJoin
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        roomStatus && (
          <PollRoom
            roomId={roomId}
            username={username}
            roomStatus={roomStatus}
            onVote={handleVote}
            onLeaveRoom={handleLeaveRoom}
          />
        )
      )}
      
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;