export enum Type {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  ICE = 'Ice',
  FIGHTING = 'Fighting',
  POISON = 'Poison',
  GROUND = 'Ground',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  BUG = 'Bug',
  ROCK = 'Rock',
  GHOST = 'Ghost',
  DRAGON = 'Dragon',
  STEEL = 'Steel',
  DARK = 'Dark'
}

export type DamageClass = 'physical' | 'special' | 'status';

export interface Move {
  id: string;
  name: string;
  type: Type;
  power: number;
  accuracy: number;
  pp: number;
  damageClass: DamageClass;
  ailment?: string;
  ailmentChance?: number;
  statChanges?: { stat: keyof Stats; change: number }[];
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export type StatusCondition = 'PAR' | 'BRN' | 'PSN' | 'SLP' | 'FRZ';

export interface Pokemon {
  id: string;
  name: string;
  types: Type[];
  baseStats: Stats;
  moves: Move[];
  ability: string;
  spriteUrl: string;
  cryUrl?: string;
}

export interface BattlePokemon extends Pokemon {
  currentHp: number;
  maxHp: number;
  actualStats: Stats;
  level: number;
  status: StatusCondition | null;
  sleepTurns?: number;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'status' | 'victory' | 'defeat';
}

export type GameState = 'DRAFT' | 'NAVIGATION' | 'BATTLE' | 'RECRUITMENT' | 'LEARN_MOVE' | 'GAME_OVER';

export interface SaveData {
  gameState: GameState;
  party: BattlePokemon[];
  roomNumber: number;
  timestamp: number;
}

