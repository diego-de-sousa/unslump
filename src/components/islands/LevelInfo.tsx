import { useStore } from '@nanostores/preact';
import { currentLevel } from '../../stores/levelStore';
import { useEffect, useRef } from 'preact/hooks';
import { animate } from 'motion';
import type { JSX } from 'preact';

interface ExerciseLevels {
  principiante: string;
  intermedio: string;
  avanzado: string;
}

interface LevelInfoProps {
  levels: ExerciseLevels;
  colorHex: string;
  colorLightHex: string;
  colorBorderHex: string;
  labels: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

export default function LevelInfo({
  levels,
  colorHex,
  colorLightHex,
  colorBorderHex,
  labels
}: LevelInfoProps) {
  const $currentLevel = useStore(currentLevel);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate when level changes
  useEffect(() => {
    if (containerRef.current) {
      animate(
        containerRef.current as any,
        { opacity: [0.6, 1], x: [-5, 0] },
        { duration: 0.3 }
      );
    }
  }, [$currentLevel]);

  const getLevelLabel = () => {
    switch ($currentLevel) {
      case 'principiante':
        return labels.beginner;
      case 'intermedio':
        return labels.intermediate;
      case 'avanzado':
        return labels.advanced;
      default:
        return labels.beginner;
    }
  };

  const getLevelText = () => {
    return levels[$currentLevel] || levels.principiante;
  };

  return (
    <div
      ref={containerRef}
      class="level-info mt-2 p-2 border rounded text-xs sm:text-sm"
      style={{
        backgroundColor: colorLightHex,
        borderColor: colorBorderHex
      }}
    >
      <span class="font-semibold" style={{ color: colorHex }}>
        {getLevelLabel()}:
      </span>{' '}
      <span class="text-slate-800 dark:text-gray-200">
        {getLevelText()}
      </span>
    </div>
  );
}
