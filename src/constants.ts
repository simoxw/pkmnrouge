import { Type, Item, BattlePokemon } from './types';

export const ITEMS: Item[] = [
  {
    id: 'potion',
    name: 'Pozione',
    description: 'Cura 50 HP a un Pokémon.',
    price: 50,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.currentHp <= 0) return { updatedPokemon: pkmn, message: 'Non ha effetto su un Pokémon esausto!' };
      const healAmount = 50;
      const newHp = Math.min(pkmn.maxHp, pkmn.currentHp + healAmount);
      return {
        updatedPokemon: { ...pkmn, currentHp: newHp },
        message: `${pkmn.name} ha recuperato HP!`
      };
    }
  },
  {
    id: 'antidote',
    name: 'Antidoto',
    description: 'Cura lo stato di Avvelenamento.',
    price: 30,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.status === 'PSN') {
        return {
          updatedPokemon: { ...pkmn, status: null },
          message: `${pkmn.name} è guarito dal veleno!`
        };
      }
      return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
    }
  },
  {
    id: 'paralyze_heal',
    name: 'Antiparalisi',
    description: 'Cura lo stato di Paralisi.',
    price: 30,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.status === 'PAR') {
        return {
          updatedPokemon: { ...pkmn, status: null },
          message: `${pkmn.name} non è più paralizzato!`
        };
      }
      return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
    }
  },
  {
    id: 'awakening',
    name: 'Sveglia',
    description: 'Sveglia un Pokémon addormentato.',
    price: 40,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.status === 'SLP') {
        return {
          updatedPokemon: { ...pkmn, status: null, sleepTurns: 0 },
          message: `${pkmn.name} si è svegliato!`
        };
      }
      return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
    }
  },
  {
    id: 'burn_heal',
    name: 'Antiscottatura',
    description: 'Cura lo stato di Scottatura.',
    price: 40,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.status === 'BRN') {
        return {
          updatedPokemon: { ...pkmn, status: null },
          message: `${pkmn.name} è guarito dalla scottatura!`
        };
      }
      return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
    }
  },
  {
    id: 'ice_heal',
    name: 'Antigelo',
    description: 'Scongela un Pokémon.',
    price: 40,
    minRoom: 1,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.status === 'FRZ') {
        return {
          updatedPokemon: { ...pkmn, status: null },
          message: `${pkmn.name} si è scongelato!`
        };
      }
      return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
    }
  },
  {
    id: 'ether',
    name: 'Etere',
    description: 'Ripristina 10 PP alla mossa con meno PP rimasti.',
    price: 80,
    minRoom: 20,
    effect: (pkmn: BattlePokemon) => {
      // Trova la mossa con currentPp più basso (esclude mosse già al massimo)
      const moveIndex = pkmn.moves.reduce((lowestIdx, move, idx, arr) => {
        const currPp = move.currentPp ?? move.pp;
        const lowestPp = arr[lowestIdx].currentPp ?? arr[lowestIdx].pp;
        return currPp < lowestPp ? idx : lowestIdx;
      }, 0);
      
      const move = pkmn.moves[moveIndex];
      const currentPp = move.currentPp ?? move.pp;
      
      if (currentPp >= move.pp) {
        return { updatedPokemon: pkmn, message: 'Tutte le mosse hanno i PP pieni!' };
      }
      
      const newMoves = pkmn.moves.map((m, idx) =>
        idx === moveIndex
          ? { ...m, currentPp: Math.min(m.pp, currentPp + 10) }
          : m
      );
      
      return {
        updatedPokemon: { ...pkmn, moves: newMoves },
        message: `PP di ${move.name} ripristinati!`
      };
    }
  },
  {
    id: 'max_ether',
    name: 'Superetere',
    description: 'Ripristina tutti i PP alla mossa con meno PP rimasti.',
    price: 150,
    minRoom: 20,
    effect: (pkmn: BattlePokemon) => {
      const moveIndex = pkmn.moves.reduce((lowestIdx, move, idx, arr) => {
        const currPp = move.currentPp ?? move.pp;
        const lowestPp = arr[lowestIdx].currentPp ?? arr[lowestIdx].pp;
        return currPp < lowestPp ? idx : lowestIdx;
      }, 0);
      
      const move = pkmn.moves[moveIndex];
      const currentPp = move.currentPp ?? move.pp;
      
      if (currentPp >= move.pp) {
        return { updatedPokemon: pkmn, message: 'Tutte le mosse hanno i PP pieni!' };
      }
      
      const newMoves = pkmn.moves.map((m, idx) =>
        idx === moveIndex ? { ...m, currentPp: m.pp } : m
      );
      
      return {
        updatedPokemon: { ...pkmn, moves: newMoves },
        message: `PP di ${move.name} completamente ripristinati!`
      };
    }
  },
  {
    id: 'elixir',
    name: 'Elisir',
    description: 'Ripristina 10 PP a tutte le mosse.',
    price: 250,
    minRoom: 40,
    effect: (pkmn: BattlePokemon) => {
      const allFull = pkmn.moves.every(m => (m.currentPp ?? m.pp) >= m.pp);
      if (allFull) {
        return { updatedPokemon: pkmn, message: 'Tutte le mosse hanno i PP pieni!' };
      }
      
      const newMoves = pkmn.moves.map(m => ({
        ...m,
        currentPp: Math.min(m.pp, (m.currentPp ?? m.pp) + 10)
      }));
      
      return {
        updatedPokemon: { ...pkmn, moves: newMoves },
        message: `PP di tutte le mosse di ${pkmn.name} ripristinati di 10!`
      };
    }
  },
  {
    id: 'max_elixir',
    name: 'Superelisir',
    description: 'Ripristina tutti i PP di tutte le mosse.',
    price: 500,
    minRoom: 50,
    effect: (pkmn: BattlePokemon) => {
      const allFull = pkmn.moves.every(m => (m.currentPp ?? m.pp) >= m.pp);
      if (allFull) {
        return { updatedPokemon: pkmn, message: 'Tutte le mosse hanno i PP pieni!' };
      }
      
      const newMoves = pkmn.moves.map(m => ({ ...m, currentPp: m.pp }));
      
      return {
        updatedPokemon: { ...pkmn, moves: newMoves },
        message: `Tutti i PP di ${pkmn.name} ripristinati!`
      };
    }
  },
  {
    id: 'full_heal',
    name: 'Guarisci Tutto',
    description: 'Cura qualsiasi stato alterato.',
    price: 100,
    minRoom: 10,
    effect: (pkmn: BattlePokemon) => {
      if (!pkmn.status) return { updatedPokemon: pkmn, message: 'Non ha avuto effetto...' };
      return {
        updatedPokemon: { ...pkmn, status: null, sleepTurns: undefined },
        message: `${pkmn.name} è guarito!`
      };
    }
  },
  {
    id: 'super_potion',
    name: 'Superpozione',
    description: 'Cura 120 HP a un Pokémon.',
    price: 120,
    minRoom: 10,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.currentHp <= 0) return { updatedPokemon: pkmn, message: 'Non ha effetto su un Pokémon esausto!' };
      return {
        updatedPokemon: { ...pkmn, currentHp: Math.min(pkmn.maxHp, pkmn.currentHp + 120) },
        message: `${pkmn.name} ha recuperato HP!`
      };
    }
  },
  {
    id: 'hyper_potion',
    name: 'Iperpozione',
    description: 'Cura 200 HP a un Pokémon.',
    price: 250,
    minRoom: 40,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.currentHp <= 0) return { updatedPokemon: pkmn, message: 'Non ha effetto su un Pokémon esausto!' };
      return {
        updatedPokemon: { ...pkmn, currentHp: Math.min(pkmn.maxHp, pkmn.currentHp + 200) },
        message: `${pkmn.name} ha recuperato HP!`
      };
    }
  },
  {
    id: 'revive',
    name: 'Revitalizzante',
    description: 'Riporta in vita un Pokémon con il 50% degli HP.',
    price: 350,
    minRoom: 50,
    effect: (pkmn: BattlePokemon) => {
      if (pkmn.currentHp > 0) return { updatedPokemon: pkmn, message: `${pkmn.name} è già in piedi!` };
      return {
        updatedPokemon: { ...pkmn, currentHp: Math.floor(pkmn.maxHp / 2), status: null },
        message: `${pkmn.name} è tornato in battaglia!`
      };
    }
  },
  {
    id: 'full_restore',
    name: 'Ripristino Totale',
    description: 'Ripristina tutti gli HP e cura qualsiasi stato.',
    price: 1000,
    minRoom: 60,
    effect: (pkmn: BattlePokemon) => ({
      updatedPokemon: { ...pkmn, currentHp: pkmn.maxHp, status: null, sleepTurns: undefined },
      message: `${pkmn.name} è completamente ripristinato!`
    })
  }
];

// Gen 4 style TYPE_CHART (solo tipologie presenti in Type enum).
export const TYPE_CHART: Record<Type, Partial<Record<Type, number>>> = {
  [Type.NORMAL]: {
    [Type.ROCK]: 0.5,
    [Type.STEEL]: 0.5,
    [Type.GHOST]: 0
  },
  [Type.FIRE]: {
    [Type.FIRE]: 0.5,
    [Type.WATER]: 0.5,
    [Type.GRASS]: 2,
    [Type.ICE]: 2,
    [Type.BUG]: 2,
    [Type.ROCK]: 0.5,
    [Type.DRAGON]: 0.5,
    [Type.STEEL]: 2
  },
  [Type.WATER]: {
    [Type.FIRE]: 2,
    [Type.WATER]: 0.5,
    [Type.GRASS]: 0.5,
    [Type.GROUND]: 2,
    [Type.ROCK]: 2,
    [Type.DRAGON]: 0.5
  },
  [Type.GRASS]: {
    [Type.FIRE]: 0.5,
    [Type.WATER]: 2,
    [Type.GRASS]: 0.5,
    [Type.POISON]: 0.5,
    [Type.GROUND]: 2,
    [Type.FLYING]: 0.5,
    [Type.BUG]: 0.5,
    [Type.ROCK]: 2,
    [Type.DRAGON]: 0.5,
    [Type.STEEL]: 0.5
  },
  [Type.ELECTRIC]: {
    [Type.WATER]: 2,
    [Type.GRASS]: 0.5,
    [Type.ELECTRIC]: 0.5,
    [Type.GROUND]: 0,
    [Type.FLYING]: 2,
    [Type.DRAGON]: 0.5
  },
  [Type.ICE]: {
    [Type.FIRE]: 0.5,
    [Type.WATER]: 0.5,
    [Type.GRASS]: 2,
    [Type.ICE]: 0.5,
    [Type.GROUND]: 2,
    [Type.FLYING]: 2,
    [Type.DRAGON]: 2,
    [Type.STEEL]: 0.5
  },
  [Type.FIGHTING]: {
    [Type.NORMAL]: 2,
    [Type.ICE]: 2,
    [Type.ROCK]: 2,
    [Type.DARK]: 2,
    [Type.STEEL]: 2,
    [Type.POISON]: 0.5,
    [Type.FLYING]: 0.5,
    [Type.PSYCHIC]: 0.5,
    [Type.BUG]: 0.5,
    [Type.GHOST]: 0
  },
  [Type.POISON]: {
    [Type.GRASS]: 2,
    [Type.POISON]: 0.5,
    [Type.GROUND]: 0.5,
    [Type.ROCK]: 0.5,
    [Type.GHOST]: 0.5,
    [Type.STEEL]: 0,
    [Type.FAIRY]: 2
  },
  [Type.GROUND]: {
    [Type.FIRE]: 2,
    [Type.ELECTRIC]: 2,
    [Type.POISON]: 2,
    [Type.ROCK]: 2,
    [Type.STEEL]: 2,
    [Type.GRASS]: 0.5,
    [Type.BUG]: 0.5,
    [Type.FLYING]: 0
  },
  [Type.FLYING]: {
    [Type.GRASS]: 2,
    [Type.FIGHTING]: 2,
    [Type.BUG]: 2,
    [Type.ELECTRIC]: 0.5,
    [Type.ROCK]: 0.5,
    [Type.STEEL]: 0.5
  },
  [Type.PSYCHIC]: {
    [Type.FIGHTING]: 2,
    [Type.POISON]: 2,
    [Type.PSYCHIC]: 0.5,
    [Type.STEEL]: 0.5,
    [Type.DARK]: 0
  },
  [Type.BUG]: {
    [Type.GRASS]: 2,
    [Type.PSYCHIC]: 2,
    [Type.DARK]: 2,
    [Type.FIRE]: 0.5,
    [Type.FIGHTING]: 0.5,
    [Type.POISON]: 0.5,
    [Type.FLYING]: 0.5,
    [Type.GHOST]: 0.5,
    [Type.STEEL]: 0.5
  },
  [Type.ROCK]: {
    [Type.FIRE]: 2,
    [Type.ICE]: 2,
    [Type.FLYING]: 2,
    [Type.BUG]: 2,
    [Type.FIGHTING]: 0.5,
    [Type.GROUND]: 0.5,
    [Type.STEEL]: 0.5
  },
  [Type.GHOST]: {
    [Type.PSYCHIC]: 2,
    [Type.GHOST]: 2,
    [Type.NORMAL]: 0,
    [Type.DARK]: 0.5
  },
  [Type.DRAGON]: {
    [Type.DRAGON]: 2,
    [Type.STEEL]: 0.5,
    [Type.FAIRY]: 0
  },
  [Type.STEEL]: {
    [Type.ICE]: 2,
    [Type.ROCK]: 2,
    [Type.STEEL]: 0.5,
    [Type.FIRE]: 0.5,
    [Type.WATER]: 0.5,
    [Type.ELECTRIC]: 0.5,
    [Type.FAIRY]: 2
  },
  [Type.DARK]: {
    [Type.PSYCHIC]: 2,
    [Type.GHOST]: 2,
    [Type.DARK]: 0.5,
    [Type.FIGHTING]: 0.5,
    [Type.STEEL]: 0.5
  },
  [Type.FAIRY]: {
    [Type.FIGHTING]: 2,
    [Type.DRAGON]:   2,
    [Type.DARK]:     2,
    [Type.FIRE]:     0.5,
    [Type.POISON]:   0.5,
    [Type.STEEL]:    0.5,
  }
};

export const BOSS_ENCOUNTERS: Record<number, number[]> = {
  10: [143], // Snorlax
  20: [149, 248], // Dragonite, Tyranitar
  30: [243, 244, 245], // Raikou, Entei, Suicune
  40: [151, 251, 385, 490], // Mew, Celebi, Jirachi, Manaphy
  50: [488, 483, 484, 491, 487], // Cresselia, Dialga, Palkia, Darkrai, Giratina
  60: [249, 250, 384, 386, 382, 383], // Lugia, Ho-Oh, Rayquaza, Deoxys, Kyogre, Groudon
  70: [485, 486, 492, 380, 381, 150], // Heatran, Regigigas, Shaymin, Latias, Latios, Mewtwo
  80: [145, 144, 146, 378, 377, 379], // Zapdos, Articuno, Moltres, Regice, Regirock, Registeel
  90: [638, 639, 640, 641, 642, 645], // Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Landorus
  100: [643, 644, 646, 647, 493, 150], // Reshiram, Zekrom, Kyurem, Keldeo, Arceus, Mewtwo
};
