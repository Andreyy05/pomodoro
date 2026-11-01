import React from 'react';
import { Volume2, VolumeX, CloudRain, Disc, Music, Wind } from 'lucide-react';
import type { AmbientSound } from '../types';

interface AmbientPlayerProps {
  ambientSound: AmbientSound;
  ambientVolume: number;
  isPlaying: boolean;
  onSoundChange: (sound: AmbientSound) => void;
  onVolumeChange: (volume: number) => void;
  onTogglePlay: () => void;
}

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  ambientSound,
  ambientVolume,
  isPlaying,
  onSoundChange,
  onVolumeChange,
  onTogglePlay,
}) => {
  const soundOptions: { id: AmbientSound; label: string; icon: React.ReactNode }[] = [
    { id: 'none', label: 'Mute', icon: <VolumeX size={16} /> },
    { id: 'c418', label: 'C418 ⛏️', icon: <span style={{ fontSize: '14px', lineHeight: 1 }}>🟩</span> },
    { id: 'rain', label: 'Rain', icon: <CloudRain size={16} /> },
    { id: 'vinyl', label: 'Vinyl', icon: <Disc size={16} /> },
    { id: 'lofiChords', label: 'Lo-Fi', icon: <Music size={16} /> },
    { id: 'whiteNoise', label: 'Noise', icon: <Wind size={16} /> },
  ];

  return (
    <div className="ambient-widget glass-card">
      <div className="ambient-header">
        <div className="ambient-title">
          <span className="ambient-title-icon">🎧</span>
          <span className="ambient-title-text">Lo-Fi Ambient Audio</span>
        </div>
        {ambientSound !== 'none' && (
          <div className={`soundwave-badge ${isPlaying ? 'active' : ''}`}>
            <span className="bar bar-1"></span>
            <span className="bar bar-2"></span>
            <span className="bar bar-3"></span>
            <span className="bar bar-4"></span>
          </div>
        )}
      </div>

      <div className="ambient-sound-buttons">
        {soundOptions.map((opt) => (
          <button
            key={opt.id}
            className={`ambient-btn ${ambientSound === opt.id ? 'active' : ''}`}
            onClick={() => {
              onSoundChange(opt.id);
            }}
            title={opt.label}
          >
            {opt.icon}
            <span className="ambient-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {ambientSound !== 'none' && (
        <div className="ambient-controls-row">
          <button
            className="btn-ambient-mute"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Ambient' : 'Resume Ambient'}
          >
            {isPlaying && ambientVolume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ambientVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="Ambient volume"
          />
          <span className="volume-percentage">{Math.round(ambientVolume * 100)}%</span>
        </div>
      )}
    </div>
  );
};
