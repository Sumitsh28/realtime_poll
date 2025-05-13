import React from 'react';

const VoteOption = ({ option, votes, totalVotes, userVote, onVote, disabled }) => {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  const isSelected = userVote === option;

  return (
    <div 
      className={`vote-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && !userVote && onVote(option)}
    >
      <div className="vote-option-header">
        <span className="vote-option-name">{option}</span>
        <span className="vote-count">{votes} votes</span>
      </div>

      <div className="vote-progress-container">
        <div 
          className="vote-progress" 
          style={{ width: `${percentage}%` }}
        />
        <span className="vote-percentage">{percentage}%</span>
      </div>

      {isSelected && (
        <div className="your-vote-badge">You Voted 🎉</div>
      )}
    </div>
  );
};

export default VoteOption;