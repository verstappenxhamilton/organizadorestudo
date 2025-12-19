import { useState, useEffect, useRef, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

export const useGlobalTimer = () => {
  const [timerState, setTimerState] = useState({
    isRunning: false,
    startTime: null,
    accumulatedTime: 0, // in milliseconds
    subjectId: null,
    topicId: null,
  });

  // Load from storage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage('globalTimerState');
    if (saved) {
      setTimerState(saved);
    }
  }, []);

  // Save to storage on change
  useEffect(() => {
    saveToLocalStorage('globalTimerState', timerState);
  }, [timerState]);

  // Hook to get current duration in seconds (reactive)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (timerState.isRunning) {
      // Update immediately
      const update = () => {
        const now = Date.now();
        const current = timerState.accumulatedTime + (now - timerState.startTime);
        setElapsedSeconds(Math.floor(current / 1000));
      };
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsedSeconds(Math.floor(timerState.accumulatedTime / 1000));
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.startTime, timerState.accumulatedTime]);

  const startTimer = useCallback((subjectId, topicId = null) => {
    setTimerState(prev => {
        // If already running for same subject/topic, ignore or just resume?
        // Assuming start means "start new" or "resume".
        // But if it's a new subject, we reset.
        if (prev.subjectId !== subjectId) {
             return {
                isRunning: true,
                startTime: Date.now(),
                accumulatedTime: 0,
                subjectId,
                topicId
            };
        }
        // If same, acts like resume if paused, or nothing if running
        if (prev.isRunning) return prev;

        return {
            ...prev,
            isRunning: true,
            startTime: Date.now(),
            subjectId, // ensure updated
            topicId
        };
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isRunning) return prev;
      const now = Date.now();
      return {
        ...prev,
        isRunning: false,
        startTime: null,
        accumulatedTime: prev.accumulatedTime + (now - prev.startTime),
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.isRunning) return prev;
      return {
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    let finalTime = 0;
    setTimerState(prev => {
      const now = Date.now();
      finalTime = prev.accumulatedTime + (prev.isRunning ? (now - prev.startTime) : 0);
      return {
        isRunning: false,
        startTime: null,
        accumulatedTime: 0,
        subjectId: null,
        topicId: null,
      };
    });
    return Math.floor(finalTime / 1000); // return seconds
  }, []);

  // Helper to discard without saving
  const discardTimer = useCallback(() => {
      setTimerState({
        isRunning: false,
        startTime: null,
        accumulatedTime: 0,
        subjectId: null,
        topicId: null,
      });
  }, []);

  return {
    timerState,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer
  };
};
