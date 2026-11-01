import React from 'react';
import { X, Volume2, Bell, Clock, Sliders, Play, RotateCcw } from 'lucide-react';
import type { PomodoroSettings, AlarmSound } from '../types';
import { playAlarm } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const alarmSounds: { id: AlarmSound; label: string; desc: string }[] = [
    { id: 'retro8bit', label: '🕹️ 8-Bit Arcade Fanfare', desc: 'Vintage NES retro gaming win sequence' },
    { id: 'lofiBell', label: '🔔 Lo-Fi Zen Bell', desc: 'Warm meditative Tibetan singing chime' },
    { id: 'digitalWatch', label: '⌚ Digital Casio Beep', desc: 'Classic 90s dual wrist-watch alert' },
    { id: 'fanfare', label: '🎺 Victory Brass Synth', desc: 'Uplifting modern synth chord fanfare' },
    { id: 'marimba', label: '🪵 Acoustic Marimba', desc: 'Cheerful gentle wooden percussion' },
  ];

  const handleTestSound = (soundId: AlarmSound) => {
    playAlarm(soundId, settings.alarmVolume);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={20} className="accent-icon" />
            <h2>Timer & Sound Settings</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Timer Durations */}
          <div className="settings-section">
            <div className="section-title">
              <Clock size={16} />
              <span>Time Intervals (Minutes)</span>
            </div>
            <div className="durations-grid">
              <div className="duration-input-card">
                <label htmlFor="focus-min">Focus</label>
                <input
                  id="focus-min"
                  type="number"
                  min="1"
                  max="120"
                  value={settings.focusDuration}
                  onChange={(e) =>
                    onUpdateSettings({ focusDuration: Math.max(1, parseInt(e.target.value) || 25) })
                  }
                />
              </div>

              <div className="duration-input-card">
                <label htmlFor="sbreak-min">Short Break</label>
                <input
                  id="sbreak-min"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.shortBreakDuration}
                  onChange={(e) =>
                    onUpdateSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value) || 5) })
                  }
                />
              </div>

              <div className="duration-input-card">
                <label htmlFor="lbreak-min">Long Break</label>
                <input
                  id="lbreak-min"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.longBreakDuration}
                  onChange={(e) =>
                    onUpdateSettings({ longBreakDuration: Math.max(1, parseInt(e.target.value) || 15) })
                  }
                />
              </div>

              <div className="duration-input-card">
                <label htmlFor="interval-count">Long Break Every</label>
                <div className="input-with-suffix">
                  <input
                    id="interval-count"
                    type="number"
                    min="1"
                    max="12"
                    value={settings.longBreakInterval}
                    onChange={(e) =>
                      onUpdateSettings({ longBreakInterval: Math.max(1, parseInt(e.target.value) || 4) })
                    }
                  />
                  <span>cycles</span>
                </div>
              </div>

              <div className="duration-input-card">
                <label htmlFor="daily-goal-input">Denní cíl (Daily Goal)</label>
                <div className="input-with-suffix">
                  <input
                    id="daily-goal-input"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.dailyGoal || 8}
                    onChange={(e) =>
                      onUpdateSettings({ dailyGoal: Math.max(1, parseInt(e.target.value) || 8) })
                    }
                  />
                  <span>🍅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alarm Sound Picker */}
          <div className="settings-section">
            <div className="section-title">
              <Bell size={16} />
              <span>Retro Alarm & Notification Sound</span>
            </div>
            <div className="alarm-sound-list">
              {alarmSounds.map((snd) => (
                <div
                  key={snd.id}
                  className={`alarm-sound-item ${settings.alarmSound === snd.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ alarmSound: snd.id })}
                >
                  <div className="alarm-radio-content">
                    <input
                      type="radio"
                      name="alarmSound"
                      checked={settings.alarmSound === snd.id}
                      onChange={() => onUpdateSettings({ alarmSound: snd.id })}
                    />
                    <div className="alarm-text">
                      <span className="alarm-name">{snd.label}</span>
                      <span className="alarm-desc">{snd.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-test-sound"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(snd.id);
                    }}
                    title="Preview sound"
                  >
                    <Play size={14} />
                    <span>Test</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Alarm volume slider */}
            <div className="sound-slider-row">
              <div className="sound-slider-label">
                <Volume2 size={16} />
                <span>Alarm Volume</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.alarmVolume}
                onChange={(e) => onUpdateSettings({ alarmVolume: parseFloat(e.target.value) })}
                className="volume-slider"
              />
              <span className="volume-percentage">{Math.round(settings.alarmVolume * 100)}%</span>
            </div>
          </div>

          {/* Automation & Ticking */}
          <div className="settings-section">
            <div className="section-title">
              <Sliders size={16} />
              <span>Preferences</span>
            </div>
            <div className="checkbox-options">

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => onUpdateSettings({ autoStartBreaks: e.target.checked })}
                />
                <div className="checkbox-text">
                  <span className="checkbox-title">Auto-start Breaks</span>
                  <span className="checkbox-sub">Automatically start break timer when focus session finishes</span>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => onUpdateSettings({ autoStartPomodoros: e.target.checked })}
                />
                <div className="checkbox-text">
                  <span className="checkbox-title">Auto-start Pomodoros</span>
                  <span className="checkbox-sub">Automatically start next focus session when break finishes</span>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={settings.tickingSound}
                  onChange={(e) => onUpdateSettings({ tickingSound: e.target.checked })}
                />
                <div className="checkbox-text">
                  <span className="checkbox-title">Clock Ticking Sound</span>
                  <span className="checkbox-sub">Subtle soft clock tick each second while timer runs</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-reset-defaults" onClick={onResetDefaults}>
            <RotateCcw size={14} />
            <span>Restore Defaults</span>
          </button>
          <button className="btn-save-modal" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};