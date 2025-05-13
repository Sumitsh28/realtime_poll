import React, { useEffect, useState } from 'react';

const Timer = ({ timeRemaining, onTimerEnd }) => {
  const [seconds, setSeconds] = useState(Math.floor(timeRemaining / 1000));

  useEffect(() => {
    setSeconds(Math.floor(timeRemaining / 1000));
  }, [timeRemaining]);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimerEnd) {
        onTimerEnd();
      }
      return;
    }

    const interval = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(interval);
          if (onTimerEnd) {
            onTimerEnd();
          }
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onTimerEnd]);

  const progress = (seconds / 60) * 100;

  return (
    <div className="timer-container">
      <div className="timer-progress-bar">
        <div 
          className="timer-progress" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="timer-text">
        {seconds > 0 ? (
          <span>Time remaining: {seconds}s</span>
        ) : (
          <span>Voting has ended</span>
        )}
      </div>
    </div>
  );
};

export default Timer;