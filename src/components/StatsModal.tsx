import React from 'react';
import { X, Flame, CheckCircle, BarChart3, Clock, Trophy } from 'lucide-react';
import type { DailyStats } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyStats: DailyStats;
  dailyGoal: number;
  focusDurationMin: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  dailyStats,
  dailyGoal,
  focusDurationMin,
}) => {
  if (!isOpen) return null;

  // Format today's date key "YYYY-MM-DD"
  const getTodayKey = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const todayKey = getTodayKey();
  const todayPomos = dailyStats[todayKey] || 0;

  // Calculate Streak: consecutive days ending today or yesterday
  const calculateStreak = (): number => {
    let streak = 0;
    const current = new Date();
    
    // Check today first; if 0 pomos today, streak can still be alive if yesterday had >0
    const todayStr = current.toISOString().split('T')[0];
    const hasToday = (dailyStats[todayStr] || 0) > 0;
    if (hasToday) {
      streak++;
    }

    // Check preceding days
    for (let i = 1; i <= 365; i++) {
      const prevDate = new Date();
      prevDate.setDate(current.getDate() - i);
      const prevStr = prevDate.toISOString().split('T')[0];
      if ((dailyStats[prevStr] || 0) > 0) {
        streak++;
      } else {
        // If yesterday was missed, streak is broken
        if (i === 1 && !hasToday) {
          return 0;
        }
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Total pomodoros across all recorded days
  const totalPomos = Object.values(dailyStats).reduce((sum, val) => sum + val, 0);
  const totalMinutes = totalPomos * focusDurationMin;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Last 7 days data for bar chart
  const last7Days: { dateKey: string; label: string; count: number; dayNum: number }[] = [];
  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const count = dailyStats[dateKey] || 0;
    last7Days.push({ dateKey, label: dayName, count, dayNum: d.getDate() });
  }

  const maxDailyCount = Math.max(dailyGoal, ...last7Days.map((d) => d.count), 1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={20} className="accent-icon" />
            <h2>Statistiky & Produktivita</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close stats">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Metric Stat Cards */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <Flame size={18} className="stat-icon-flame" />
                <span>Denní Streak</span>
              </div>
              <div className="stat-card-value">{streak} <span className="stat-unit">dní</span></div>
              <span className="stat-card-sub">
                {streak > 0 ? 'Paráda! Drž tempo dál.' : 'Začni sérii dokončením pomodora!'}
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <Trophy size={18} className="stat-icon-trophy" />
                <span>Dnešní Cíl</span>
              </div>
              <div className="stat-card-value">
                {todayPomos} / {dailyGoal} <span className="stat-unit">🍅</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, (todayPomos / dailyGoal) * 100)}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <Clock size={18} className="stat-icon-clock" />
                <span>Odpracovaný Čas</span>
              </div>
              <div className="stat-card-value">{totalHours} <span className="stat-unit">hodin</span></div>
              <span className="stat-card-sub">Celkem {totalPomos} dokončených sprintů</span>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="settings-section">
            <div className="section-title">
              <BarChart3 size={16} />
              <span>Aktivita za posledních 7 dní</span>
            </div>

            <div className="chart-wrapper">
              <div className="chart-bars-container">
                {last7Days.map((day) => {
                  const heightPercent = Math.max(8, (day.count / maxDailyCount) * 100);
                  const isToday = day.dateKey === todayKey;
                  const isGoalReached = day.count >= dailyGoal;

                  return (
                    <div key={day.dateKey} className={`chart-col ${isToday ? 'is-today' : ''}`}>
                      <div className="chart-bar-outer" title={`${day.label} (${day.count} 🍅 = ${day.count * focusDurationMin} min)`}>
                        <span className="chart-bar-count">{day.count > 0 ? day.count : ''}</span>
                        <div
                          className={`chart-bar-inner ${isGoalReached ? 'goal-reached' : ''}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="chart-label-col">
                        <span className="day-name">{day.label}</span>
                        <span className="day-number">{day.dayNum}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-dot goal-dot" /> Splněný denní cíl ({dailyGoal}+ 🍅)
                </span>
                <span className="legend-item">
                  <span className="legend-dot today-dot" /> Dnes
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="stats-quote">
            <CheckCircle size={15} className="accent-icon" />
            <span>Konzistence je klíčem k úspěchu!</span>
          </div>
          <button className="btn-save-modal" onClick={onClose}>
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
