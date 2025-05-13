import React, { useEffect, useState } from 'react';
import Timer from './Timer';
import VoteOption from './VoteOption';

const PollRoom = ({ roomId, username, roomStatus, onVote, onLeaveRoom }) => {
  const [userVote, setUserVote] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const savedVote = localStorage.getItem(`vote_${roomId}`);
    if (savedVote) {
      setUserVote(savedVote);
    }
  }, [roomId]);

  const handleVote = (option) => {
    if (!roomStatus.active || userVote) return;

    onVote(option);
    setUserVote(option);

    localStorage.setItem(`vote_${roomId}`, option);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 2000);
  };

  const totalVotes = Object.values(roomStatus?.votes || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="poll-room-container">
      <div className="poll-room-header">
        <h2>{roomStatus.question}</h2>
        <div className="room-info">
          <div className="room-code">
            Room Code: <span>{roomId}</span>
            <button 
              className="copy-button" 
              onClick={handleCopyRoomCode}
              title="Copy room code"
            >
              📋
              {showCopied && <span className="copied-tooltip">Copied!</span>}
            </button>
          </div>
          <div className="user-info">
            Logged in as: <strong>{username}</strong>
          </div>
        </div>
      </div>

      {roomStatus.active ? (
        <Timer 
          timeRemaining={roomStatus.timeRemaining} 
        />
      ) : (
        <div className="voting-ended-message">
          <h3>Voting has ended!</h3>
        </div>
      )}

      <div className="vote-options-container">
        {roomStatus.options.map((option) => (
          <VoteOption
            key={option}
            option={option}
            votes={roomStatus.votes[option]}
            totalVotes={totalVotes}
            userVote={userVote}
            onVote={handleVote}
            disabled={!roomStatus.active}
          />
        ))}
      </div>

      <div className="poll-room-footer">
        <button className="btn secondary" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default PollRoom;