import { Pokemon, Type, Move, Stats, DamageClass } from './types';
import { POKEMON_DATABASE } from './pokemonData';

const formatMove = (moveData: any): Move => {
  const statMapping: Record<string, keyof Stats> = {
    'hp': 'hp',
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'spAtk',
    'special-defense': 'spDef',
    'speed': 'speed'
  };

  const statChanges = moveData.stat_changes?.map((sc: any) => {
    let target: 'user' | 'opponent' = 'opponent';
    
    // Se è una mossa su se stessi
    if (moveData.target?.name === 'user') {
      target = 'user';
    }
    // Se il cambio è positivo (buff), è sempre su se stessi
    else if (sc.change > 0) {
      target = 'user';
    }
    // Altrimenti (debuff su avversario), è opponent
    else {
      target = 'opponent';
    }
    
    return {
      stat: statMapping[sc.stat.name] || 'attack',
      change: sc.change,
      target
    };
  });

  return {
    id: moveData.name,
    name: moveData.names.find((n: any) => n.language.name === 'it')?.name || moveData.name,
    type: (moveData.type.name.charAt(0).toUpperCase() + moveData.type.name.slice(1)) as Type,
    power: moveData.power || 0,
    accuracy: moveData.accuracy || 100,
    pp: moveData.pp || 20,
    damageClass: moveData.damage_class.name as DamageClass,
    ailment: moveData.meta?.ailment?.name !== 'none' ? moveData.meta?.ailment?.name : undefined,
    ailmentChance: moveData.meta?.ailment_chance || 0,
    statChanges: statChanges?.length > 0 ? statChanges : undefined,
    target: moveData.target?.name,
  };
};

const EXCLUDED_MOVE_IDS = new Set([
  // --- PROTEZIONE E SOSTITUTI ---
  'protect', 'detect', 'endure', 'quick-guard', 'wide-guard',
  'substitute', 'splash', 'celebrate', 'hold-hands',
  'kings-shield', 'spiky-shield', 'baneful-bunker', 'mat-block',
  'crafty-shield',

  // --- STATI ALTERATI (Confusione/Attrazione) ---
  'confuse-ray', 'swagger', 'flatter', 'supersonic', 'teeter-dance',
  'attract', 'captivate',

  // --- METEO ---
  'sunny-day', 'rain-dance', 'sandstorm', 'hail', 'snow',

  // --- TERRENI E CAMPI ---
  'grassy-terrain', 'misty-terrain', 'electric-terrain', 'psychic-terrain',
  'gravity', 'magic-room', 'wonder-room', 'mud-sport', 'water-sport',
  'trick-room',

  // --- TRAPPOLE E HAZARD ---
  'spikes', 'stealth-rock', 'toxic-spikes', 'sticky-web',

  // --- CAMBI FORZATI E FUGA ---
  'whirlwind', 'roar', 'circle-throw', 'dragon-tail',
  'mean-look', 'block', 'spider-web',
  'baton-pass', 'u-turn', 'volt-switch', 'parting-shot',

  // --- BARRIERE E SUPPORTO DI SQUADRA ---
  'reflect', 'light-screen', 'aurora-veil', 'safeguard', 'mist',
  'tailwind', 'lucky-chant', 'healing-wish', 'lunar-dance',
  'helping-hand', 'follow-me', 'rage-powder', 'spotlight',
  'ally-switch', 'after-you', 'quash', 'wide-guard', 'aromatherapy',

  // --- MOSSE DI COPIA E METRONOMO ---
  'transform', 'mirror-move', 'mimic', 'sketch', 'copycat', 'me-first',
  'assist', 'metronome', 'sleep-talk', 'snore', 'nature-power',
  'instruct', 'conversion', 'conversion2', 'camouflage',

  // --- POTENZA VARIABILE O NON CALCOLABILE ---
  'magnitude', 'present', 'natural-gift', 'hidden-power',
  'weather-ball', 'judgment', 'techno-blast', 'revelation-dance',
  'wring-out', 'crush-grip', 'trump-card', 'flail', 'reversal',
  'fury-cutter', 'rollout', 'ice-ball', 'echoed-voice',
  'triple-kick', 'punishment', 'stored-power',
  'acrobatics', 'facade', 'electrify',

  // --- DIPENDENTI DAL PESO ---
  'grass-knot', 'low-kick', 'heavy-slam', 'heat-crash',

  // --- DANNO FISSO O PERCENTUALE ---
  'sonic-boom', 'dragon-rage', 'night-shade', 'seismic-toss', 'super-fang',
  'psywave', 'fissure', 'guillotine', 'horn-drill', 'sheer-cold',

  // --- MOSSE "SUICIDE" E CONTROATTACCHI ---
  'self-destruct', 'explosion', 'memento', 'final-gambit', 'destiny-bond',
  'counter', 'mirror-coat', 'metal-burst', 'bide', 'focus-punch', 'shell-trap',
  'endeavor', 'pain-split',

  // --- ACCUMULATORI ---
  'stockpile', 'swallow', 'spit-up',

  // --- EFFETTI DI TURNO FUTURO ---
  'future-sight', 'doom-desire',

  // --- SCAMBIO / MODIFICA STATS ---
  'haze', 'topsy-turvy', 'power-trick', 'power-split', 'guard-split',
  'power-swap', 'guard-swap', 'heart-swap', 'speed-swap',
  'skill-swap', 'role-play', 'entrainment', 'simple-beam', 'worry-seed',
  'lock-on', 'mind-reader', 'focus-energy', 'psych-up',

  // --- CONTROLLO AVVERSARIO ---
  'taunt', 'encore', 'torment', 'disable', 'spite', 'grudge',
  'trick', 'switcheroo', 'fling', 'bestow', 'embargo', 'heal-block',
  'perish-song', 'yawn', 'imprison',

  // --- DIPENDENTI DA AMICIZIA O CONDIZIONI SPECIALI ---
  'frustration', 'return', 'beat-up',

  // --- STATUS PERSISTENTI SUL CAMPO ---
  'leech-seed', 'ingrain', 'aqua-ring', 'curse', 'nightmare',
  'telekinesis', 'magnet-rise', 'autotomize', 'charge',
  'recycle', 'belch',

  // --- MOSSE SPECIALI NON GESTIBILI ---
  'false-swipe', 'healing-wish', 'lunar-dance', 'wish',

  // --- EMERGENZA ---
  'struggle',
]);

export async function fetchPokemonData(id: number): Promise<Pokemon> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error('API response not ok');
    const data = await response.json();

    const baseStats = {
      hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
      attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
      defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
      spAtk: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
      spDef: data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
      speed: data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
    };

    const types = data.types.map((t: any) => {
      const typeName = t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1);
      return typeName as Type;
    });

    // Fetch 4 random moves from the pokemon's move list
    const moves: Move[] = await Promise.all(
      data.moves
        .filter((m: any) => !EXCLUDED_MOVE_IDS.has(m.move.name))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(async (m: any) => {
          const moveRes = await fetch(m.move.url);
          const moveData = await moveRes.json();
          return formatMove(moveData);
        })
    );

    const validMoves = moves.filter(Boolean);
    // Se nessuna mossa valida, prendi le prime 4 senza filtro EXCLUDED
    let finalMoves = validMoves;
    if (validMoves.length === 0) {
      finalMoves = await Promise.all(
        data.moves.slice(0, 4).map(async (m: any) => {
          const moveRes = await fetch(m.move.url);
          const moveData = await moveRes.json();
          return formatMove(moveData);
        })
      );
    }

    return {
      id: data.id.toString(),
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      types,
      baseStats,
      moves: finalMoves,
      ability: data.abilities[0].ability.name,
      spriteUrl: data.sprites.front_default,
      cryUrl: data.cries?.latest || data.cries?.legacy,
    };
  } catch (error) {
    console.warn(`Failed to fetch Pokemon ${id} from API, using local fallback:`, error);
    const localPokemon = POKEMON_DATABASE.find(p => p.id === id.toString());
    if (localPokemon) {
      return localPokemon;
    }
    // If not found in local database, pick a random one as fallback
    const randomPokemon = POKEMON_DATABASE[Math.floor(Math.random() * POKEMON_DATABASE.length)];
    console.warn(`Pokemon ${id} not in local database, using random fallback: ${randomPokemon.name}`);
    return randomPokemon;
  }
}

export async function fetchNewMove(pokemonId: string, currentMoveIds: string[]): Promise<Move | null> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const data = await response.json();

  const pokemonTypes = data.types.map((t: any) => t.type.name);

  const availableMoves = data.moves.filter(
    (m: any) => !currentMoveIds.includes(m.move.name) && !EXCLUDED_MOVE_IDS.has(m.move.name)
  );
  if (availableMoves.length === 0) return null;

  // Try to find a move that matches one of the pokemon's types
  let filteredMoves = [];

  // We need to check the type of each move, which requires another fetch.
  // To avoid hundreds of fetches, we'll pick a subset of available moves and check them.
  const subset = availableMoves.sort(() => 0.5 - Math.random()).slice(0, 10);
  const fetchedMoves = [];

  for (const m of subset) {
    const moveRes = await fetch(m.move.url);
    const moveData = await moveRes.json();
    fetchedMoves.push(moveData);
    if (pokemonTypes.includes(moveData.type.name)) {
      filteredMoves.push(moveData);
    }
  }

  // If we found type-consistent moves, pick one. Otherwise pick a random one from the subset.
  let finalMoveData;
  if (filteredMoves.length > 0) {
    finalMoveData = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
  } else {
    finalMoveData = fetchedMoves[0];
  }

  return formatMove(finalMoveData);
}

export async function generateDraft(): Promise<Pokemon[]> {
  const ids = Array.from({ length: 3 }, () => Math.floor(Math.random() * 649) + 1);
  return Promise.all(ids.map(id => fetchPokemonData(id)));
}
