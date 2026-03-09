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
  // Status moves
  REST: { id: 'rest', name: 'Riposo', type: Type.PSYCHIC, power: 0, accuracy: 100, pp: 10, damageClass: 'status', target: 'user' },
  SWORDS_DANCE: { id: 'swords_dance', name: 'Danzaspada', type: Type.NORMAL, power: 0, accuracy: 100, pp: 20, damageClass: 'status', target: 'user', statChanges: [{ stat: 'attack', change: 2 }] },
  THUNDER_WAVE: { id: 'thunder_wave', name: 'Tuononda', type: Type.ELECTRIC, power: 0, accuracy: 100, pp: 20, damageClass: 'status', ailment: 'paralysis' },
  TOXIC: { id: 'toxic', name: 'Tossina', type: Type.POISON, power: 0, accuracy: 90, pp: 10, damageClass: 'status', ailment: 'poison' },
  WILL_O_WISP: { id: 'will_o_wisp', name: 'Fuocofatuo', type: Type.FIRE, power: 0, accuracy: 85, pp: 15, damageClass: 'status', ailment: 'burn' },
  // Damage + Status moves
  THUNDERBOLT: { id: 'thunderbolt', name: 'Fulmine', type: Type.ELECTRIC, power: 90, accuracy: 100, pp: 15, damageClass: 'special', ailment: 'paralysis', ailmentChance: 10 },
  FLAMETHROWER: { id: 'flamethrower', name: 'Lanciafiamme', type: Type.FIRE, power: 90, accuracy: 100, pp: 15, damageClass: 'special', ailment: 'burn', ailmentChance: 10 },
  ICE_BEAM: { id: 'ice_beam', name: 'Geloraggio', type: Type.ICE, power: 90, accuracy: 100, pp: 10, damageClass: 'special', ailment: 'freeze', ailmentChance: 10 },
  // Damage + Debuff moves
  BUBBLE_BEAM: { id: 'bubble_beam', name: 'Bollaraggio', type: Type.WATER, power: 65, accuracy: 100, pp: 20, damageClass: 'special', statChanges: [{ stat: 'speed', change: -1 }], ailmentChance: 10 },
  PSYCHIC: { id: 'psychic', name: 'Psichico', type: Type.PSYCHIC, power: 90, accuracy: 100, pp: 10, damageClass: 'special', statChanges: [{ stat: 'spDef', change: -1 }], ailmentChance: 10 },
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
    moves: [GEN4_MOVES.SCRATCH, GEN4_MOVES.EMBER, GEN4_MOVES.WILL_O_WISP, GEN4_MOVES.FLAMETHROWER],
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
