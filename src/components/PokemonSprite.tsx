import React from 'react';

interface PokemonSpriteProps {
  id: string;
  name: string;
  isBack?: boolean;
  className?: string;
}

export default function PokemonSprite({ id, name, isBack = false, className = "" }: PokemonSpriteProps) {
  // Prefer Pokemondb for high quality or PokeAPI for versions
  const baseUrl = isBack 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/back/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${id}.png`;

  return (
    <img
      src={baseUrl}
      alt={name}
      className={`pixelated object-contain ${className}`}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback to official artwork if Gen 4 sprite fails
        (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      }}
    />
  );
}
