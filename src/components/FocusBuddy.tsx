import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface FocusBuddyProps {
  todayPomos: number;
  dailyGoal: number;
  isRunning: boolean;
}

export const FocusBuddy: React.FC<FocusBuddyProps> = ({ todayPomos, dailyGoal, isRunning }) => {
  const [clickCount, setClickCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);

  // Growth stage
  let stage = 1;
  let stageName = 'Klíček (Sprout)';
  let characterEmoji = '🌱';
  let defaultQuote = 'Začni pracovat a pomoz mi vyrůst!';

  if (todayPomos >= dailyGoal && dailyGoal > 0) {
    stage = 4;
    stageName = 'Mistr Rajče (Golden Tomato)';
    characterEmoji = '👑🍅';
    defaultQuote = 'Neuvěřitelné! Dnešní cíl splněn, jsi borec!';
  } else if (todayPomos >= Math.ceil(dailyGoal * 0.6)) {
    stage = 3;
    stageName = 'Kvetoucí keřík (Blooming)';
    characterEmoji = '🍅🌿';
    defaultQuote = 'Už mám krásné plody! Skvělé soustředění.';
  } else if (todayPomos >= 1) {
    stage = 2;
    stageName = 'Sazenička (Growing Plant)';
    characterEmoji = '🌿';
    defaultQuote = 'Rostu s tebou! Každé pomodoro mi dodává sílu.';
  }

  if (isRunning) {
    defaultQuote = 'Pššt, teď se soustředíme... Jsem tu s tebou!';
  }

  const quotes = [
    'Nezapomeň se občas napít vody! 💧',
    'Každá minuta tě posouvá blíž k cíli! ✨',
    'Moc ti to dnes jde, jen tak dál! 🚀',
    'Tvůj focus je inspirující! 🍅',
    'Díky za zalévání tvojí prací! 🌸',
  ];

  const currentQuote = clickCount > 0 ? quotes[(clickCount - 1) % quotes.length] : defaultQuote;

  const handleClick = () => {
    setClickCount((c) => c + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="focus-buddy-widget glass-card">
      <div className="buddy-header">
        <div className="buddy-title">
          <Sparkles size={16} className="accent-icon" />
          <span>Focus Buddy</span>
        </div>
        <span className="buddy-stage-pill">
          Fáze {stage}/4 • {todayPomos}/{dailyGoal} 🍅
        </span>
      </div>

      <div className="buddy-content" onClick={handleClick} title="Klikni na mě!">
        {showHeart && <Heart size={24} className="floating-heart" />}
        <div className={`buddy-avatar ${isRunning ? 'swaying' : ''}`}>
          <span className="avatar-emoji">{characterEmoji}</span>
          <div className="pot-base">🏺</div>
        </div>

        <div className="buddy-dialogue">
          <div className="buddy-speech-bubble">
            <p>{currentQuote}</p>
          </div>
          <span className="buddy-label">{stageName}</span>
        </div>
      </div>
    </div>
  );
};
