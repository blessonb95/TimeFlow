import React, { useState } from 'react';
import { fireEasterEgg } from './EasterEgg';

interface SparkleButtonProps {
  onOpenSearch?: () => void;
}

const QUIRKY_MESSAGES = [
  { icon: '✨', line1: 'Magic Portal Activated!', line2: 'You found the secret sparkle button! 🚀' },
  { icon: '☕', line1: 'Instant Espresso Injection!', line2: '+500% speed typing timesheets ⚡' },
  { icon: '🍕', line1: 'Pizza Radar Online!', line2: 'Searching for free office snacks... 🍕' },
  { icon: '🕹️', line1: 'Retro Arcade Mode!', line2: 'Try typing "konami" on your keyboard!' },
  { icon: '🔐', line1: 'Sudo Approval Granted!', line2: '...just kidding, ask your manager 😄' },
  { icon: '🤙', line1: 'YOLO Mode Engaged!', line2: 'Remember to submit timesheets on time!' },
];

export const SparkleButton: React.FC<SparkleButtonProps> = ({ onOpenSearch }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = () => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 300);

    // Pick a random fun easter egg message
    const randomEgg = QUIRKY_MESSAGES[Math.floor(Math.random() * QUIRKY_MESSAGES.length)];
    fireEasterEgg(randomEgg.icon, randomEgg.line1, randomEgg.line2);

    if (onOpenSearch) {
      setTimeout(() => {
        onOpenSearch();
      }, 350);
    }
  };

  return (
    <div
      className="sparkle-btn-wrap"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Secret Exciting Sparkle Button"
        className={`sparkle-btn${isClicking ? ' sparkle-btn--clicking' : showTooltip ? ' sparkle-btn--hover' : ''}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`sparkle-btn__icon${showTooltip ? ' sparkle-btn__icon--hover' : ''}`}
        >
          <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2Z" />
        </svg>
      </button>

      {showTooltip && (
        <div role="tooltip" className="sparkle-btn__tooltip">
          <div className="sparkle-btn__arrow" />
          <div className="sparkle-btn__card">
            <div className="sparkle-btn__signal">
              <span className="sparkle-btn__dot">
                <span className="sparkle-btn__ping" />
              </span>
              <span>QUIRKY SIGNAL DETECTED 📡</span>
            </div>

            <div className="sparkle-btn__msg">
              <span>✨ Click here for something exciting!</span>
              <span className="sparkle-btn__secret">SECRET</span>
            </div>

            <div className="sparkle-btn__hint">
              Hint: Unlocks hidden magic, easter eggs & shortcuts 🤫
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
