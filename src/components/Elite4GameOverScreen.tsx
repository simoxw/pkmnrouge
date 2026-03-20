import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, RotateCcw, Home, Heart } from 'lucide-react';
import { BattlePokemon } from '../types';
import { ELITE4_REGIONS } from '../constants/elite4Data';
import PokemonSprite from './PokemonSprite';

interface Elite4GameOverScreenProps {
  won: boolean;
  regionIndex: number;
  trainerIndex: number;
  party: BattlePokemon[];
  onRestart: () => void;
  onExit: () => void;
}

const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos'];

export default function Elite4GameOverScreen({
  won,
  regionIndex,
  trainerIndex,
  party,
  onRestart,
  onExit
}: Elite4GameOverScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const challengesCompleted = regionIndex * 5 + trainerIndex;
  const trainer = ELITE4_REGIONS[regionIndex]?.trainers[trainerIndex];
  const region = REGIONS[regionIndex];
  
  const getMotivationalMessage = (): string => {
    if (challengesCompleted <= 5) return 'Il cammino verso la vetta è ancora lungo...';
    if (challengesCompleted <= 10) return 'Hai mostrato potenziale. Ritorna più forte.';
    if (challengesCompleted <= 15) return 'Sei a metà strada. Non arrenderti ora.';
    if (challengesCompleted <= 20) return 'Così vicino... La rivincita è tua.';
    if (challengesCompleted <= 24) return 'Hai sfidato i migliori. Sei già un campione.';
    return 'Il Campione ti ha fermato per un soffio!';
  };

  const getHighestHpSurvivor = (): BattlePokemon | null => {
    const alive = party.filter(p => p.currentHp > 0);
    if (!alive.length) return null;
    return alive.reduce((best, p) => p.currentHp > best.currentHp ? p : best);
  };

  const getAverageLevelElite4 = (): number => {
    if (!party.length) return 50;
    return Math.round(party.reduce((sum, p) => sum + p.level, 0) / party.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!won) {
    // SCHERMATA SCONFITTA
    return (
      <div className="relative h-[100dvh] w-full bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950 text-white overflow-y-auto flex flex-col items-center justify-start pt-8 pb-12 px-4">
        {/* Sfondo animato — particelle rosse */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 0.4, 0], y: '-10%' }}
              transition={{ duration: 4 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
              className="absolute w-1 h-1 rounded-full bg-rose-500/30"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
          {/* Header */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center"
          >
            <Skull size={80} className="text-rose-600 drop-shadow-[0_0_20px_rgba(225,29,72,0.4)] mb-4" />
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-rose-600">
              SCONFITTO
            </h1>
          </motion.div>

          {/* Allenatore che ti ha fermato */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 border border-rose-500/30 rounded-2xl px-6 py-4 backdrop-blur-sm text-center"
          >
            <div className="text-xs uppercase font-bold text-rose-400/60 tracking-widest mb-1">Fermato da</div>
            <div className="text-2xl font-black text-white">
              {trainer?.name} {trainerIndex === 4 && '👑'}
            </div>
            <div className="text-sm font-bold text-rose-300 mt-1">
              {trainerIndex === 4 ? 'Campione • ' : 'Elite Four • '}{region}
            </div>
          </motion.div>

          {/* Barra progressione Elite4 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-slate-900/60 border border-rose-500/20 rounded-2xl p-4"
          >
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const isCompleted = i < challengesCompleted;
                const isCurrent = i === challengesCompleted;
                return (
                  <motion.div
                    key={i}
                    animate={isCurrent ? { backgroundColor: ['rgba(225,29,72,0.5)', 'rgba(225,29,72,0.8)', 'rgba(225,29,72,0.5)'] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`h-3 flex-1 rounded ${
                      isCompleted ? 'bg-amber-500' : isCurrent ? 'bg-rose-600' : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-slate-300 text-center font-mono font-bold">
              {challengesCompleted} / 30 sfide completate
            </div>
          </motion.div>

          {/* Party stato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-slate-900/60 border border-slate-700/30 rounded-2xl p-4"
          >
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4 text-center">Stato Squadra</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {party.map((p, i) => (
                <div key={p.id + i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                  <div className="relative mb-2 flex justify-center">
                    <PokemonSprite
                      id={p.id}
                      name={p.name}
                      className={`w-12 h-12 ${p.currentHp <= 0 ? 'grayscale opacity-30' : ''}`}
                    />
                    {p.currentHp <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Skull size={16} className="text-rose-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-400 mb-1">Lv. {p.level}</div>
                  
                  {/* HP Bar */}
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full ${
                        p.currentHp > p.maxHp * 0.5
                          ? 'bg-emerald-500'
                          : p.currentHp > p.maxHp * 0.2
                          ? 'bg-yellow-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="text-[8px] text-slate-500 flex items-center gap-1">
                    <Heart size={8} /> {p.currentHp}/{p.maxHp}
                  </div>

                  {/* Status badge */}
                  {p.status && (
                    <div className="text-[7px] font-bold px-1 py-0.5 rounded mt-1 text-white text-center
                      {p.status === 'PAR' ? 'bg-amber-500/60' :
                       p.status === 'BRN' ? 'bg-rose-500/60' :
                       p.status === 'PSN' ? 'bg-purple-500/60' :
                       p.status === 'SLP' ? 'bg-slate-500/60' :
                       'bg-cyan-500/60'}">
                      {p.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Messaggio motivazionale */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full bg-rose-900/20 border border-rose-500/30 rounded-2xl px-6 py-4 text-center"
          >
            <p className="text-lg font-bold text-rose-300 italic">
              {getMotivationalMessage()}
            </p>
          </motion.div>

          {/* Bottoni */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 w-full mt-4"
              >
                <button
                  onClick={onRestart}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <RotateCcw size={18} />
                  RIPROVA ELITE 4
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Home size={18} />
                  TORNA AL MENU
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // SCHERMATA VITTORIA
  const survivor = getHighestHpSurvivor();
  const avgLevel = getAverageLevelElite4();

  return (
    <div className="relative h-[100dvh] w-full bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 text-white overflow-y-auto flex flex-col items-center justify-start pt-8 pb-12 px-4">
      {/* Particelle dorate 50 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], y: '-10%' }}
            transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
            className="absolute text-amber-400/40 text-lg"
            style={{ left: `${Math.random() * 100}%` }}
          >
            {i % 2 === 0 ? <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : '★'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
        {/* Header trionfale */}
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
            className="text-4xl sm:text-6xl font-black uppercase tracking-tighter bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
          >
            CAMPIONE ASSOLUTO!
          </motion.h1>
          <p className="text-xl font-bold text-amber-200 mt-4">
            Hai conquistato tutte le Elite Four!
          </p>
        </motion.div>

        {/* Hall of Fame Badge */}
        <motion.div
          animate={{ borderColor: ['rgba(251,191,36,0.3)', 'rgba(251,191,36,0.8)', 'rgba(251,191,36,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-8 py-3 border-2 rounded-2xl bg-amber-500/10 backdrop-blur-sm"
        >
          <div className="text-sm font-black tracking-[0.15em] text-amber-400 mb-3 text-center">
            HALL OF FAME ELITE 4
          </div>
          <div className="grid grid-cols-3 gap-3 text-[11px] font-bold text-amber-300">
            {REGIONS.map((r, i) => (
              <div key={r} className="flex items-center gap-1">
                <span>✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Statistiche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Sfide', value: '30 / 30', color: 'border-indigo-500/30 text-indigo-400' },
            { label: 'Campioni', value: '6 / 6', color: 'border-amber-500/30 text-amber-400' },
            { label: 'Livello Avg', value: avgLevel, color: 'border-emerald-500/30 text-emerald-400' },
            { label: 'Party', value: party.length, color: 'border-rose-500/30 text-rose-400' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className={`bg-slate-900/80 border ${stat.color} rounded-xl p-3 text-center`}
            >
              <div className="text-[9px] uppercase font-black opacity-40 mb-1">{stat.label}</div>
              <div className="text-xl font-black text-white">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Survivor */}
        {survivor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full bg-white/5 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md text-center"
          >
            <div className="text-xs uppercase font-black text-amber-300 tracking-widest mb-3">Sopravvissuto della Battaglia</div>
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-lg rounded-full" />
                <PokemonSprite
                  id={survivor.id}
                  name={survivor.name}
                  className="w-20 h-20 drop-shadow-lg relative z-10"
                />
              </div>
              <div className="text-left">
                <div className="font-black text-lg text-amber-200">{survivor.name}</div>
                <div className="text-sm font-mono text-amber-400 mb-2">Lv. {survivor.level}</div>
                <div className="text-xs text-slate-400 mb-1">HP rimanenti:</div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(survivor.currentHp / survivor.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Party finale con bordo dorato */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="w-full bg-white/5 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md"
        >
          <div className="text-[10px] uppercase font-black text-amber-300 tracking-widest mb-4 text-center">Squadra Vittoriosa</div>
          <div className="flex flex-wrap justify-center gap-4">
            {party.map((p, i) => (
              <motion.div
                key={p.id + i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-amber-400/30 blur-lg rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                  <div className="border-2 border-amber-500/50 rounded-lg p-1 bg-slate-900/80 relative z-10">
                    <PokemonSprite
                      id={p.id}
                      name={p.name}
                      className="w-16 h-16 drop-shadow-lg"
                    />
                  </div>
                </div>
                <div className="mt-2 font-black text-xs uppercase text-amber-200 text-center">{p.name}</div>
                <div className="text-[9px] font-mono text-amber-400/60 font-bold">LV. {p.level}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottoni finali */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex flex-col sm:flex-row gap-4 w-full mt-4"
            >
              <button
                onClick={onRestart}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <RotateCcw size={20} />
                NUOVA SFIDA ELITE 4
              </button>
              <button
                onClick={onExit}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Home size={20} />
                TORNA AL MENU
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
