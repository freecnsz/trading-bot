import React, { useState, useEffect } from "react";

const Timer = ({ isTrading, onReset }) => {
  const [timeElapsed, setTimeElapsed] = useState(0); // Tracks elapsed time in seconds

  useEffect(() => {
    let timerInterval;

    if (isTrading) {
      // Start or continue the timer when trading starts
      timerInterval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      // Stop the timer when trading stops
      clearInterval(timerInterval);
    }

    return () => clearInterval(timerInterval); // Cleanup on unmount or when isTrading changes
  }, [isTrading]);

  // Format time as hh:mm:ss
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timer">
      <h3>{formatTime(timeElapsed)}</h3>
      <button
        className="timer-button reset-button"
        onClick={() => {
          setTimeElapsed(0);
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default Timer;
