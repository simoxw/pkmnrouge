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
  DARK = 'Dark',
  FAIRY = 'Fairy'
}

export type DamageClass = 'physical' | 'special' | 'status';

export interface Move {
  id: string;
  name: string;
  type: Type;
  power: number;
  accuracy: number;
  pp: number;
  currentPp?: number;
  damageClass: DamageClass;
  ailment?: string;
  ailmentChance?: number;
  statChanges?: { stat: keyof Stats; change: number }[];
  target?: string;
  priority?: number;
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
  statStages?: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'status' | 'victory' | 'defeat';
}

export type GameState = 'MAIN_MENU' | 'DRAFT' | 'HUB' | 'BATTLE' | 'RECRUITMENT' | 'LEARN_MOVE' | 'SHOP' | 'GAME_OVER' | 'PROFILE' | 'OPTIONS';

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  minRoom?: number;
  effect: (pokemon: BattlePokemon) => { updatedPokemon: BattlePokemon, message: string };
}

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface SaveData {
  gameState: GameState;
  party: BattlePokemon[];
  roomNumber: number;
  money: number;
  inventory: InventoryItem[];
  timestamp: number;
}

export interface GameStats {
  maxRoomReached: number;
  mostUsedPokemonId: string;
  maxLevelAchieved: number;
}

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

