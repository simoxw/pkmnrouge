import React from 'react';
import { BattlePokemon } from '../types';

interface StatStagesBadgesProps {
  pokemon: BattlePokemon;
  className?: string;
}

export default function StatStagesBadges({ pokemon, className = '' }: StatStagesBadgesProps) {
  const stages = pokemon.statStages || {
    hp: 0,
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0
  };

  // Filter out zero stages
  const activeStages = [
    { label: 'ATK', value: stages.attack },
    { label: 'DEF', value: stages.defense },
    { label: 'SPA', value: stages.spAtk },
    { label: 'SPD', value: stages.spDef },
    { label: 'SPE', value: stages.speed }
  ].filter(s => s.value !== 0);

  if (activeStages.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 mt-1.5 min-h-[20px] ${className}`}>
      {activeStages.map(stage => (
        <div
          key={stage.label}
          className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-tight inline-flex items-center gap-1 ${
            stage.value > 0
              ? 'bg-blue-600/70 text-white border border-blue-400/40'
              : 'bg-rose-600/70 text-white border border-rose-400/40'
          }`}
        >
          <span>{stage.label}</span>
          <span>{stage.value > 0 ? '⬆' : '⬇'}</span>
          <span className="font-mono ml-0.5">{Math.abs(stage.value)}</span>
        </div>
      ))}
    </div>
  );
}
