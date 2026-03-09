import { Pokemon, Type, Move } from './types';

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
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .map(async (m: any) => {
        const moveRes = await fetch(m.move.url);
        const moveData = await moveRes.json();
        return {
          id: moveData.name,
          name: moveData.names.find((n: any) => n.language.name === 'it')?.name || moveData.name,
          type: (moveData.type.name.charAt(0).toUpperCase() + moveData.type.name.slice(1)) as Type,
          power: moveData.power || 40,
          accuracy: moveData.accuracy || 100,
          pp: moveData.pp || 20,
        };
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
  };
}

export async function generateDraft(): Promise<Pokemon[]> {
  const ids = Array.from({ length: 3 }, () => Math.floor(Math.random() * 493) + 1);
  return Promise.all(ids.map(id => fetchPokemonData(id)));
}
