import { useStore } from '@nanostores/preact';
import { currentLevel, setLevel, type Level } from '../../stores/levelStore';
import { useRef } from 'preact/hooks';
import { animate } from 'motion';
import type { JSX } from 'preact';

interface LevelOption {
  key: Level;
  label: string;
  desc: string;
  icon: string;
  gradient: string;
  border: string;
  ring: string;
  text: string;
  textLight: string;
}

interface LevelSelectorProps {
  levels: LevelOption[];
  onLevelChange?: (level: Level) => void;
}

export default function LevelSelector({ levels, onLevelChange }: LevelSelectorProps) {
  const $currentLevel = useStore(currentLevel);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleLevelClick = (level: Level) => {
    const buttonEl = buttonRefs.current[level];

    // Pulse animation on click
    if (buttonEl) {
      animate(
        buttonEl as any,
        { scale: [1, 1.15, 1] },
        { duration: 0.4 }
      );
    }

    setLevel(level);

    if (onLevelChange) {
      onLevelChange(level);
    }
  };

  const handleMouseEnter = (level: Level) => {
    if (level !== $currentLevel) {
      const buttonEl = buttonRefs.current[level];
      if (buttonEl) {
        animate(buttonEl as any, { scale: 1.05 }, { duration: 0.2 });
      }
    }
  };

  const handleMouseLeave = (level: Level) => {
    if (level !== $currentLevel) {
      const buttonEl = buttonRefs.current[level];
      if (buttonEl) {
        animate(buttonEl as any, { scale: 1 }, { duration: 0.2 });
      }
    }
  };

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-2">
      {levels.map((level) => {
        const isSelected = level.key === $currentLevel;

        const baseClasses = "relative text-left p-3 rounded-xl transition-all duration-300 cursor-pointer group overflow-hidden border-2";

        const selectedClasses = isSelected
          ? `bg-gradient-to-br ${level.gradient} ${level.border} ${level.ring} shadow-lg scale-105 ring-2 ring-offset-2`
          : "bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md";

        return (
          <button
            key={level.key}
            ref={(el) => { if (el) buttonRefs.current[level.key] = el; }}
            class={`${baseClasses} ${selectedClasses}`}
            onClick={() => handleLevelClick(level.key)}
            onMouseEnter={() => handleMouseEnter(level.key)}
            onMouseLeave={() => handleMouseLeave(level.key)}
          >
            {/* Icon badge */}
            <div class={`absolute top-2 right-2 text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
              {level.icon}
            </div>

            <div class={`text-sm font-bold mb-1 ${
              isSelected
                ? `${level.text} dark:text-blue-300`
                : 'text-slate-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }`}>
              {level.label}
            </div>

            <div class={`text-xs leading-relaxed pr-8 ${
              isSelected
                ? `${level.textLight} dark:text-blue-400`
                : 'text-slate-600 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-300'
            }`}>
              {level.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}
