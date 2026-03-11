import { Pokemon, Type, Move, Stats, DamageClass } from './types';

const formatMove = (moveData: any): Move => {
  const statMapping: Record<string, keyof Stats> = {
    'hp': 'hp',
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'spAtk',
    'special-defense': 'spDef',
    'speed': 'speed'
  };

  const statChanges = moveData.stat_changes?.map((sc: any) => ({
    stat: statMapping[sc.stat.name] || 'attack',
    change: sc.change
  }));

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
  'protect','detect','endure','quick-guard','wide-guard',
  'substitute','splash','celebrate','hold-hands',
  'confuse-ray','swagger','flatter','supersonic','teeter-dance',
  'attract','captivate',
  'sunny-day','rain-dance','sandstorm','hail','snow',
  'spikes','stealth-rock','toxic-spikes','sticky-web',
  'whirlwind','roar','circle-throw','dragon-tail',
  'mean-look','block','spider-web',
  'reflect','light-screen','aurora-veil','safeguard','mist',
  'baton-pass','encore','taunt','torment','trick-room',
  'perish-song','destiny-bond','spite','grudge',
  'trick','switcheroo','skill-swap','worry-seed',
  'stockpile','swallow','spit-up',
  'conversion','conversion2','camouflage',
  'lock-on','mind-reader','focus-energy',
  'haze','belch','after-you','quash',
  'bide','frustration',
  // avoid Mud Sport as well
  'mud-sport',
]);

export async function fetchPokemonData(id: number): Promise<Pokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
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

  return {
    id: data.id.toString(),
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    types,
    baseStats,
    moves,
    ability: data.abilities[0].ability.name,
    spriteUrl: data.sprites.front_default,
    cryUrl: data.cries?.latest || data.cries?.legacy,
  };
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
