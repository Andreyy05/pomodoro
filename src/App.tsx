import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
import type { TimerMode, Theme, AmbientSound, Task, PomodoroSettings } from './types';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { AmbientPlayer } from './components/AmbientPlayer';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsModal } from './components/SettingsModal';
import { playAlarm, playTick, ambientPlayer } from './utils/audio';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'retro8bit',
  alarmVolume: 0.8,
  ambientSound: 'none',
  ambientVolume: 0.4,
  tickingSound: false,
  theme: 'lofi',
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'Complete important project milestone',
    completed: false,
    pomodorosCompleted: 1,
    pomodorosTarget: 3,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-2',
    title: 'Review pull request & documentation',
    completed: false,
    pomodorosCompleted: 0,
    pomodorosTarget: 2,
    createdAt: Date.now() - 1800000,
  },
];

export const App: React.FC = () => {
  // Load settings from LocalStorage
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Load tasks from LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    return DEFAULT_TASKS;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return tasks.length > 0 ? tasks[0].id : null;
  });

  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Time remaining in seconds
  const getDurationForMode = useCallback(
    (m: TimerMode) => {
      if (m === 'focus') return settings.focusDuration * 60;
      if (m === 'shortBreak') return settings.shortBreakDuration * 60;
      return settings.longBreakDuration * 60;
    },
    [settings]
  );

  const [timeLeft, setTimeLeft] = useState<number>(() => settings.focusDuration * 60);

  // Sync HTML theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Save settings & tasks
  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Update timeLeft when mode duration in settings changes (only if paused)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, mode, isRunning, getDurationForMode]);

  // Title sync
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeEmoji = mode === 'focus' ? '🍅' : mode === 'shortBreak' ? '☕' : '🌴';
    document.title = `${formatted} ${modeEmoji} Pomodoro Focus`;
  }, [timeLeft, mode]);

  // Confetti burst on focus completion
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Main timer tick countdown
  const timerRef = useRef<number | null>(null);

  const handleSessionComplete = useCallback(() => {
    playAlarm(settings.alarmSound, settings.alarmVolume);

    if ('Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'focus' ? '🍅 Focus Session Complete!' : '✨ Break is Over!';
      const body =
        mode === 'focus'
          ? 'Great work! Time to stretch and rest your eyes.'
          : 'Ready to dive back into your next focus sprint?';
      new Notification(title, { body, icon: '/favicon.ico' });
    }

    if (mode === 'focus') {
      triggerConfetti();

      // Increment active task pomodoro count
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId
              ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 }
              : t
          )
        );
      }

      // Determine next break mode
      if (cycleCount >= settings.longBreakInterval) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        setCycleCount(1);
        setIsRunning(settings.autoStartBreaks);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        setCycleCount((c) => c + 1);
        setIsRunning(settings.autoStartBreaks);
      }
    } else {
      // Break completed -> Return to focus
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
      setIsRunning(settings.autoStartPomodoros);
    }
  }, [mode, activeTaskId, cycleCount, settings]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          if (settings.tickingSound) {
            playTick(0.12);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleSessionComplete, settings.tickingSound]);

  // Ambient sound management
  const handleAmbientSoundChange = (sound: AmbientSound) => {
    setSettings((prev) => ({ ...prev, ambientSound: sound }));
    if (sound === 'none') {
      ambientPlayer.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientPlayer.start(sound, settings.ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleAmbientVolumeChange = (volume: number) => {
    setSettings((prev) => ({ ...prev, ambientVolume: volume }));
    ambientPlayer.setVolume(volume);
  };

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      ambientPlayer.stop();
      setIsAmbientPlaying(false);
    } else {
      if (settings.ambientSound !== 'none') {
        ambientPlayer.start(settings.ambientSound, settings.ambientVolume);
        setIsAmbientPlaying(true);
      } else {
        // default to rain if currently muted
        handleAmbientSoundChange('rain');
      }
    }
  };

  // Timer Controls
  const handleToggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      if (cycleCount >= settings.longBreakInterval) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        setCycleCount(1);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        setCycleCount((c) => c + 1);
      }
    } else {
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  // Task Actions
  const handleAddTask = (title: string, targetPomodoros: number) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title,
      completed: false,
      pomodorosCompleted: 0,
      pomodorosTarget: targetPomodoros,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            triggerConfetti();
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      const remaining = tasks.filter((t) => t.id !== id);
      setActiveTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSelectActiveTask = (id: string) => {
    setActiveTaskId(id);
  };

  const handleCompleteActiveTask = () => {
    if (!activeTaskId) return;
    handleToggleTask(activeTaskId);
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className={`app-root theme-${settings.theme}`}>
      {/* Scanline overlay for Retro theme */}
      {settings.theme === 'retro' && <div className="crt-scanlines" />}

      {/* Background ambient decorative glow circles */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      {/* Main App Container */}
      <div className="app-container">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-brand">
            <span className="brand-icon">🍅</span>
            <div className="brand-titles">
              <h1 className="brand-title">Pomodoro Focus</h1>
              <span className="brand-subtitle">Lo-Fi & Retro Aesthetic Timer</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="btn-header-action"
              onClick={() => playAlarm(settings.alarmSound, settings.alarmVolume)}
              title="Test Alarm Sound"
              aria-label="Test Alarm Sound"
            >
              <Bell size={18} />
              <span className="btn-label-desktop">Test Sound</span>
            </button>

            <button
              className="btn-header-action btn-settings-trigger"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={18} />
              <span className="btn-label-desktop">Settings</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Grid */}
        <main className="dashboard-grid">
          {/* Left Column: Timer & Ambient Sound */}
          <section className="timer-column">
            <Timer
              mode={mode}
              timeLeft={timeLeft}
              totalDuration={getDurationForMode(mode)}
              isRunning={isRunning}
              onToggle={handleToggleRunning}
              onReset={handleResetTimer}
              onSkip={handleSkip}
              onModeChange={handleModeChange}
              activeTask={activeTask}
              onCompleteActiveTask={activeTask && !activeTask.completed ? handleCompleteActiveTask : undefined}
              cycleCount={cycleCount}
              maxCycles={settings.longBreakInterval}
            />

            <AmbientPlayer
              ambientSound={settings.ambientSound}
              ambientVolume={settings.ambientVolume}
              isPlaying={isAmbientPlaying}
              onSoundChange={handleAmbientSoundChange}
              onVolumeChange={handleAmbientVolumeChange}
              onTogglePlay={handleToggleAmbient}
            />
          </section>

          {/* Right Column: Tasks & Theme Selector */}
          <section className="side-column">
            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSelectActiveTask={handleSelectActiveTask}
              onClearCompleted={handleClearCompleted}
            />

            <ThemeSelector
              currentTheme={settings.theme}
              onThemeChange={(theme: Theme) => setSettings((s) => ({ ...s, theme }))}
            />
          </section>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            Stay productive with Pomodoro technique • Ambient audio synthesized via Web Audio API 🎧
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
        onResetDefaults={() => setSettings(DEFAULT_SETTINGS)}
      />
    </div>
  );
};

export default App;
