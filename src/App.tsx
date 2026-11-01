import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Settings as SettingsIcon, 
  Bell, 
  BarChart3, 
  Keyboard, 
  Maximize2, 
  Minimize2, 
  Flame
} from 'lucide-react';
import type { TimerMode, Theme, AmbientSound, Task, PomodoroSettings, DailyStats } from './types';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { AmbientPlayer } from './components/AmbientPlayer';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { FocusBuddy } from './components/FocusBuddy';
import { playAlarm, playTick, ambientPlayer } from './utils/audio';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  dailyGoal: 8,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'retro8bit',
  alarmVolume: 0.8,
  ambientSound: 'none',
  ambientVolume: 0.4,
  tickingSound: false,
  theme: 'lofi',
  focusBuddyEnabled: true,
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

  // Daily statistics for completed pomodoros
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    const saved = localStorage.getItem('pomodoro_daily_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
    const today = new Date().toISOString().split('T')[0];
    return { [today]: 1 }; // Default initial sample for visual feedback
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return tasks.length > 0 ? tasks[0].id : null;
  });

  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
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

  // Save settings, tasks, and stats
  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoro_daily_stats', JSON.stringify(dailyStats));
  }, [dailyStats]);

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
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#4ade80'],
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
          ? 'Skvělá práce! Čas se protáhnout a dát očím odpočinek.'
          : 'Jsi připraven vrhnout se do dalšího sprintu?';
      new Notification(title, { body, icon: '/favicon.ico' });
    }

    if (mode === 'focus') {
      triggerConfetti();

      // Track focus session in dailyStats
      const todayKey = new Date().toISOString().split('T')[0];
      setDailyStats((prev) => ({
        ...prev,
        [todayKey]: (prev[todayKey] || 0) + 1,
      }));

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

  const handleToggleAmbient = useCallback(() => {
    if (isAmbientPlaying) {
      ambientPlayer.stop();
      setIsAmbientPlaying(false);
    } else {
      if (settings.ambientSound !== 'none') {
        ambientPlayer.start(settings.ambientSound, settings.ambientVolume);
        setIsAmbientPlaying(true);
      } else {
        handleAmbientSoundChange('c418');
      }
    }
  }, [isAmbientPlaying, settings.ambientSound, settings.ambientVolume]);

  // Timer Controls
  const handleToggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  }, [getDurationForMode, mode]);

  const handleSkip = useCallback(() => {
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
  }, [cycleCount, mode, settings.focusDuration, settings.longBreakDuration, settings.longBreakInterval, settings.shortBreakDuration]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  // Zen Mode toggle
  const handleToggleZenMode = useCallback(() => {
    setIsZenMode((prev) => {
      const next = !prev;
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  }, []);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleRunning();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSkip();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleAmbient();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleToggleZenMode();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((o) => !o);
      } else if (e.code === 'Escape') {
        setIsSettingsOpen(false);
        setIsStatsOpen(false);
        setIsShortcutsOpen(false);
        if (isZenMode) setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleRunning, handleResetTimer, handleSkip, handleToggleAmbient, handleToggleZenMode, isZenMode]);

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
  const todayKey = new Date().toISOString().split('T')[0];
  const todayPomos = dailyStats[todayKey] || 0;

  return (
    <div className={`app-root theme-${settings.theme} ${isZenMode ? 'zen-mode-active' : ''}`}>
      {/* Scanline overlay for Retro theme */}
      {settings.theme === 'retro' && <div className="crt-scanlines" />}

      {/* Background ambient decorative glow circles */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      {/* Zen Mode Floating Exit Button */}
      {isZenMode && (
        <button
          className="btn-exit-zen"
          onClick={handleToggleZenMode}
          title="Opustit Zen režim (Esc / F)"
        >
          <Minimize2 size={18} />
          <span>Opustit Zen</span>
        </button>
      )}

      {/* Main App Container */}
      <div className={`app-container ${isZenMode ? 'zen-container' : ''}`}>
        {/* Top Header (Hidden in Zen Mode) */}
        {!isZenMode && (
          <header className="app-header">
            <div className="header-brand">
              <span className="brand-icon">🍅</span>
              <div className="brand-titles">
                <h1 className="brand-title">Pomodoro Focus</h1>
                <span className="brand-subtitle">Lo-Fi & Retro Aesthetic Hub</span>
              </div>
            </div>

            <div className="header-actions">
              {/* Daily Streak Badge */}
              <button
                className="header-streak-badge"
                onClick={() => setIsStatsOpen(true)}
                title="Zobrazit statistiky"
              >
                <Flame size={16} className="streak-icon" />
                <span>{todayPomos}/{settings.dailyGoal} 🍅</span>
              </button>

              <button
                className="btn-header-action"
                onClick={() => setIsStatsOpen(true)}
                title="Statistiky produktivity"
                aria-label="Statistiky produktivity"
              >
                <BarChart3 size={18} />
                <span className="btn-label-desktop">Statistiky</span>
              </button>

              <button
                className="btn-header-action"
                onClick={handleToggleZenMode}
                title="Zen / Fullscreen režim (F)"
                aria-label="Zen / Fullscreen režim"
              >
                <Maximize2 size={18} />
                <span className="btn-label-desktop">Zen</span>
              </button>

              <button
                className="btn-header-action"
                onClick={() => setIsShortcutsOpen(true)}
                title="Klávesové zkratky (?)"
                aria-label="Klávesové zkratky"
              >
                <Keyboard size={18} />
                <span className="btn-label-desktop">Klávesy</span>
              </button>

              <button
                className="btn-header-action"
                onClick={() => playAlarm(settings.alarmSound, settings.alarmVolume)}
                title="Testovat zvuk alarmu"
                aria-label="Testovat zvuk alarmu"
              >
                <Bell size={18} />
              </button>

              <button
                className="btn-header-action btn-settings-trigger"
                onClick={() => setIsSettingsOpen(true)}
                title="Nastavení"
                aria-label="Nastavení"
              >
                <SettingsIcon size={18} />
                <span className="btn-label-desktop">Nastavení</span>
              </button>
            </div>
          </header>
        )}

        {/* Dashboard Main Grid */}
        <main className={`dashboard-grid ${isZenMode ? 'zen-grid' : ''}`}>
          {/* Left Column: Timer, Focus Buddy & Ambient Sound */}
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

            {!isZenMode && (
              <>
                {settings.focusBuddyEnabled && (
                  <FocusBuddy
                    todayPomos={todayPomos}
                    dailyGoal={settings.dailyGoal}
                    isRunning={isRunning}
                  />
                )}

                <AmbientPlayer
                  ambientSound={settings.ambientSound}
                  ambientVolume={settings.ambientVolume}
                  isPlaying={isAmbientPlaying}
                  onSoundChange={handleAmbientSoundChange}
                  onVolumeChange={handleAmbientVolumeChange}
                  onTogglePlay={handleToggleAmbient}
                />
              </>
            )}
          </section>

          {/* Right Column: Tasks & Theme Selector (Hidden in Zen Mode) */}
          {!isZenMode && (
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
          )}
        </main>

        {/* Footer (Hidden in Zen Mode) */}
        {!isZenMode && (
          <footer className="app-footer">
            <p>
              Stiskni <kbd className="footer-kbd">Space</kbd> pro Start/Pauzu • <kbd className="footer-kbd">F</kbd> pro Zen režim • <kbd className="footer-kbd">M</kbd> pro hudbu • <kbd className="footer-kbd">?</kbd> pro zkratky
            </p>
          </footer>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
        onResetDefaults={() => setSettings(DEFAULT_SETTINGS)}
      />

      {/* Productivity Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        dailyStats={dailyStats}
        dailyGoal={settings.dailyGoal}
        focusDurationMin={settings.focusDuration}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
