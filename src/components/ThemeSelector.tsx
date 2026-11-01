import React from 'react';
import { Palette } from 'lucide-react';
import type { Theme } from '../types';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const themes: { id: Theme; name: string; icon: string; previewColors: [string, string] }[] = [
    {
      id: 'lofi',
      name: 'Lo-Fi Chill',
      icon: '📻',
      previewColors: ['#a78bfa', '#f472b6'],
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      icon: '⛏️',
      previewColors: ['#4ade80', '#854d0e'],
    },
    {
      id: 'retro',
      name: '80s Retro',
      icon: '🕹️',
      previewColors: ['#06b6d4', '#ec4899'],
    },
    {
      id: 'sakura',
      name: 'Sakura Zen',
      icon: '🌸',
      previewColors: ['#f472b6', '#fda4af'],
    },
    {
      id: 'sunset',
      name: 'Miami Dusk',
      icon: '🌅',
      previewColors: ['#f97316', '#c084fc'],
    },
    {
      id: 'coffee',
      name: 'Cozy Coffee',
      icon: '☕',
      previewColors: ['#d97706', '#78350f'],
    },
    {
      id: 'matcha',
      name: 'Matcha Zen',
      icon: '🍵',
      previewColors: ['#10b981', '#065f46'],
    },
    {
      id: 'nordic',
      name: 'Nordic Frost',
      icon: '❄️',
      previewColors: ['#38bdf8', '#0284c7'],
    },
    {
      id: 'dracula',
      name: 'Dracula',
      icon: '🧛',
      previewColors: ['#bd93f9', '#ff79c6'],
    },
    {
      id: 'cyber',
      name: 'Cyberpunk',
      icon: '🌌',
      previewColors: ['#3b82f6', '#8b5cf6'],
    },
    {
      id: 'ocean',
      name: 'Deep Ocean',
      icon: '🌊',
      previewColors: ['#00e5ff', '#0284c7'],
    },
    {
      id: 'crimson',
      name: 'Crimson Moon',
      icon: '🍷',
      previewColors: ['#f43f5e', '#fbbf24'],
    },
  ];

  return (
    <div className="theme-selector-widget glass-card">
      <div className="theme-header">
        <Palette size={18} className="accent-icon" />
        <span className="theme-title">Visual Themes ({themes.length})</span>
      </div>
      <div className="theme-grid">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-card-btn ${currentTheme === t.id ? 'active' : ''}`}
            onClick={() => onThemeChange(t.id)}
            title={t.name}
          >
            <span className="theme-icon">{t.icon}</span>
            <div className="theme-name">{t.name}</div>
            <div className="theme-color-dots">
              <span className="dot" style={{ backgroundColor: t.previewColors[0] }} />
              <span className="dot" style={{ backgroundColor: t.previewColors[1] }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
