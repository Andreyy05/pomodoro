export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type Theme = 'lofi' | 'retro' | 'coffee' | 'matcha' | 'cyber';

export type AlarmSound = 'retro8bit' | 'lofiBell' | 'digitalWatch' | 'fanfare' | 'marimba';

export type AmbientSound = 'none' | 'rain' | 'vinyl' | 'lofiChords' | 'whiteNoise';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodorosCompleted: number;
  pomodorosTarget: number;
  createdAt: number;
}

export interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // sessions before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: AlarmSound;
  alarmVolume: number; // 0.0 to 1.0
  ambientSound: AmbientSound;
  ambientVolume: number; // 0.0 to 1.0
  tickingSound: boolean;
  theme: Theme;
}
