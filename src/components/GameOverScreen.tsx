import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, Swords, Shield, Star, RotateCcw, Home, TrendingUp, Zap, Heart } from 'lucide-react';
import { BattlePokemon, GameStats } from '../types';
import PokemonSprite from './PokemonSprite';
import { getTypeColor } from '../utils/typeColors';

interface GameOverScreenProps {
  won: boolean;
  roomNumber: number;
  party: BattlePokemon[];
  runStats: GameStats;
  onRestart: () => void;
}

// Genera un titolo/grado in base alle prestazioni
function getRunRank(roomNumber: number, won: boolean): { title: string; subtitle: string; color: string } {
  if (won) return { title: 'POKÉMON MASTER', subtitle: 'Hai conquistato tutte le 100 stanze!', color: 'text-amber-400' };
  if (roomNumber >= 90) return { title: 'CAMPIONE', subtitle: 'Quasi in cima alla vetta', color: 'text-purple-400' };
  if (roomNumber >= 70) return { title: 'ALLENATORE ESPERTO', subtitle: 'Una run straordinaria', color: 'text-blue-400' };
  if (roomNumber >= 50) return { title: 'SFIDANTE', subtitle: 'Oltre la metà del cammino', color: 'text-cyan-400' };
  if (roomNumber >= 30) return { title: 'ALLENATORE', subtitle: 'Buona partenza', color: 'text-green-400' };
  if (roomNumber >= 10) return { title: 'RECLUTA', subtitle: 'Il percorso è ancora lungo', color: 'text-yellow-400' };
  return { title: 'PRINCIPIANTE', subtitle: 'La prossima run sarà migliore', color: 'text-slate-400' };
}

// Trova il tipo di mossa più usato tra tutte le mosse del party
function getMostUsedType(party: BattlePokemon[]): string | null {
  if (!party.length) return null;
  const typeCounts: Record<string, number> = {};
  party.forEach(p => {
    p.moves.forEach(m => {
      if (m.power > 0) {
        typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
      }
    });
  });
  const entries = Object.entries(typeCounts);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

// Trova il Pokémon con livello più alto
function getHighestLevelPokemon(party: BattlePokemon[]): BattlePokemon | null {
  if (!party.length) return null;
  return party.reduce((best, p) => p.level > best.level ? p : best, party[0]);
}

export default function GameOverScreen({ won, roomNumber, party, runStats, onRestart }: GameOverScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const rank = getRunRank(roomNumber, won);
  const mostUsedType = getMostUsedType(party);
  const mvp = getHighestLevelPokemon(party);
  const bossesDefeated = won ? 10 : Math.floor(roomNumber / 10);

  useEffect(() => {
    // Mostra i dettagli con un leggero ritardo per l'effetto drammatico
    const timer = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (won) {
    return (
      <div className="relative h-[100dvh] w-full bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 text-white overflow-y-auto flex flex-col items-center justify-start pt-8 pb-12 px-4">
        {/* Sfondo animato con 40 particelle e stelle */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], y: '-10%' }}
              transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
              className="absolute text-amber-400/40"
              style={{ left: `${Math.random() * 100}%` }}
            >
              {i % 2 === 0 ? <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : <span className="text-lg">★</span>}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
          {/* Titolo Trionfale */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            className="flex flex-col items-center text-center"
          >
            <Trophy size={100} className="text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] mb-6" />
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
            >
              POKÉMON MASTER!
            </motion.h1>
            <p className="text-xl sm:text-2xl font-bold text-amber-200 mt-2">
              Hai conquistato tutte le 100 stanze!
            </p>
            
            {/* Hall of Fame Badge */}
            <motion.div 
              animate={{ borderColor: ['rgba(251,191,36,0.3)', 'rgba(251,191,36,0.8)', 'rgba(251,191,36,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-6 px-8 py-2 border-2 rounded-full bg-amber-500/10 backdrop-blur-sm"
            >
              <span className="text-lg font-black tracking-[0.2em] text-amber-400">HALL OF FAME</span>
            </motion.div>
          </motion.div>

          {/* Party Completo Hall of Fame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-white/5 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-md"
          >
            <div className="text-xs uppercase font-black text-amber-400/60 tracking-widest mb-6 text-center">I Leggendari Campioni</div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {party.map((p, i) => (
                <motion.div 
                  key={p.id + i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                    <PokemonSprite
                      id={p.id}
                      name={p.name}
                      className="w-20 h-20 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] relative z-10"
                    />
                  </div>
                  <div className="mt-2 font-black text-xs uppercase text-amber-200">{p.name}</div>
                  <div className="text-[10px] font-mono text-amber-400/60 font-bold">LV. {p.level}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Statistiche Finali */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
            {[
              { label: 'Stanze', value: '100 / 100', icon: Swords, color: 'text-indigo-400' },
              { label: 'Boss', value: '10 / 10', icon: Shield, color: 'text-amber-400' },
              { label: 'Max Level', value: Math.max(...party.map(p => p.level)), icon: Star, color: 'text-emerald-400' },
              { label: 'Team', value: party.length, icon: Heart, color: 'text-rose-400' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center"
              >
                <stat.icon size={20} className={`${stat.color} mb-2`} />
                <div className="text-[10px] uppercase font-black opacity-40 mb-1">{stat.label}</div>
                <div className="text-xl font-black text-white leading-none">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Bottoni Golden */}
          <div className="flex flex-col sm:flex-row gap-4 w-full px-4 mt-4">
            <button
              onClick={onRestart}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95"
            >
              <RotateCcw size={20} />
              NUOVA AVVENTURA
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 backdrop-blur-sm active:scale-95"
            >
              <Home size={20} />
              MENU PRINCIPALE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 text-white overflow-y-auto flex flex-col items-center justify-start pt-8 pb-12 px-4">
      {/* Sfondo animato */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {won ? (
          // Vittoria: particelle dorate
          Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], y: '-10%' }}
              transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
              className="absolute w-1 h-1 rounded-full bg-amber-400"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))
        ) : (
          // Sconfitta: vignette scura
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
        )}
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-6">

        {/* Icona vittoria/sconfitta */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center"
        >
          {won ? (
            <Trophy size={72} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
          ) : (
            <Skull size={72} className="text-slate-500 drop-shadow-[0_0_20px_rgba(100,116,139,0.4)]" />
          )}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-4xl sm:text-5xl font-black uppercase tracking-tighter mt-4 ${won ? 'text-amber-400' : 'text-red-400'}`}
          >
            {won ? 'Vittoria!' : 'Sconfitta'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-lg font-bold mt-1 ${rank.color}`}
          >
            {rank.title}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-slate-400 mt-0.5"
          >
            {rank.subtitle}
          </motion.p>
        </motion.div>

        {/* Statistiche principali */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full grid grid-cols-2 gap-3"
            >
              {/* Stanza raggiunta */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Swords size={14} className="text-indigo-400" />
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Stanza</span>
                </div>
                <div className="text-3xl font-black text-white">{roomNumber}</div>
                <div className="text-xs text-slate-500">su 100</div>
              </motion.div>

              {/* Boss sconfitti */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-amber-400" />
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Boss</span>
                </div>
                <div className="text-3xl font-black text-white">{bossesDefeated}</div>
                <div className="text-xs text-slate-500">sconfitti</div>
              </motion.div>

              {/* Pokémon nel team */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900 border border-green-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className="text-green-400" />
                  <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Team</span>
                </div>
                <div className="text-3xl font-black text-white">{party.length}</div>
                <div className="text-xs text-slate-500">Pokémon reclutati</div>
              </motion.div>

              {/* Tipo dominante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-purple-400" />
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Tipo Dominante</span>
                </div>
                {mostUsedType ? (
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${getTypeColor(mostUsedType)}`}>
                    {mostUsedType}
                  </span>
                ) : (
                  <div className="text-lg font-black text-slate-500">—</div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MVP — Pokémon con livello più alto */}
        <AnimatePresence>
          {showDetails && mvp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-400" />
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">MVP della Run</span>
              </div>
              <div className="flex items-center gap-4">
                <PokemonSprite
                  id={mvp.id}
                  name={mvp.name}
                  className="w-16 h-16 drop-shadow-lg"
                />
                <div className="flex-1">
                  <div className="font-black text-lg">{mvp.name}</div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {mvp.types.map(t => (
                      <span key={t} className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${getTypeColor(t)}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Livello <span className="text-white font-bold">{mvp.level}</span></div>
                </div>
                {/* Mini barra HP */}
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">HP rimasti</div>
                  <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.round((mvp.currentHp / mvp.maxHp) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{mvp.currentHp}/{mvp.maxHp}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team finale */}
        <AnimatePresence>
          {showDetails && party.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4"
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Team Finale</div>
              <div className="flex gap-2 flex-wrap justify-center">
                {party.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <PokemonSprite
                        id={p.id}
                        name={p.name}
                        className={`w-12 h-12 drop-shadow ${p.currentHp <= 0 ? 'grayscale opacity-40' : ''}`}
                      />
                      {p.currentHp <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Skull size={14} className="text-red-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400">Lv.{p.level}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confronto con record personale */}
        <AnimatePresence>
          {showDetails && runStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full"
            >
              {roomNumber > runStats.maxRoomReached && !won && (
                <div className="flex items-center justify-center gap-2 bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-4 py-2 mb-3">
                  <TrendingUp size={14} className="text-indigo-400" />
                  <span className="text-sm text-indigo-300 font-bold">Nuovo record personale! 🎉</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottoni azione */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full flex flex-col gap-3 mt-2"
            >
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <RotateCcw size={18} />
                Nuova Run
              </button>
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold uppercase tracking-wider py-3 rounded-2xl transition-all border border-white/10"
              >
                <Home size={16} />
                Menu Principale
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}