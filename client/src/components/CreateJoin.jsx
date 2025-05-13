import React, { useState } from 'react';

const CreateJoin = ({ onCreateRoom, onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('join'); 
  

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showCustomOptions, setShowCustomOptions] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleRoomIdChange = (e) => {
    setRoomId(e.target.value.toUpperCase());
  };
  
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleAddOption = () => {
    if (options.length < 10) { 
      setOptions([...options, '']);
    }
  };
  
  const handleRemoveOption = (indexToRemove) => {
    if (options.length > 2) { 
      setOptions(options.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (showCustomOptions) {
      if (!question.trim()) {
        setError('Please enter a question');
        return;
      }
      
      const validOptions = options.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        setError('Please enter at least 2 options');
        return;
      }
      
      onCreateRoom(username, question, validOptions);
    } else {
      onCreateRoom(username);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    onJoinRoom(roomId, username);
  };

  return (
    <div className="create-join-container">
      <h1>Live Poll Battle</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${tab === 'join' ? 'active' : ''}`} 
          onClick={() => setTab('join')}
        >
          Join Room
        </button>
        <button 
          className={`tab ${tab === 'create' ? 'active' : ''}`} 
          onClick={() => setTab('create')}
        >
          Create Room
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="tab-content">
        {tab === 'create' ? (
          <form onSubmit={handleCreateRoom}>
            <div className="form-group">
              <label htmlFor="create-username">Your Name:</label>
              <input
                type="text"
                id="create-username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>
            
            <div className="custom-options-toggle">
              <input
                type="checkbox"
                id="custom-options"
                checked={showCustomOptions}
                onChange={() => setShowCustomOptions(!showCustomOptions)}
              />
              <label htmlFor="custom-options">Create custom question</label>
            </div>
            
            {showCustomOptions && (
              <div className="custom-options-form">
                <div className="form-group">
                  <label htmlFor="custom-question">Question:</label>
                  <input
                    type="text"
                    id="custom-question"
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Enter your question"
                    maxLength={100}
                    required
                  />
                </div>
                
                <label>Options:</label>
                {options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={50}
                      required
                    />
                    {options.length > 2 && (
                      <button 
                        type="button" 
                        className="remove-option-btn"
                        onClick={() => handleRemoveOption(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {options.length < 10 && (
                  <button 
                    type="button" 
                    className="add-option-btn"
                    onClick={handleAddOption}
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}
            
            <button type="submit" className="btn primary">Create New Room</button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="join-username">Your Name:</label>
              <input
                type="text"
                id="join-username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="room-id">Room Code:</label>
              <input
                type="text"
                id="room-id"
                value={roomId}
                onChange={handleRoomIdChange}
                placeholder="Enter 6-digit room code"
                maxLength={6}
                required
              />
            </div>
            
            <button type="submit" className="btn primary">Join Room</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateJoin;