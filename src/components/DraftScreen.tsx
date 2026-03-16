import React, { useState, useEffect } from 'react';
import { Pokemon, Stats } from '../types';
import { generateDraft } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Zap, Shield, Star } from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import { getActualStats } from '../utils/battleMechanics';
import { getTypeColor } from '../utils/typeColors';

interface DraftScreenProps {
  onSelect: (pokemon: Pokemon) => void;
  title?: string;
  subtitle?: string;
}

// Colore badge per damage class
const getDamageClassColor = (damageClass: string) => {
  if (damageClass === 'physical') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  if (damageClass === 'special') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const getDamageClassLabel = (damageClass: string) => {
  if (damageClass === 'physical') return 'FIS';
  if (damageClass === 'special') return 'SPE';
  return 'STA';
};

export default function DraftScreen({ onSelect, title = "Scegli il tuo Starter", subtitle = "Inizia la tua scalata nel Roguelike (Gen 1-5)" }: DraftScreenProps) {
  const [draftOptions, setDraftOptions] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMoves, setExpandedMoves] = useState<Record<string, boolean>>({});

  const toggleMoves = (pokemonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMoves(prev => ({ ...prev, [pokemonId]: !prev[pokemonId] }));
  };

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
    <div className="h-[100dvh] w-full bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <Sparkles className="text-amber-400 w-6 h-6 sm:w-8 sm:h-8" />
            {title}
            <Sparkles className="text-amber-400 w-6 h-6 sm:w-8 sm:h-8" />
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">{subtitle}</p>
        </motion.div>
      </div>

      {/* Scrollable grid container */}
      <div className="flex-1 overflow-y-auto scroll-container px-2 sm:px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full max-w-5xl mx-auto py-4">
          {draftOptions.map((pkmn, index) => {
            const stats = getActualStats(pkmn.baseStats);
            const movesExpanded = expandedMoves[pkmn.id] ?? false;

            return (
              <motion.div
                key={pkmn.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/20 transform scale-90 sm:scale-100 origin-top"
              >
                {/* Card principale cliccabile */}
                <button
                  onClick={() => onSelect(pkmn)}
                  className="w-full text-left p-4 sm:p-6 hover:bg-slate-800/50 transition-colors active:scale-95"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl font-black">#{pkmn.id}</span>
                  </div>

                  <PokemonSprite
                    id={pkmn.id}
                    name={pkmn.name}
                    className="w-32 sm:w-40 h-32 sm:h-40 mx-auto mb-3 sm:mb-4 drop-shadow-2xl group-hover:scale-110 transition-transform"
                  />

                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{pkmn.name}</h2>

                  <div className="flex gap-1 sm:gap-2 mb-3 justify-center flex-wrap">
                    {pkmn.types.map(t => (
                      <span key={t} className={`text-[8px] sm:text-[10px] uppercase font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${getTypeColor(t)}`}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-[10px] sm:text-xs text-slate-400 text-left border-t border-white/5 pt-2 sm:pt-3">
                    {renderStat('HP', stats.hp)}
                    {renderStat('SPD', stats.speed)}
                    {renderStat('ATK', stats.attack)}
                    {renderStat('DEF', stats.defense)}
                    {renderStat('S.ATK', stats.spAtk)}
                    {renderStat('S.DEF', stats.spDef)}
                  </div>
                </button>

                {/* Sezione mosse espandibile */}
                <div className="border-t border-white/10">
                  <button
                    onClick={(e) => toggleMoves(pkmn.id, e)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="uppercase font-bold tracking-wider flex items-center gap-1">
                      <Zap size={10} />
                      Mosse ({pkmn.moves.length})
                    </span>
                    {movesExpanded
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />
                    }
                  </button>

                  <AnimatePresence>
                    {movesExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1.5">
                          {pkmn.moves.map((move) => (
                            <div
                              key={move.id}
                              className="flex items-center justify-between bg-slate-800/60 rounded-xl px-2.5 py-2 border border-white/5"
                            >
                              {/* Nome + tipo */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${getTypeColor(move.type)}`}>
                                  {move.type}
                                </span>
                                <span className="text-[11px] font-semibold text-white truncate">{move.name}</span>
                              </div>

                              {/* Potere + categoria */}
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                {move.power > 0 ? (
                                  <span className="text-[10px] font-mono text-amber-300 font-bold">{move.power}</span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-500">—</span>
                                )}
                                <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${getDamageClassColor(move.damageClass)}`}>
                                  {getDamageClassLabel(move.damageClass)}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">{move.pp}PP</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CTA per selezionare dopo aver visto le mosse */}
                        <button
                          onClick={() => onSelect(pkmn)}
                          className="w-full py-2.5 text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors active:scale-95"
                        >
                          Scegli {pkmn.name} →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
