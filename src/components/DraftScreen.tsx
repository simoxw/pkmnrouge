import React, { useState, useEffect } from 'react';
import { Pokemon, Stats } from '../types';
import { generateDraft } from '../api';
import { motion } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import { getActualStats } from '../utils/battleMechanics';

interface DraftScreenProps {
  onSelect: (pokemon: Pokemon) => void;
  title?: string;
  subtitle?: string;
}

export default function DraftScreen({ onSelect, title = "Scegli il tuo Starter", subtitle = "Inizia la tua scalata nel Roguelike (Gen 1-4)" }: DraftScreenProps) {
  const [draftOptions, setDraftOptions] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  const renderStat = (label: string, value: number) => (
    <div className="flex justify-between">
      <span>{label}:</span> 
      <span className="text-white font-mono">{value}</span>
    </div>
  );

  useEffect(() => {
    const loadDraft = async () => {
      setLoading(true);
      try {
        const options = await generateDraft();
        setDraftOptions(options);
      } catch (error) {
        console.error("Failed to load draft:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDraft();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-400 animate-pulse">Generando Draft Pokémon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 flex items-center justify-center gap-3">
          <Sparkles className="text-amber-400" />
          {title}
          <Sparkles className="text-amber-400" />
        </h1>
        <p className="text-slate-400">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {draftOptions.map((pkmn, index) => {
          const stats = getActualStats(pkmn.baseStats);
          return (
            <motion.button
              key={pkmn.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(pkmn)}
              className="group relative bg-slate-900 border border-white/10 rounded-3xl p-8 hover:bg-slate-800 hover:border-white/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-95 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl font-black">#{pkmn.id}</span>
              </div>
              
              <PokemonSprite 
                id={pkmn.id} 
                name={pkmn.name} 
                className="w-48 h-48 mx-auto mb-6 drop-shadow-2xl group-hover:scale-110 transition-transform"
              />
              
              <h2 className="text-2xl font-bold mb-2">{pkmn.name}</h2>
              
              <div className="flex gap-2 mb-4 justify-center">
                {pkmn.types.map(t => (
                  <span key={t} className="text-[10px] uppercase font-bold bg-slate-800 px-3 py-1 rounded-full border border-white/5">
                    {t}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 text-left border-t border-white/5 pt-4">
                {renderStat('HP', stats.hp)}
                {renderStat('SPD', stats.speed)}
                {renderStat('ATK', stats.attack)}
                {renderStat('DEF', stats.defense)}
                {renderStat('S.ATK', stats.spAtk)}
                {renderStat('S.DEF', stats.spDef)}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
