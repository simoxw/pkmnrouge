import { Pokemon, Type, Move } from './types';

export const GEN4_MOVES: Record<string, Move> = {
  TACKLE: { id: 'tackle', name: 'Azione', type: Type.NORMAL, power: 40, accuracy: 100, pp: 35, damageClass: 'physical' },
  RAZOR_LEAF: { id: 'razor_leaf', name: 'Fogliama', type: Type.GRASS, power: 55, accuracy: 95, pp: 25, damageClass: 'physical' },
  EMBER: { id: 'ember', name: 'Braciere', type: Type.FIRE, power: 40, accuracy: 100, pp: 25, damageClass: 'special' },
  WATER_GUN: { id: 'water_gun', name: 'Pistolacqua', type: Type.WATER, power: 40, accuracy: 100, pp: 25, damageClass: 'special' },
  QUICK_ATTACK: { id: 'quick_attack', name: 'Attacco Rapido', type: Type.NORMAL, power: 40, accuracy: 100, pp: 30, damageClass: 'physical' },
  BUBBLE: { id: 'bubble', name: 'Bolla', type: Type.WATER, power: 20, accuracy: 100, pp: 30, damageClass: 'special' },
  SCRATCH: { id: 'scratch', name: 'Graffio', type: Type.NORMAL, power: 40, accuracy: 100, pp: 35, damageClass: 'physical' },
  PECK: { id: 'peck', name: 'Beccata', type: Type.FLYING, power: 35, accuracy: 100, pp: 35, damageClass: 'physical' },
  LEAF_STORM: { id: 'leaf_storm', name: 'Verdebufera', type: Type.GRASS, power: 130, accuracy: 90, pp: 5, damageClass: 'special' },
  FLAME_WHEEL: { id: 'flame_wheel', name: 'Ruotafuoco', type: Type.FIRE, power: 60, accuracy: 100, pp: 25, damageClass: 'physical' },
};

export const POKEMON_DATABASE: Pokemon[] = [
  {
    id: '387',
    name: 'Turtwig',
    types: [Type.GRASS],
    baseStats: { hp: 55, attack: 68, defense: 64, spAtk: 45, spDef: 55, speed: 31 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.RAZOR_LEAF, GEN4_MOVES.QUICK_ATTACK, GEN4_MOVES.SCRATCH],
    ability: 'Erbaiuto',
    spriteUrl: '' // Will be generated dynamically in BattleEngine
  },
  {
    id: '388',
    name: 'Grotle',
    types: [Type.GRASS],
    baseStats: { hp: 75, attack: 89, defense: 85, spAtk: 55, spDef: 65, speed: 36 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.RAZOR_LEAF, GEN4_MOVES.QUICK_ATTACK, GEN4_MOVES.SCRATCH],
    ability: 'Erbaiuto',
    spriteUrl: ''
  },
  {
    id: '389',
    name: 'Torterra',
    types: [Type.GRASS, Type.GROUND],
    baseStats: { hp: 95, attack: 109, defense: 105, spAtk: 75, spDef: 85, speed: 56 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.RAZOR_LEAF, GEN4_MOVES.LEAF_STORM, GEN4_MOVES.QUICK_ATTACK],
    ability: 'Erbaiuto',
    spriteUrl: ''
  },
  {
    id: '390',
    name: 'Chimchar',
    types: [Type.FIRE],
    baseStats: { hp: 44, attack: 58, defense: 44, spAtk: 58, spDef: 44, speed: 61 },
    moves: [GEN4_MOVES.SCRATCH, GEN4_MOVES.EMBER, GEN4_MOVES.QUICK_ATTACK, GEN4_MOVES.TACKLE],
    ability: 'Aiutofuoco',
    spriteUrl: ''
  },
  {
    id: '391',
    name: 'Monferno',
    types: [Type.FIRE, Type.FIGHTING],
    baseStats: { hp: 64, attack: 78, defense: 52, spAtk: 78, spDef: 52, speed: 81 },
    moves: [GEN4_MOVES.SCRATCH, GEN4_MOVES.EMBER, GEN4_MOVES.FLAME_WHEEL, GEN4_MOVES.QUICK_ATTACK],
    ability: 'Aiutofuoco',
    spriteUrl: ''
  },
  {
    id: '392',
    name: 'Infernape',
    types: [Type.FIRE, Type.FIGHTING],
    baseStats: { hp: 76, attack: 104, defense: 71, spAtk: 104, spDef: 71, speed: 108 },
    moves: [GEN4_MOVES.SCRATCH, GEN4_MOVES.EMBER, GEN4_MOVES.FLAME_WHEEL, GEN4_MOVES.QUICK_ATTACK],
    ability: 'Aiutofuoco',
    spriteUrl: ''
  },
  {
    id: '393',
    name: 'Piplup',
    types: [Type.WATER],
    baseStats: { hp: 53, attack: 51, defense: 53, spAtk: 61, spDef: 56, speed: 40 },
    moves: [GEN4_MOVES.POUND || GEN4_MOVES.TACKLE, GEN4_MOVES.BUBBLE, GEN4_MOVES.WATER_GUN, GEN4_MOVES.PECK],
    ability: 'Acquaiuto',
    spriteUrl: ''
  },
  {
    id: '394',
    name: 'Prinplup',
    types: [Type.WATER],
    baseStats: { hp: 64, attack: 66, defense: 68, spAtk: 81, spDef: 76, speed: 50 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.BUBBLE, GEN4_MOVES.WATER_GUN, GEN4_MOVES.PECK],
    ability: 'Acquaiuto',
    spriteUrl: ''
  },
  {
    id: '395',
    name: 'Empoleon',
    types: [Type.WATER, Type.STEEL],
    baseStats: { hp: 84, attack: 86, defense: 88, spAtk: 111, spDef: 101, speed: 60 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.BUBBLE, GEN4_MOVES.WATER_GUN, GEN4_MOVES.PECK],
    ability: 'Acquaiuto',
    spriteUrl: ''
  },
  {
    id: '396',
    name: 'Starly',
    types: [Type.NORMAL, Type.FLYING],
    baseStats: { hp: 40, attack: 55, defense: 30, spAtk: 30, spDef: 30, speed: 60 },
    moves: [GEN4_MOVES.TACKLE, GEN4_MOVES.QUICK_ATTACK, GEN4_MOVES.PECK, GEN4_MOVES.SCRATCH],
    ability: 'Sguardofermo',
    spriteUrl: ''
  }
];
