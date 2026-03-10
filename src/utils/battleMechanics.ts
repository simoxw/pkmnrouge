import { BattlePokemon, Move, Type, Stats } from '../types';
import { TYPE_CHART } from '../constants';

// Tabella moltiplicatori stage (Gen 4/5 standard)
const STAGE_MULTIPLIERS: Record<number, number> = {
  [-6]: 0.25, [-5]: 2 / 7, [-4]: 1 / 3, [-3]: 0.4,
  [-2]: 0.5, [-1]: 2 / 3, [0]: 1,
  [1]: 1.5, [2]: 2, [3]: 2.5,
  [4]: 3, [5]: 3.5, [6]: 4
};

/**
 * Applica il moltiplicatore di stage a una statistica base
 */
export function getStatWithStage(baseStat: number, stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  const multiplier = STAGE_MULTIPLIERS[clamped] ?? 1;
  return Math.floor(baseStat * multiplier);
}

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

  // Damage Class handling con applicazione dei stage multipliers
  const atkStage = move.damageClass === 'physical'
    ? (attacker.statStages?.attack ?? 0)
    : (attacker.statStages?.spAtk ?? 0);
  const defStage = move.damageClass === 'physical'
    ? (defender.statStages?.defense ?? 0)
    : (defender.statStages?.spDef ?? 0);

  let A = getStatWithStage(
    move.damageClass === 'physical' ? attacker.actualStats.attack : attacker.actualStats.spAtk,
    atkStage
  );
  let D = getStatWithStage(
    move.damageClass === 'physical' ? defender.actualStats.defense : defender.actualStats.spDef,
    defStage
  );

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
