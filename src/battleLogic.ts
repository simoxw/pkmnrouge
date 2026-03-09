import { BattlePokemon, Move, Type } from './types';

const TYPE_CHART: Record<Type, Partial<Record<Type, number>>> = {
  [Type.NORMAL]: { [Type.ROCK]: 0.5, [Type.STEEL]: 0.5, [Type.GHOST]: 0 },
  [Type.FIRE]: { [Type.FIRE]: 0.5, [Type.WATER]: 0.5, [Type.GRASS]: 2, [Type.ICE]: 2, [Type.BUG]: 2, [Type.ROCK]: 0.5, [Type.DRAGON]: 0.5, [Type.STEEL]: 2 },
  [Type.WATER]: { [Type.FIRE]: 2, [Type.WATER]: 0.5, [Type.GRASS]: 0.5, [Type.GROUND]: 2, [Type.ROCK]: 2, [Type.DRAGON]: 0.5 },
  [Type.GRASS]: { [Type.FIRE]: 0.5, [Type.WATER]: 2, [Type.GRASS]: 0.5, [Type.POISON]: 0.5, [Type.GROUND]: 2, [Type.FLYING]: 0.5, [Type.BUG]: 0.5, [Type.ROCK]: 2, [Type.DRAGON]: 0.5, [Type.STEEL]: 0.5 },
  [Type.ELECTRIC]: { [Type.WATER]: 2, [Type.GRASS]: 0.5, [Type.ELECTRIC]: 0.5, [Type.GROUND]: 0, [Type.FLYING]: 2, [Type.DRAGON]: 0.5 },
  [Type.ICE]: { [Type.FIRE]: 0.5, [Type.WATER]: 0.5, [Type.GRASS]: 2, [Type.ICE]: 0.5, [Type.GROUND]: 2, [Type.FLYING]: 2, [Type.DRAGON]: 2, [Type.STEEL]: 0.5 },
  [Type.FIGHTING]: { [Type.NORMAL]: 2, [Type.ICE]: 2, [Type.POISON]: 0.5, [Type.FLYING]: 0.5, [Type.PSYCHIC]: 0.5, [Type.BUG]: 0.5, [Type.ROCK]: 2, [Type.GHOST]: 0, [Type.STEEL]: 2 },
  [Type.POISON]: { [Type.GRASS]: 2, [Type.POISON]: 0.5, [Type.GROUND]: 0.5, [Type.ROCK]: 0.5, [Type.GHOST]: 0.5, [Type.STEEL]: 0 },
  [Type.GROUND]: { [Type.FIRE]: 2, [Type.GRASS]: 0.5, [Type.ELECTRIC]: 2, [Type.POISON]: 2, [Type.FLYING]: 0, [Type.BUG]: 0.5, [Type.ROCK]: 2, [Type.STEEL]: 2 },
  [Type.FLYING]: { [Type.GRASS]: 2, [Type.ELECTRIC]: 0.5, [Type.FIGHTING]: 2, [Type.BUG]: 2, [Type.ROCK]: 0.5, [Type.STEEL]: 0.5 },
  [Type.PSYCHIC]: { [Type.FIGHTING]: 2, [Type.POISON]: 2, [Type.PSYCHIC]: 0.5, [Type.STEEL]: 0.5 },
  [Type.BUG]: { [Type.FIRE]: 0.5, [Type.GRASS]: 2, [Type.FIGHTING]: 0.5, [Type.POISON]: 0.5, [Type.FLYING]: 0.5, [Type.PSYCHIC]: 2, [Type.GHOST]: 0.5, [Type.STEEL]: 0.5 },
  [Type.ROCK]: { [Type.FIRE]: 2, [Type.ICE]: 2, [Type.FIGHTING]: 0.5, [Type.GROUND]: 0.5, [Type.FLYING]: 2, [Type.BUG]: 2, [Type.STEEL]: 0.5 },
  [Type.GHOST]: { [Type.NORMAL]: 0, [Type.PSYCHIC]: 2, [Type.GHOST]: 2 },
  [Type.DRAGON]: { [Type.DRAGON]: 2, [Type.STEEL]: 0.5 },
  [Type.STEEL]: { [Type.FIRE]: 0.5, [Type.WATER]: 0.5, [Type.ELECTRIC]: 0.5, [Type.ICE]: 2, [Type.ROCK]: 2, [Type.STEEL]: 0.5 }
};

export function getTypeEffectiveness(attackType: Type, targetType: Type): number {
  return TYPE_CHART[attackType]?.[targetType] ?? 1;
}

/**
 * Formula del danno semplificata basata sulla formula ufficiale:
 * Damage = (((2 * Level / 5 + 2) * Power * A/D) / 50 + 2) * Modifier
 * Qui assumiamo Level = 50 per semplicità.
 */
export function calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: Move): { damage: number, effectiveness: number } {
  const level = 50;
  // Semplificazione: usiamo attack/defense per ora, 
  // in un sistema reale dovremmo distinguere tra Physical e Special
  const A = attacker.baseStats.attack; 
  const D = defender.baseStats.defense;

  const baseDamage = (((2 * level / 5 + 2) * move.power * (A / D)) / 50 + 2);
  
  // Moltiplicatore casuale tra 0.85 e 1.0
  const random = 0.85 + Math.random() * 0.15;
  
  // STAB (Same Type Attack Bonus)
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Type Effectiveness
  let effectiveness = 1;
  defender.types.forEach(type => {
    effectiveness *= getTypeEffectiveness(move.type, type);
  });

  const damage = Math.floor(baseDamage * random * stab * effectiveness);
  return { damage, effectiveness };
}
