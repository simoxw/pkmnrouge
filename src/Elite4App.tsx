import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BattlePokemon, InventoryItem } from './types';
import { ELITE4_REGIONS } from './constants/elite4Data';
import { ITEMS } from './constants';
import { Elite4Trainer } from './types';
import { fetchPokemonData, fetchNewMove } from './api';
import { getActualStats, updateStats } from './utils/battleMechanics';
import { getTypeColor } from './utils/typeColors';
import DraftScreen from './components/DraftScreen';
import TeamHub from './components/TeamHub';
import Elite4ShopScreen from './components/Elite4ShopScreen';
import BattleEngine from './components/BattleEngine';
import TrainerIntroScreen from './components/TrainerIntroScreen';
import Elite4GameOverScreen from './components/Elite4GameOverScreen';

interface Elite4AppProps {
  onExit: () => void;
  soundEnabled: boolean;
}

type GamePhase = 'DRAFT' | 'HUB' | 'SHOP' | 'INTRO' | 'BATTLE' | 'OUTRO' | 'LEARN_MOVE' | 'GAME_OVER';

export default function Elite4App({ onExit, soundEnabled }: Elite4AppProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('DRAFT');
  const [draftRound, setDraftRound] = useState(1);
  const [party, setParty] = useState<BattlePokemon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<BattlePokemon[]>([]);
  const [money, setMoney] = useState(150);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [regionIndex, setRegionIndex] = useState(0);
  const [trainerIndex, setTrainerIndex] = useState(0);
  const [currentTrainer, setCurrentTrainer] = useState<Elite4Trainer | null>(null);
  const [loading, setLoading] = useState(false);
  const [won, setWon] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ pokemonIndex: number, newMove: any } | null>(null);
  const [isBossActive, setIsBossActive] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [bagFeedback, setBagFeedback] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Salvataggio locale
  const SAVE_KEY = 'pkmrouge_elite4_save';

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      setShowResumePrompt(true);
    }
  }, []);

  const saveGame = () => {
    const saveData = { regionIndex, trainerIndex, party, money, inventory };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  };

  const loadGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setRegionIndex(data.regionIndex);
      setTrainerIndex(data.trainerIndex);
      setParty(data.party);
      setMoney(data.money);
      setInventory(data.inventory);
      setGamePhase('HUB');
    }
  };

  const startNewGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setGamePhase('DRAFT');
  };

  useEffect(() => {
    if (gamePhase !== 'DRAFT' && gamePhase !== 'GAME_OVER' && gamePhase !== 'LEARN_MOVE' && !showResumePrompt) {
      saveGame();
    }
  }, [regionIndex, trainerIndex, party, money, inventory, gamePhase, showResumePrompt]);

  const handleDraftSelect = (pokemon: any) => {
    const level = 50;
    const actualStats = getActualStats(pokemon.baseStats, level);
    const battlePokemon: BattlePokemon = {
      ...pokemon,
      level,
      actualStats,
      currentHp: actualStats.hp,
      maxHp: actualStats.hp,
      status: null,
      statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
      moves: pokemon.moves.map((m: any) => ({ ...m, currentPp: m.pp }))
    };
    const newParty = [...party, battlePokemon];
    setParty(newParty);
    if (draftRound < 6) {
      setDraftRound(r => r + 1);
    } else {
      setGamePhase('HUB');
    }
  };

  const startElite4Battle = async () => {
    setLoading(true);
    const timeout = setTimeout(() => {
      console.error('startElite4Battle timeout');
      setLoading(false);
    }, 15000);

    try {
      const region = ELITE4_REGIONS[regionIndex];
      const trainer = region.trainers[trainerIndex];
      setCurrentTrainer(trainer);
      setIsBossActive(trainerIndex === 4);

      const enemyTeamData = await Promise.all(
        trainer.pokemonIds.map(async (id) => {
          try {
            const enemyData = await fetchPokemonData(id);
            const level = region.baseLevel;
            const actualStats = getActualStats(enemyData.baseStats, level);
            return {
              ...enemyData,
              level,
              actualStats,
              currentHp: actualStats.hp,
              maxHp: actualStats.hp,
              status: null,
              statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
              moves: enemyData.moves.map((m: any) => ({ ...m, currentPp: m.pp }))
            };
          } catch (e) {
            console.error(`Failed to fetch pokemon ${id}`, e);
            return null;
          }
        })
      );

      const validTeam = enemyTeamData.filter(Boolean);
      if (validTeam.length === 0) {
        console.error('No valid pokemon loaded');
        setLoading(false);
        clearTimeout(timeout);
        return;
      }

      setEnemyTeam(validTeam as any);
      setGamePhase('INTRO');
    } catch (e) {
      console.error('startElite4Battle failed', e);
    } finally {
      setLoading(false);
      clearTimeout(timeout);
    }
  };

  const handleBattleEnd = useCallback((winner: 'player' | 'enemy') => {
    setTimeout(() => {
      if (winner === 'enemy') {
        setWon(false);
        setGamePhase('GAME_OVER');
      } else {
        applyRest();
        const baseReward = 300 + regionIndex * 80;
        const reward = trainerIndex === 4 ? baseReward * 2 : baseReward;
        setMoney(m => m + reward);
        setGamePhase('OUTRO');
      }
    }, 0);
  }, [trainerIndex, regionIndex]);

  const applyRest = () => {
    setParty(prevParty =>
      prevParty.map(pokemon => {
        const restoredHp = Math.floor(pokemon.maxHp * 0.3);
        const newHp = Math.min(pokemon.currentHp + restoredHp, pokemon.maxHp);
        return {
          ...pokemon,
          currentHp: newHp,
          moves: pokemon.moves.map(move => ({
            ...move,
            currentPp: Math.min((move.currentPp ?? move.pp) + 5, move.pp)
          })),
          statStages: {
            hp: 0,
            attack: 0,
            defense: 0,
            spAtk: 0,
            spDef: 0,
            speed: 0
          }
        };
      })
    );
  };

  const handleOutroContinue = () => {
    if (trainerIndex < 4) {
      setTrainerIndex(i => i + 1);
      setGamePhase('HUB');
    } else if (regionIndex < 5) {
      setRegionIndex(r => r + 1);
      setTrainerIndex(0);
      // Level up party by 8 levels
      setParty(prev => prev.map(p => {
        const leveled = updateStats(p, p.level + 8);
        return {
          ...leveled,
          currentHp: Math.min(leveled.currentHp + Math.floor(leveled.maxHp * 0.3), leveled.maxHp),
          moves: leveled.moves.map(m => ({ ...m, currentPp: Math.min((m.currentPp ?? m.pp) + 5, m.pp) })),
          statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
        };
      }));
      setGamePhase('HUB');
    } else {
      setWon(true);
      setGamePhase('GAME_OVER');
    }
  };

  const handleSwitch = (index: number) => {
    const newParty = [...party];
    [newParty[0], newParty[index]] = [newParty[index], newParty[0]];
    setParty(newParty);
  };

  const handleUpdatePartyMember = (index: number, updated: BattlePokemon) => {
    const newParty = [...party];
    newParty[index] = updated;
    setParty(newParty);
  };

  const handleUseItem = (itemId: string, pokemonIndex: number): string => {
    if (itemId === 'mt-random') {
      const targetPkmn = party[pokemonIndex];
      setLoading(true);
      fetchNewMove(targetPkmn.id, targetPkmn.moves.map(m => m.id)).then(newMove => {
        if (newMove) {
          setPendingMove({ pokemonIndex, newMove });
          setGamePhase('LEARN_MOVE');
          setInventory(prev =>
            prev.map(i => i.itemId === 'mt-random' ? { ...i, count: i.count - 1 } : i)
              .filter(i => i.count > 0)
          );
        }
        setLoading(false);
      }).catch(() => setLoading(false));
      return 'Uso MT Casuale...';
    }
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return 'Strumento non trovato.';
    const targetPkmn = party[pokemonIndex];
    const { updatedPokemon, message } = item.effect(targetPkmn);
    if (updatedPokemon === targetPkmn) return message;
    setParty(prev => {
      const next = [...prev];
      next[pokemonIndex] = updatedPokemon;
      return next;
    });
    setInventory(prev =>
      prev.map(i => i.itemId === itemId ? { ...i, count: i.count - 1 } : i)
        .filter(i => i.count > 0)
    );
    return message;
  };

  const handleBuyItem = (item: any) => {
    setMoney(m => m - item.price);
    setInventory(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, count: i.count + 1 } : i);
      } else {
        return [...prev, { itemId: item.id, count: 1 }];
      }
    });
  };

  const handleLearnMove = (replaceIndex: number) => {
    if (!pendingMove) return;
    const { pokemonIndex, newMove } = pendingMove;
    setParty(prev => {
      const next = [...prev];
      const pkmn = { ...next[pokemonIndex] };
      const moves = [...pkmn.moves];
      if (replaceIndex === -1) {
        if (moves.length < 4) moves.push({ ...newMove, currentPp: newMove.pp });
      } else {
        moves[replaceIndex] = { ...newMove, currentPp: newMove.pp };
      }
      pkmn.moves = moves;
      next[pokemonIndex] = pkmn;
      return next;
    });
    setPendingMove(null);
    setGamePhase('HUB');
  };

  const handleSwapPartyOrder = (i1: number, i2: number) => {
    const newParty = [...party];
    [newParty[i1], newParty[i2]] = [newParty[i2], newParty[i1]];
    setParty(newParty);
  };

  const isItemUsable = (itemId: string, member: BattlePokemon): boolean => {
    const allPpFull = member.moves.every(m => (m.currentPp ?? m.pp) >= m.pp);
    switch (itemId) {
      case 'potion':
      case 'super_potion':
      case 'hyper_potion':
        return member.currentHp > 0 && member.currentHp < member.maxHp;
      case 'antidote':      return member.status === 'PSN';
      case 'paralyze_heal': return member.status === 'PAR';
      case 'awakening':     return member.status === 'SLP';
      case 'burn_heal':     return member.status === 'BRN';
      case 'ice_heal':      return member.status === 'FRZ';
      case 'full_heal':     return member.status !== null;
      case 'ether':
      case 'max_ether':
      case 'elixir':
      case 'max_elixir':    return !allPpFull;
      case 'revive':        return member.currentHp <= 0;
      case 'full_restore':  return member.currentHp < member.maxHp || member.status !== null;
      default:              return true;
    }
  };

  if (showResumePrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-white text-xl font-bold mb-4">Riprendere Elite 4?</h2>
          <p className="text-gray-300 mb-6">Hai una partita Elite 4 salvata. Vuoi riprenderla o iniziare una nuova?</p>
          <div className="flex gap-4">
            <button
              onClick={() => { loadGame(); setShowResumePrompt(false); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Riprendi
            </button>
            <button
              onClick={() => { startNewGame(); setShowResumePrompt(false); }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Nuova Partita
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-slate-800 p-8 rounded-lg flex items-center gap-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-white">Caricamento...</span>
          </motion.div>
        </div>
      )}

      {/* DRAFT */}
      {gamePhase === 'DRAFT' && (
        <DraftScreen
          key={draftRound}
          onSelect={handleDraftSelect}
          title={`Scegli il Pokémon ${draftRound}/6`}
          subtitle={`Costruisci il tuo team — ${6 - draftRound + 1} scelte rimanenti`}
        />
      )}

      {/* HUB */}
      {gamePhase === 'HUB' && (
        <div className="h-[100dvh] w-full flex flex-col bg-slate-950 text-white overflow-hidden">
          {/* Header fisso */}
          <div className="flex-shrink-0 bg-amber-900/30 border-b border-amber-500/30 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-amber-400">
                ⚔️ ELITE 4
              </h1>
              <div className="flex items-center gap-3">
                <div className="text-amber-300 font-mono font-bold text-sm">💰 {money}$</div>
                <button
                  onClick={() => setShowBag(true)}
                  className="relative bg-slate-700/80 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl transition-all text-sm"
                >
                  🎒
                  {inventory.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {inventory.reduce((sum, i) => sum + i.count, 0)}
                    </span>
                  )}
                </button>
                <div className="text-right">
                  <div className="text-sm text-amber-300 font-bold">{ELITE4_REGIONS[regionIndex].region}</div>
                  <div className="text-xs text-amber-200">
                    vs {ELITE4_REGIONS[regionIndex].trainers[trainerIndex].name}
                    {trainerIndex === 4 && ' — CAMPIONE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra progressione fissa */}
          <div className="flex-shrink-0 p-4">
            <div className="text-sm text-amber-300 mb-2">Progressione Elite 4</div>
            <div className="flex gap-1">
              {Array.from({ length: 30 }, (_, i) => {
                const currentStep = regionIndex * 5 + trainerIndex + 1;
                const isCompleted = i < currentStep;
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      isCompleted ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-amber-200 mt-1">
              {regionIndex * 5 + trainerIndex + 1} / 30 completati
            </div>
          </div>

          {/* Lista Pokémon scrollabile */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
            <h2 className="text-lg font-black uppercase flex items-center gap-2 text-amber-400">
              La tua Squadra
            </h2>
            {party.map((pkmn, i) => (
              <div
                key={pkmn.id + i}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all bg-amber-900/20 border-amber-500/30"
              >
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.id}.png`}
                    alt={pkmn.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="font-bold truncate">{pkmn.name}</div>
                        {pkmn.status && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold text-white whitespace-nowrap
                            ${pkmn.status === 'PAR' ? 'bg-amber-400' :
                              pkmn.status === 'BRN' ? 'bg-rose-500' :
                              pkmn.status === 'PSN' ? 'bg-purple-500' :
                              pkmn.status === 'SLP' ? 'bg-slate-400' :
                              'bg-cyan-400'}`}>
                            {pkmn.status}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {pkmn.types.map(type => (
                          <span key={`team-type-${pkmn.id}-${type}`} className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full border ${getTypeColor(type)}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-amber-200">Lv. {pkmn.level}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        pkmn.currentHp > pkmn.maxHp * 0.5
                          ? 'bg-emerald-500'
                          : pkmn.currentHp > pkmn.maxHp * 0.2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(pkmn.currentHp / pkmn.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-amber-200 flex flex-wrap gap-x-2 gap-y-1 mt-1">
                    <span className="font-bold">{pkmn.currentHp} / {pkmn.maxHp} HP</span>
                    {pkmn.moves.map((m, idx) => (
                      <span key={m.id + idx} className="opacity-70">
                        {m.name}: {m.currentPp ?? m.pp}/{m.pp}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => i > 0 && handleSwapPartyOrder(i, i - 1)}
                    disabled={i === 0}
                    className="p-1 rounded bg-amber-800/50 hover:bg-amber-700/50 disabled:opacity-20 transition-colors"
                  >▲</button>
                  <button
                    onClick={() => i < party.length - 1 && handleSwapPartyOrder(i, i + 1)}
                    disabled={i === party.length - 1}
                    className="p-1 rounded bg-amber-800/50 hover:bg-amber-700/50 disabled:opacity-20 transition-colors"
                  >▼</button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer pulsanti fisso in basso */}
          <div className="flex-shrink-0 p-3 border-t border-amber-500/20 flex flex-col gap-2">
            <button
              onClick={startElite4Battle}
              className="w-full bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black uppercase tracking-wider py-4 rounded-2xl transition-all"
            >
              ⚔️ Affronta {ELITE4_REGIONS[regionIndex].trainers[trainerIndex].name}
              {trainerIndex === 4 ? ' — CAMPIONE' : ''}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setGamePhase('SHOP')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                🏪 Negozio
              </button>
              <button
                onClick={onExit}
                className="flex-1 bg-red-900/60 hover:bg-red-800 text-red-300 font-bold py-3 rounded-xl transition-all border border-red-700/40"
              >
                ← Abbandona
              </button>
            </div>
          </div>
          {showBag && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-lg bg-slate-900 border-t border-amber-500/30 rounded-t-3xl p-4 max-h-[80dvh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-amber-400 uppercase tracking-wider">🎒 Zaino</h3>
                  <button
                    onClick={() => { setShowBag(false); setSelectedItem(null); setBagFeedback(null); }}
                    className="text-slate-400 hover:text-white text-xl"
                  >✕</button>
                </div>
                {bagFeedback && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold px-3 py-2 rounded-xl mb-3">
                    {bagFeedback}
                  </div>
                )}
                {inventory.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Zaino vuoto</p>
                ) : (
                  <div className="overflow-y-auto flex-1 space-y-2">
                    {inventory.map(inv => {
                      const item = ITEMS.find(i => i.id === inv.itemId);
                      if (!item) return null;
                      return (
                        <div key={inv.itemId} className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-bold text-white">{item.name}</span>
                              <span className="text-amber-400 text-xs ml-2">×{inv.count}</span>
                            </div>
                            <span className="text-xs text-slate-400">{item.description}</span>
                          </div>
                          {selectedItem === inv.itemId ? (
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-amber-300 mb-1">Su quale Pokémon?</p>
                              {party.map((pkmn, idx) => {
                                const usable = isItemUsable(inv.itemId, pkmn);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      if (!usable) return;
                                      const msg = handleUseItem(inv.itemId, idx);
                                      setBagFeedback(msg);
                                      setSelectedItem(null);
                                      setTimeout(() => setBagFeedback(null), 2500);
                                    }}
                                    disabled={!usable}
                                    className={`text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                                      usable 
                                        ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                                        : 'bg-slate-900 text-slate-500 opacity-40 cursor-not-allowed'
                                    }`}
                                  >
                                    <span>{pkmn.name}</span>
                                    <span className="text-slate-400">{pkmn.currentHp}/{pkmn.maxHp} HP</span>
                                  </button>
                                );
                              })}
                              <button onClick={() => setSelectedItem(null)} className="text-xs text-slate-500 hover:text-white mt-1">Annulla</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {!party.some(p => isItemUsable(inv.itemId, p)) && (
                                <p className="text-[10px] text-rose-400 text-center font-bold">Nessun target disponibile</p>
                              )}
                              <button
                                onClick={() => setSelectedItem(inv.itemId)}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                              >
                                Usa
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* SHOP */}
      {gamePhase === 'SHOP' && (
        <Elite4ShopScreen
          money={money}
          onBuy={handleBuyItem}
          onExit={() => setGamePhase('HUB')}
        />
      )}

      {/* INTRO */}
      {gamePhase === 'INTRO' && currentTrainer && (
        <TrainerIntroScreen
          trainer={currentTrainer}
          phase="intro"
          onContinue={() => setGamePhase('BATTLE')}
        />
      )}

      {/* BATTLE */}
      {gamePhase === 'BATTLE' && party.length > 0 && enemyTeam.length > 0 && (
        <div className="absolute inset-0">
          <BattleEngine
            playerPokemon={party[0]}
            enemyTeam={enemyTeam}
            party={party}
            inventory={inventory}
            isBoss={isBossActive}
            soundEnabled={soundEnabled}
            onBattleEnd={handleBattleEnd}
            onSwitch={handleSwitch}
            onUpdatePartyMember={handleUpdatePartyMember}
            onUseItem={handleUseItem}
          />
        </div>
      )}

      {/* OUTRO */}
      {gamePhase === 'OUTRO' && currentTrainer && (
        <TrainerIntroScreen
          trainer={currentTrainer}
          phase="outro"
          onContinue={handleOutroContinue}
        />
      )}

      {/* LEARN_MOVE */}
      {gamePhase === 'LEARN_MOVE' && pendingMove && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-white text-xl font-bold mb-4">Imparare {pendingMove.newMove.name}?</h2>
            <p className="text-gray-300 mb-6">
              {party[pendingMove.pokemonIndex].name} vuole imparare {pendingMove.newMove.name}.
              Scegli una mossa da sostituire o annulla.
            </p>
            <div className="space-y-2 mb-4">
              {party[pendingMove.pokemonIndex].moves.map((move, index) => (
                <button
                  key={index}
                  onClick={() => handleLearnMove(index)}
                  className="w-full text-left bg-slate-700 hover:bg-slate-600 text-white p-2 rounded"
                >
                  {move.name} → {pendingMove.newMove.name}
                </button>
              ))}
              {party[pendingMove.pokemonIndex].moves.length < 4 && (
                <button
                  onClick={() => handleLearnMove(-1)}
                  className="w-full text-left bg-green-700 hover:bg-green-600 text-white p-2 rounded"
                >
                  Aggiungi {pendingMove.newMove.name}
                </button>
              )}
            </div>
            <button
              onClick={() => { setPendingMove(null); setGamePhase('HUB'); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* GAME_OVER */}
      {gamePhase === 'GAME_OVER' && (
        <Elite4GameOverScreen
          won={won}
          regionIndex={regionIndex}
          trainerIndex={trainerIndex}
          party={party}
          onRestart={() => {
            localStorage.removeItem('pkmrouge_elite4_save');
            setRegionIndex(0);
            setTrainerIndex(0);
            setParty([]);
            setMoney(150);
            setInventory([]);
            setDraftRound(1);
            setGamePhase('DRAFT');
          }}
          onExit={onExit}
        />
      )}
    </div>
  );
}