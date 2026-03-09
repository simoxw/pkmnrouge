import { BattlePokemon, Move, Type, Stats } from './types';
import { TYPE_CHART } from './constants';

export function calculateHP(base: number, level: number = 50): number {
  return Math.floor((base * level) / 50) + level + 10;
}

export function calculateStat(base: number, level: number = 50): number {
  return Math.floor((base * level) / 50) + 5;
}

export function getActualStats(baseStats: Stats, level: number = 50): Stats {
  return {
    hp: calculateHP(baseStats.hp, level),
    attack: calculateStat(baseStats.attack, level),
    defense: calculateStat(baseStats.defense, level),
    spAtk: calculateStat(baseStats.spAtk, level),
    spDef: calculateStat(baseStats.spDef, level),
    speed: calculateStat(baseStats.speed, level),
  };
}

/**
 * Ricalcola le statistiche in base al nuovo livello.
 */
export function updateStats(pokemon: BattlePokemon, newLevel: number): BattlePokemon {
  const newActualStats = getActualStats(pokemon.baseStats, newLevel);
  const hpDiff = newActualStats.hp - pokemon.actualStats.hp;
  
  return {
    ...pokemon,
    level: newLevel,
    actualStats: newActualStats,
    maxHp: newActualStats.hp,
    currentHp: pokemon.currentHp + hpDiff // Mantiene la proporzione di HP
  };
}

export function getTypeEffectiveness(attackType: Type, targetType: Type): number {
  return TYPE_CHART[attackType]?.[targetType] ?? 1;
}

/**
 * Formula del danno ufficiale:
 * Damage = (((2 * Level / 5 + 2) * Power * A/D) / 50 + 2) * Modifier
 */
export function calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: Move): { 
  damage: number, 
  effectiveness: number, 
  isCritical: boolean, 
  isMiss: boolean 
} {
  // Accuracy check
  const randomAccuracy = Math.random() * 100;
  if (randomAccuracy > move.accuracy) {
    return { damage: 0, effectiveness: 1, isCritical: false, isMiss: true };
  }

  // Status moves don't deal direct damage
  if (move.damageClass === 'status') {
    return { damage: 0, effectiveness: 1, isCritical: false, isMiss: false };
  }

  const level = attacker.level || 50;
  
  // Damage Class handling
  let A = move.damageClass === 'physical' ? attacker.actualStats.attack : attacker.actualStats.spAtk;
  let D = move.damageClass === 'physical' ? defender.actualStats.defense : defender.actualStats.spDef;

  // Burn reduces physical attack by 50%
  if (attacker.status === 'BRN' && move.damageClass === 'physical') {
    A = Math.floor(A * 0.5);
  }

  const baseDamage = (((2 * level / 5 + 2) * move.power * (A / D)) / 50 + 2);
  
  // Moltiplicatore casuale tra 0.85 e 1.0
  const random = 0.85 + Math.random() * 0.15;
  
  // STAB (Same Type Attack Bonus)
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Critical Hit (6.25% chance)
  const isCritical = Math.random() < 0.0625;
  const critMultiplier = isCritical ? 1.5 : 1;

  // Type Effectiveness
  let effectiveness = 1;
  defender.types.forEach(type => {
    effectiveness *= getTypeEffectiveness(move.type, type);
  });

  const damage = Math.floor(baseDamage * random * stab * effectiveness * critMultiplier);
  return { damage, effectiveness, isCritical, isMiss: false };
}
