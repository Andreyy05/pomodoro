import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2 } from 'lucide-react';
import type { TimerMode, Task } from '../types';

interface TimerProps {
  mode: TimerMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onModeChange: (mode: TimerMode) => void;
  activeTask?: Task;
  onCompleteActiveTask?: () => void;
  cycleCount: number;
  maxCycles: number;
}

export const Timer: React.FC<TimerProps> = ({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  onToggle,
  onReset,
  onSkip,
  onModeChange,
  activeTask,
  onCompleteActiveTask,
  cycleCount,
  maxCycles,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG circular progress calculation
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const modeLabels: Record<TimerMode, { label: string; icon: string }> = {
    focus: { label: 'Focus', icon: '🍅' },
    shortBreak: { label: 'Short Break', icon: '☕' },
    longBreak: { label: 'Long Break', icon: '🌴' },
  };

  return (
    <div className="timer-container glass-card">
      {/* Mode Navigation Tabs */}
      <div className="mode-tabs" role="tablist">
        {(Object.keys(modeLabels) as TimerMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`mode-tab ${mode === m ? 'active' : ''}`}
            onClick={() => onModeChange(m)}
          >
            <span className="mode-icon">{modeLabels[m].icon}</span>
            <span className="mode-text">{modeLabels[m].label}</span>
          </button>
        ))}
      </div>

      {/* Circular Progress & Clock Display */}
      <div className="clock-wrapper">
        <svg className="progress-ring" viewBox="0 0 300 300">
          <circle
            className="progress-ring-bg"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="150"
            cy="150"
          />
          <circle
            className="progress-ring-fill"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="150"
            cy="150"
          />
        </svg>

        <div className="clock-content">
          <div className="time-display">{formattedTime}</div>
          <div className="mode-status-label">
            {mode === 'focus' ? (isRunning ? 'Stay focused' : 'Ready to start') : 'Take a breather'}
          </div>
          
          {/* Cycle indicators */}
          <div className="cycle-indicator" title={`Cycle ${cycleCount} of ${maxCycles}`}>
            {Array.from({ length: maxCycles }).map((_, i) => (
              <span
                key={i}
                className={`cycle-dot ${i < cycleCount ? 'filled' : ''} ${i === cycleCount - 1 && isRunning ? 'active-pulse' : ''}`}
              />
            ))}
            <span className="cycle-text">
              #{cycleCount}/{maxCycles}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="timer-controls">
        <button
          className="btn-control btn-secondary"
          onClick={onReset}
          title="Reset Timer"
          aria-label="Reset Timer"
        >
          <RotateCcw size={20} />
        </button>

        <button
          className={`btn-control btn-primary ${isRunning ? 'running' : ''}`}
          onClick={onToggle}
          title={isRunning ? 'Pause' : 'Start'}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="translate-x" />}
        </button>

        <button
          className="btn-control btn-secondary"
          onClick={onSkip}
          title="Skip to Next"
          aria-label="Skip to Next"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Active Pinned Task Bar */}
      {activeTask && (
        <div className="active-task-banner">
          <div className="active-task-info">
            <span className="active-task-tag">🎯 Active Task</span>
            <span className="active-task-title" title={activeTask.title}>
              {activeTask.title}
            </span>
            <span className="active-task-pomos">
              🍅 {activeTask.pomodorosCompleted} / {activeTask.pomodorosTarget}
            </span>
          </div>
          {onCompleteActiveTask && (
            <button
              className="btn-complete-active"
              onClick={onCompleteActiveTask}
              title="Mark Task Complete"
            >
              <CheckCircle2 size={18} />
              <span>Done</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
