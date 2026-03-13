import React, { useState, useEffect } from 'react';
import { BattlePokemon, Move, BattleLog, InventoryItem } from '../types';

import { getStatWithStage, getTypeEffectiveness } from '../utils/battleMechanics';
import { MoveEffectHandler } from '../utils/moveEffectHandler';
import { ITEMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import PokemonSprite from './PokemonSprite';
import StatStagesBadges from './StatStagesBadges';
import BattleBackground from './BattleBackground';
import { Briefcase } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface BattleEngineProps {
  playerPokemon: BattlePokemon;
  enemyTeam: BattlePokemon[];
  party: BattlePokemon[];
  inventory: InventoryItem[];
  isBoss: boolean;
  soundEnabled: boolean;
  onBattleEnd: (winner: 'player' | 'enemy') => void;
  onSwitch: (index: number) => void;
  onUpdatePartyMember: (index: number, updated: BattlePokemon) => void;
  onUseItem: (itemId: string, pokemonIndex: number) => string;
}

export default function BattleEngine({ playerPokemon: initialPlayer, enemyTeam, party, inventory, isBoss, soundEnabled, onBattleEnd, onSwitch, onUpdatePartyMember, onUseItem }: BattleEngineProps) {
  const [player, setPlayer] = useState<BattlePokemon>({
    ...initialPlayer,
    status: initialPlayer.status || null,
    statStages: initialPlayer.statStages || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
  });
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [enemy, setEnemy] = useState<BattlePokemon>({
    ...enemyTeam[0],
    status: enemyTeam[0].status || null,
    statStages: enemyTeam[0].statStages || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
  });
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(() => {
    const playerSpeed = getStatWithStage(initialPlayer.actualStats.speed, initialPlayer.statStages?.speed ?? 0);
    const enemySpeed = getStatWithStage(enemyTeam[0].actualStats.speed, enemyTeam[0].statStages?.speed ?? 0);
    return playerSpeed >= enemySpeed;
  });
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showBagMenu, setShowBagMenu] = useState(false);
  const [selectedItemForPokemon, setSelectedItemForPokemon] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<{ type: string, side: 'player' | 'enemy', text?: string } | null>(null);
  const [hoveredMove, setHoveredMove] = useState<Move | null>(null);
  const [lastEnemyMove, setLastEnemyMove] = useState<Move | null>(null);
  const [playerEffectivenessMessage, setPlayerEffectivenessMessage] = useState<string | null>(null);
  const [enemyEffectivenessMessage, setEnemyEffectivenessMessage] = useState<string | null>(null);

  // sound effects
  const { playSound } = useSoundEffects(soundEnabled);

  const triggerEffect = (type: string, side: 'player' | 'enemy', text?: string) => {
    setActiveEffect({ type, side, text });
    setTimeout(() => setActiveEffect(null), 1000);
  };

  const playCry = (url?: string) => {
    if (!url || !soundEnabled) return;
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed", e));
  };

  useEffect(() => {
    // Play cries at start
    playCry(player.cryUrl);
    setTimeout(() => playCry(enemy.cryUrl), 1000);
  }, []);

  // Keep local player in sync with App party[0] after switches/updates.
  useEffect(() => {
    setPlayer({
      ...initialPlayer,
      status: initialPlayer.status || null,
      statStages: initialPlayer.statStages || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
    });
  }, [initialPlayer.id]);

  const commitPlayer = (updater: (prev: BattlePokemon) => BattlePokemon) => {
    setPlayer(prev => {
      const next = updater(prev);
      onUpdatePartyMember(0, next);
      return next;
    });
  };

  const addLog = (message: string, type: BattleLog['type'] = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), message, type }, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!isPlayerTurn && !isBattleOver) {
      const timer = setTimeout(enemyTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, isBattleOver]);

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
      case 'full_restore':  return true;
      default:              return true;
    }
  };

  const handleMove = (move: Move) => {
    if (!isPlayerTurn || isBattleOver) return;

    // Clear previous effectiveness messages
    setPlayerEffectivenessMessage(null);
    setEnemyEffectivenessMessage(null);

    // Process the turn including status checks and move effects
    const turnResult = MoveEffectHandler.processTurn(player, enemy, move);

    // Add status messages
    turnResult.statusResult.messages.forEach(message => addLog(message, 'status'));

    // Handle status clearing
    if (turnResult.statusResult.statusCleared) {
      commitPlayer(prev => ({
        ...prev,
        status: null,
        sleepTurns: undefined,
        actualStats: MoveEffectHandler.applyStatusEffects({ ...prev, status: null })
      }));
    }

    // If can't act, end turn
    if (!turnResult.statusResult.canAct) {
      // Handle sleep turns decrement
      if (player.status === 'SLP' && player.sleepTurns && player.sleepTurns > 0) {
        commitPlayer(prev => ({ ...prev, sleepTurns: (prev.sleepTurns || 1) - 1 }));
      }
      setIsPlayerTurn(false);
      return;
    }

    const effectResult = turnResult.effectResult!;

    // Decrement PP
    const moveIndex = player.moves.findIndex(m => m.id === move.id);
    if (moveIndex !== -1) {
      const newMoves = [...player.moves];
      const currentMovePp = newMoves[moveIndex].currentPp ?? newMoves[moveIndex].pp;
      newMoves[moveIndex] = { ...newMoves[moveIndex], currentPp: Math.max(0, currentMovePp - 1) };
      commitPlayer(prev => ({ ...prev, moves: newMoves }));
    }

    // Handle miss
    if (effectResult.isMiss) {
      triggerEffect('miss', 'enemy', 'FALLITO!');
      setIsPlayerTurn(false);
      return;
    }

    // Apply damage
    let newEnemyHp = enemy.currentHp;
    if (effectResult.damage && effectResult.damage > 0) {
      newEnemyHp = Math.max(0, enemy.currentHp - effectResult.damage);
      playSound('hit');
      triggerEffect(move.type.toLowerCase(), 'enemy');

      if (effectResult.isCritical) {
        setTimeout(() => triggerEffect('crit', 'enemy', 'CRITICO!'), 300);
      }

      addLog(`Danno inflitto: ${effectResult.damage}`, 'damage');
    }

    // Effectiveness per attacchi del giocatore: badge sotto gli HP avversario + log.
    if (effectResult.effectiveness && effectResult.effectiveness > 1) {
      const msg = 'È superefficace!';
      playSound('hitSuper');
      setPlayerEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setPlayerEffectivenessMessage(null), 2000);
    }
    if (effectResult.effectiveness && effectResult.effectiveness < 1 && effectResult.effectiveness > 0) {
      const msg = 'Non è molto efficace...';
      playSound('hitWeak');
      setPlayerEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setPlayerEffectivenessMessage(null), 2000);
    }
    if (effectResult.effectiveness === 0) {
      const msg = 'Non ha effetto...';
      setPlayerEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setPlayerEffectivenessMessage(null), 2000);
    }

    // Apply healing
    let newPlayerHp = player.currentHp;
    if (effectResult.healing && effectResult.healing > 0) {
      newPlayerHp = Math.min(player.maxHp, player.currentHp + effectResult.healing);
      addLog(`${player.name} ha recuperato ${effectResult.healing} HP!`, 'status');
    }

    // Apply stat changes - NON mutare actualStats, usa soli statStages
    let newEnemyStages = { ...enemy.statStages };
    let newPlayerStages = { ...player.statStages };

    if (effectResult.statChanges) {
      effectResult.statChanges.forEach(sc => {
        if (sc.target === 'user') {
          newPlayerStages[sc.stat] = Math.max(-6, Math.min(6, (newPlayerStages[sc.stat] || 0) + sc.change));
        } else {
          newEnemyStages[sc.stat] = Math.max(-6, Math.min(6, (newEnemyStages[sc.stat] || 0) + sc.change));
        }
      });
    }

    // Apply status
    let newEnemyStatus = enemy.status;
    let newPlayerStatus = player.status;
    let newPlayerSleepTurns = player.sleepTurns;

    if (effectResult.statusApplied) {
      const { status, target } = effectResult.statusApplied;
      if (target === 'user') {
        if (!player.status) {
          newPlayerStatus = status;
          if (status === 'SLP') {
            newPlayerSleepTurns = Math.floor(Math.random() * 3) + 1;
          }
          triggerEffect('status', 'player', status);
        }
      } else {
        if (!enemy.status) {
          newEnemyStatus = status;
          triggerEffect('status', 'enemy', status);
        }
      }
    }

    setEnemy(prev => ({
      ...prev,
      currentHp: newEnemyHp,
      status: newEnemyStatus,
      statStages: newEnemyStages,
      sleepTurns: newEnemyStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    commitPlayer(prev => ({
      ...prev,
      currentHp: newPlayerHp,
      status: newPlayerStatus,
      statStages: newPlayerStages,
      sleepTurns: newPlayerStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    if (newEnemyHp === 0) {
      if (enemyIndex < enemyTeam.length - 1) {
        addLog(`${enemy.name} nemico è esausto!`, 'status');
        const nextIndex = enemyIndex + 1;
        const nextEnemy = {
          ...enemyTeam[nextIndex],
          status: null,
          statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
        };
        setEnemyIndex(nextIndex);
        setEnemy(nextEnemy);
        setLastEnemyMove(null); // Reset last move when enemy changes
        setPlayerEffectivenessMessage(null);
        setEnemyEffectivenessMessage(null);
        addLog(`Il Boss manda in campo ${nextEnemy.name}!`, 'info');
        playCry(nextEnemy.cryUrl);
        setIsPlayerTurn(true); // Il giocatore attacca subito dopo aver sconfitto un Pokémon nemico
      } else {
        setIsBattleOver(true);
        addLog(`${enemy.name} è esausto! Vittoria!`, 'victory');
        playSound('victory');
        setTimeout(() => onBattleEnd('player'), 2000);
      }
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleSwitch = (index: number, isForced: boolean = false) => {
    if (index === 0 || party[index].currentHp <= 0) return;

    const newActive = party[index];
    addLog(`Rientra ${player.name}! Vai ${newActive.name}!`, 'info');

    // Update local state
    onUpdatePartyMember(0, player); // ensure current active is persisted before swap
    setPlayer({ ...newActive });
    onSwitch(index);
    setShowSwitchMenu(false);

    // Switching consumes turn UNLESS it was forced by a faint
    if (!isForced) {
      setIsPlayerTurn(false);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const handleUseItemInBattle = (itemId: string, pokemonIndex: number) => {
    const message = onUseItem(itemId, pokemonIndex);
    addLog(message, 'status');

    // Applica l'effetto direttamente sullo stato locale — party[0] è stale per via dell'async
    if (pokemonIndex === 0) {
      const item = ITEMS.find(i => i.id === itemId);
      if (item) {
        const { updatedPokemon } = item.effect(player);
        setPlayer(updatedPokemon);
      }
    }

    setShowBagMenu(false);
    setSelectedItemForPokemon(null);
    setIsPlayerTurn(false);
  };

  const enemyTurn = () => {
    if (isBattleOver) return;

    // Clear previous effectiveness messages
    setPlayerEffectivenessMessage(null);
    setEnemyEffectivenessMessage(null);

    // Improved AI: Prefer moves that are super effective against player
    const availableMoves = enemy.moves.filter(m => m.power > 0); // Only damaging moves for simplicity
    let movePool: Move[] = [];

    availableMoves.forEach(move => {
      let effectiveness = 1;
      player.types.forEach(type => {
        effectiveness *= getTypeEffectiveness(move.type, type);
      });

      // Weight: super effective moves get 3x chance, normal 1x, not very effective 0.5x
      const weight = effectiveness > 1 ? 3 : effectiveness < 1 ? 0.5 : 1;
      for (let i = 0; i < weight; i++) {
        movePool.push(move);
      }
    });

    // If no moves available (shouldn't happen), fallback to random
    const move = movePool.length > 0 ? movePool[Math.floor(Math.random() * movePool.length)] : enemy.moves[Math.floor(Math.random() * enemy.moves.length)];

    setLastEnemyMove(move);

    // Process the turn including status checks and move effects
    const turnResult = MoveEffectHandler.processTurn(enemy, player, move);

    // Add status messages
    turnResult.statusResult.messages.forEach(message => addLog(message.replace(' nemico', ''), 'status'));

    // Handle status clearing
    if (turnResult.statusResult.statusCleared) {
      setEnemy(prev => ({
        ...prev,
        status: null,
        sleepTurns: undefined,
        actualStats: MoveEffectHandler.applyStatusEffects({ ...prev, status: null })
      }));
    }

    // If can't act, apply end turn effects
    if (!turnResult.statusResult.canAct) {
      // Handle sleep turns decrement
      if (enemy.status === 'SLP' && enemy.sleepTurns && enemy.sleepTurns > 0) {
        setEnemy(prev => ({ ...prev, sleepTurns: (prev.sleepTurns || 1) - 1 }));
      }
      applyEndTurnEffects();
      return;
    }

    const effectResult = turnResult.effectResult!;

    // Handle miss
    if (effectResult.isMiss) {
      triggerEffect('miss', 'player', 'FALLITO!');
      applyEndTurnEffects();
      return;
    }

    // Apply damage
    let newPlayerHp = player.currentHp;
    if (effectResult.damage && effectResult.damage > 0) {
      newPlayerHp = Math.max(0, player.currentHp - effectResult.damage);
      triggerEffect(move.type.toLowerCase(), 'player');

      if (effectResult.isCritical) {
        setTimeout(() => triggerEffect('crit', 'player', 'CRITICO!'), 300);
      }
    }

    // Apply healing (enemy healing)
    let newEnemyHp = enemy.currentHp;
    if (effectResult.healing && effectResult.healing > 0) {
      newEnemyHp = Math.min(enemy.maxHp, enemy.currentHp + effectResult.healing);
      addLog(`${enemy.name} nemico ha recuperato ${effectResult.healing} HP!`, 'status');
    }

    if (effectResult.effectiveness && effectResult.effectiveness > 1) {
      const msg = 'È superefficace!';
      playSound('hitSuper');
      setEnemyEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setEnemyEffectivenessMessage(null), 2000);
    }
    if (effectResult.effectiveness && effectResult.effectiveness < 1 && effectResult.effectiveness > 0) {
      const msg = 'Non è molto efficace...';
      playSound('hitWeak');
      setEnemyEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setEnemyEffectivenessMessage(null), 2000);
    }
    if (effectResult.effectiveness === 0) {
      const msg = 'Non ha effetto...';
      setEnemyEffectivenessMessage(msg);
      addLog(msg, 'status');
      setTimeout(() => setEnemyEffectivenessMessage(null), 2000);
    }

    if (effectResult.damage && effectResult.damage > 0) addLog(`Danno ricevuto: ${effectResult.damage}`, 'damage');

    // Apply stat changes - NON mutare actualStats, usa soli statStages
    let newPlayerStages = { ...player.statStages };
    let newEnemyStages = { ...enemy.statStages };

    if (effectResult.statChanges) {
      effectResult.statChanges.forEach(sc => {
        if (sc.target === 'user') {
          newEnemyStages[sc.stat] = Math.max(-6, Math.min(6, (newEnemyStages[sc.stat] || 0) + sc.change));
        } else {
          newPlayerStages[sc.stat] = Math.max(-6, Math.min(6, (newPlayerStages[sc.stat] || 0) + sc.change));
        }
      });
    }

    // Apply status
    let newPlayerStatus = player.status;
    let newEnemyStatus = enemy.status;
    let newEnemySleepTurns = enemy.sleepTurns;

    if (effectResult.statusApplied) {
      const { status, target } = effectResult.statusApplied;
      if (target === 'user') {
        if (!enemy.status) {
          newEnemyStatus = status;
          if (status === 'SLP') {
            newEnemySleepTurns = Math.floor(Math.random() * 3) + 1;
          }
          triggerEffect('status', 'enemy', status);
        }
      } else {
        if (!player.status) {
          newPlayerStatus = status;
          triggerEffect('status', 'player', status);
        }
      }
    }

    commitPlayer(prev => ({
      ...prev,
      currentHp: newPlayerHp,
      status: newPlayerStatus,
      statStages: newPlayerStages,
      sleepTurns: newPlayerStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    setEnemy(prev => ({
      ...prev,
      status: newEnemyStatus,
      statStages: newEnemyStages,
      sleepTurns: newEnemyStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    if (newPlayerHp === 0) {
      const hasHealthyPokemon = party.some((p, i) => i !== 0 && p.currentHp > 0);
      if (hasHealthyPokemon) {
        addLog(`${player.name} è esausto! Scegli un altro Pokémon!`, 'defeat');
        setShowSwitchMenu(true);
        // Turn will be set to player in handleSwitch(index, true)
      } else {
        setIsBattleOver(true);
        addLog(`${player.name} è esausto... Sconfitta.`, 'defeat');
        setTimeout(() => onBattleEnd('enemy'), 2000);
      }
    } else {
      applyEndTurnEffects();
    }
  };

  const applyEndTurnEffects = () => {
    // Apply end of turn effects for both player and enemy
    const playerEffects = MoveEffectHandler.applyEndOfTurnEffects(player);
    const enemyEffects = MoveEffectHandler.applyEndOfTurnEffects(enemy);

    // Apply player effects
    if (playerEffects.damage > 0) {
      const newPlayerHp = Math.max(0, player.currentHp - playerEffects.damage);
      commitPlayer(prev => ({ ...prev, currentHp: newPlayerHp }));
      playerEffects.messages.forEach(message => addLog(message, 'damage'));

      if (newPlayerHp === 0) {
        const hasHealthyPokemon = party.some((p, i) => i !== 0 && p.currentHp > 0);
        if (hasHealthyPokemon) {
          addLog(`${player.name} è esausto per lo stato! Scegli un altro Pokémon!`, 'defeat');
          setShowSwitchMenu(true);
          return;
        } else {
          setIsBattleOver(true);
          addLog(`${player.name} è esausto per lo stato! Sconfitta.`, 'defeat');
          setTimeout(() => onBattleEnd('enemy'), 2000);
          return;
        }
      }
    }

    // Apply enemy effects
    if (enemyEffects.damage > 0) {
      const newEnemyHp = Math.max(0, enemy.currentHp - enemyEffects.damage);
      setEnemy(prev => ({ ...prev, currentHp: newEnemyHp }));
      enemyEffects.messages.forEach(message => addLog(message.replace(' nemico', ''), 'damage'));

      if (newEnemyHp === 0) {
        if (enemyIndex < enemyTeam.length - 1) {
          addLog(`${enemy.name} nemico è esausto per lo stato!`, 'status');
          const nextIndex = enemyIndex + 1;
          const nextEnemy = {
            ...enemyTeam[nextIndex],
            status: null,
            statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
          };
          setEnemyIndex(nextIndex);
          setEnemy(nextEnemy);
          setLastEnemyMove(null); // Reset last move when enemy changes
          setPlayerEffectivenessMessage(null);
          setEnemyEffectivenessMessage(null);
          addLog(`Il Boss manda in campo ${nextEnemy.name}!`, 'info');
          playCry(nextEnemy.cryUrl);
        } else {
          setIsBattleOver(true);
          addLog(`${enemy.name} è esausto per lo stato! Vittoria!`, 'victory');
          setTimeout(() => onBattleEnd('player'), 2000);
          return;
        }
      }
    }

    setIsPlayerTurn(true);
  };

  const getHealthColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio > 0.2) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="relative overflow-hidden flex flex-col h-full bg-transparent text-white p-2 md:p-4 font-sans">
      <BattleBackground isBoss={isBoss} />
      {/* Battle Arena */}
      <div className="relative z-10 flex-1 flex flex-col justify-start md:justify-between gap-1 md:gap-4 min-h-0">
        {/* Enemy Side */}
        <div className="flex justify-between items-start p-1 md:p-4 relative flex-shrink-0">
          {activeEffect?.side === 'enemy' && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="relative"
                >
                  {activeEffect.text && (
                    <div className={`text-2xl font-black italic uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                      ${activeEffect.type === 'supereffective' ? 'text-amber-400' :
                        activeEffect.type === 'ineffective' ? 'text-slate-400' :
                          activeEffect.type === 'crit' ? 'text-rose-500' : 'text-white'}`}
                    >
                      {activeEffect.text}
                    </div>
                  )}
                  {/* Visual particles based on type */}
                  {activeEffect.type === 'fire' && <div className="w-20 h-20 bg-orange-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'water' && <div className="w-20 h-20 bg-blue-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'grass' && <div className="w-20 h-20 bg-emerald-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'electric' && <div className="w-20 h-20 bg-yellow-400 rounded-full blur-xl animate-pulse opacity-60" />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-slate-800/80 p-2 md:p-4 rounded-2xl border border-white/10 w-52 md:w-64 shadow-xl text-xs md:text-base"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-base md:text-lg truncate">{enemy.name}</span>
                  {enemy.status && (
                    <span className={`text-[8px] md:text-[10px] px-1 py-0.5 rounded font-bold text-white whitespace-nowrap
                      ${enemy.status === 'PAR' ? 'bg-amber-400' :
                        enemy.status === 'BRN' ? 'bg-rose-500' :
                          enemy.status === 'PSN' ? 'bg-purple-500' :
                            enemy.status === 'SLP' ? 'bg-slate-400' : 'bg-cyan-400'}`}
                    >
                      {enemy.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {enemy.types.map(type => (
                    <span key={`enemy-type-${type}`} className="text-[8px] md:text-[10px] uppercase font-bold bg-slate-700/70 px-2 py-0.5 rounded-full border border-white/10">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] md:text-xs opacity-60">Lv. {enemy.level || 50}</span>
                {enemyTeam.length > 1 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {enemyTeam.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${i === enemyIndex ? 'bg-rose-500' : i < enemyIndex ? 'bg-slate-600' : 'bg-slate-400/30'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="h-2 md:h-3 bg-slate-700 rounded-full overflow-hidden border border-black/20">
              <motion.div
                className={`h-full transition-colors duration-500 ${getHealthColor(enemy.currentHp, enemy.maxHp)}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-right text-[10px] md:text-xs mt-0.5 md:mt-1 font-mono">
              {enemy.currentHp} / {enemy.maxHp} HP
            </div>
            {playerEffectivenessMessage && (
              <div className="mt-1 text-center text-[10px] md:text-xs font-bold px-2 py-1 rounded-full bg-slate-900/70 border border-white/10 text-amber-300">
                {playerEffectivenessMessage}
              </div>
            )}
            <StatStagesBadges pokemon={enemy} />
          </motion.div>
          <motion.div
            animate={!isPlayerTurn ? { x: [-5, 5, -5] } : (activeEffect?.side === 'enemy' ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } : {})}
            transition={activeEffect?.side === 'enemy' ? { duration: 0.2 } : { repeat: Infinity, duration: 0.5 }}
          >
            <PokemonSprite
              id={enemy.id}
              name={enemy.name}
              className="w-36 h-36 md:w-56 md:h-56 ml-1 md:ml-4"
            />
          </motion.div>
        </div>

        {/* Last Move Indicator */}
        <div className="flex-1 min-h-0 overflow-visible flex items-start justify-center md:justify-center z-50 pointer-events-none">
          {lastEnemyMove && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pointer-events-none flex flex-col justify-center items-center py-2 space-y-1"
            >
              <div className="text-center text-xs md:text-sm font-bold text-indigo-300 bg-slate-800/60 px-4 py-2 rounded-lg border border-indigo-500/30">
                Ultima mossa nemico: <span className="text-indigo-400">{lastEnemyMove.name}</span>
              </div>
              {/* Recent battle messages */}
              {logs.slice(0, 3).map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center text-xs px-3 py-1 rounded border ${log.type === 'damage' ? 'text-rose-300 bg-rose-900/40 border-rose-500/30' :
                      log.type === 'status' ? 'text-amber-300 bg-amber-900/40 border-amber-500/30' :
                        log.type === 'victory' ? 'text-emerald-300 bg-emerald-900/40 border-emerald-500/30' :
                          log.type === 'defeat' ? 'text-red-300 bg-red-900/40 border-red-500/30' :
                            'text-slate-300 bg-slate-800/40 border-slate-500/30'
                    }`}
                >
                  {log.message}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Player Side */}
        <div className="flex justify-between items-end p-1 md:p-4 relative mt-auto md:mt-0 md:self-auto gap-1 md:gap-4 flex-shrink-0">
          {activeEffect?.side === 'player' && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="relative"
                >
                  {activeEffect.text && (
                    <div className={`text-2xl font-black italic uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                      ${activeEffect.type === 'supereffective' ? 'text-amber-400' :
                        activeEffect.type === 'ineffective' ? 'text-slate-400' :
                          activeEffect.type === 'crit' ? 'text-rose-500' : 'text-white'}`}
                    >
                      {activeEffect.text}
                    </div>
                  )}
                  {activeEffect.type === 'fire' && <div className="w-20 h-20 bg-orange-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'water' && <div className="w-20 h-20 bg-blue-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'grass' && <div className="w-20 h-20 bg-emerald-500 rounded-full blur-xl animate-pulse opacity-60" />}
                  {activeEffect.type === 'electric' && <div className="w-20 h-20 bg-yellow-400 rounded-full blur-xl animate-pulse opacity-60" />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          <motion.div
            animate={isPlayerTurn ? { x: [-5, 5, -5] } : (activeEffect?.side === 'player' ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } : {})}
            transition={activeEffect?.side === 'player' ? { duration: 0.2 } : { repeat: Infinity, duration: 0.5 }}
          >
            <PokemonSprite
              id={player.id}
              name={player.name}
              isBack={true}
              className="w-40 h-40 md:w-64 md:h-64 mr-1 md:mr-4"
            />
          </motion.div>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-slate-800/80 p-2 md:p-4 rounded-2xl border border-white/10 w-52 md:w-64 shadow-xl text-xs md:text-base"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-base md:text-lg truncate">{player.name}</span>
                  {player.status && (
                    <span className={`text-[8px] md:text-[10px] px-1 py-0.5 rounded font-bold text-white whitespace-nowrap
                      ${player.status === 'PAR' ? 'bg-amber-400' :
                        player.status === 'BRN' ? 'bg-rose-500' :
                          player.status === 'PSN' ? 'bg-purple-500' :
                            player.status === 'SLP' ? 'bg-slate-400' : 'bg-cyan-400'}`}
                    >
                      {player.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {player.types.map(type => (
                    <span key={`player-type-${type}`} className="text-[8px] md:text-[10px] uppercase font-bold bg-slate-700/70 px-2 py-0.5 rounded-full border border-white/10">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] md:text-xs opacity-60">Lv. {player.level}</span>
            </div>
            <div className="h-2 md:h-3 bg-slate-700 rounded-full overflow-hidden border border-black/20">
              <motion.div
                className={`h-full transition-colors duration-500 ${getHealthColor(player.currentHp, player.maxHp)}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-right text-[10px] md:text-xs mt-0.5 md:mt-1 font-mono">
              {player.currentHp} / {player.maxHp} HP
            </div>
            {enemyEffectivenessMessage && (
              <div className="mt-1 text-center text-[10px] md:text-xs font-bold px-2 py-1 rounded-full bg-slate-900/70 border border-white/10 text-amber-300">
                {enemyEffectivenessMessage}
              </div>
            )}
            <StatStagesBadges pokemon={player} />

            {/* Party Status */}
            <div className="mt-1.5 md:mt-3 pt-1 md:pt-2 border-t border-white/5 flex gap-1">
              {party.map((member, i) => (
                <div
                  key={member.id + i}
                  className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${i === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' :
                      member.currentHp > 0 ? 'bg-emerald-500/50' : 'bg-rose-500/30'
                    }`}
                  title={member.name}
                />
              ))}
              {Array.from({ length: 6 - party.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-slate-700/30 border border-white/5" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls & Logs */}
      <div className="flex-shrink-0 h-auto md:h-64 bg-slate-950 rounded-t-3xl p-3 md:p-6 border-t border-white/10 flex flex-col md:flex-row gap-3 md:gap-6 overflow-hidden md:overflow-hidden">
        {/* Moves Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 relative z-40">
          {hoveredMove && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-slate-800 border border-indigo-500/30 px-4 py-3 rounded-xl shadow-2xl text-[11px] md:text-base max-w-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-indigo-300 uppercase text-[11px] md:text-sm">{hoveredMove.name}</span>
                  <span className="bg-slate-700 px-2 py-1 rounded text-[9px] md:text-[11px] uppercase font-bold">{hoveredMove.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] md:text-[10px] font-mono">
                  <div className="flex flex-col">
                    <span className="opacity-50 uppercase text-[7px]">Potenza</span>
                    <span className="font-bold text-white">{hoveredMove.power || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-50 uppercase text-[7px]">Precisione</span>
                    <span className="font-bold text-white">{hoveredMove.accuracy}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-50 uppercase text-[7px]">Classe</span>
                    <span className="font-bold text-white uppercase text-[7px]">{hoveredMove.damageClass?.slice(0, 3)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {player.moves.map(move => (
            <button
              key={move.id}
              onClick={() => handleMove(move)}
              onMouseEnter={() => setHoveredMove(move)}
              onMouseLeave={() => setHoveredMove(null)}
              onTouchStart={() => setHoveredMove(move)}
              onTouchEnd={() => setHoveredMove(null)}
              disabled={!isPlayerTurn || isBattleOver || showSwitchMenu || showBagMenu || (move.currentPp !== undefined && move.currentPp <= 0)}
              className={`p-3 rounded-xl border transition-all flex flex-col items-start gap-1 group text-[11px]
                ${isPlayerTurn && !isBattleOver && !showSwitchMenu && !showBagMenu && (move.currentPp === undefined || move.currentPp > 0)
                  ? 'bg-slate-800 border-white/10 hover:bg-slate-700 hover:border-white/30 active:scale-105'
                  : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
            >
              <span className="font-bold uppercase tracking-wider text-xs md:text-sm">{move.name}</span>
              <div className="flex items-center justify-between w-full text-[9px] md:text-[10px] opacity-60">
                <span className="bg-slate-700 px-1.5 py-0.5 rounded uppercase text-[8px]">{move.type}</span>
                <span className="font-mono">{move.currentPp ?? move.pp}/{move.pp} PP</span>
              </div>
            </button>
          ))}

          {/* Switch Button */}
          <button
            onClick={() => setShowSwitchMenu(true)}
            disabled={!isPlayerTurn || isBattleOver || party.length <= 1 || showBagMenu}
            className={`p-2 md:p-3 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs
              ${isPlayerTurn && !isBattleOver && party.length > 1 && !showBagMenu
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 hover:border-indigo-500/50'
                : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
          >
            Cambia
          </button>

          {/* Bag Button */}
          <button
            onClick={() => setShowBagMenu(true)}
            disabled={!isPlayerTurn || isBattleOver || inventory.length === 0 || showSwitchMenu}
            className={`p-2 md:p-3 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-1
              ${isPlayerTurn && !isBattleOver && inventory.length > 0 && !showSwitchMenu
                ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:border-emerald-500/50'
                : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
          >
            <Briefcase size={12} />
            Zaino
          </button>
        </div>

        {/* Bag Menu Overlay */}
        <AnimatePresence>
          {showBagMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                {!selectedItemForPokemon ? (
                  <>
                    <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-tighter">Il tuo Zaino</h3>
                    <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                      {inventory.map((invItem) => {
                        const item = ITEMS.find(i => i.id === invItem.itemId);
                        if (!item) return null;
                        return (
                          <button
                            key={invItem.itemId}
                            onClick={() => setSelectedItemForPokemon(invItem.itemId)}
                            className="p-4 rounded-2xl border border-white/10 bg-slate-800 hover:bg-slate-700 hover:border-white/30 flex items-center justify-between transition-all group"
                          >
                            <div className="text-left">
                              <div className="font-bold uppercase group-hover:text-emerald-400 transition-colors">{item.name}</div>
                              <div className="text-[10px] opacity-50">{item.description}</div>
                            </div>
                            <div className="bg-slate-900 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-white/5">
                              x{invItem.count}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-tighter">Usa su chi?</h3>
                    <div className="grid gap-3">
                      {party.map((member, i) => (
                        <button
                          key={member.id + i}
                          onClick={() => handleUseItemInBattle(selectedItemForPokemon, i)}
                          disabled={!isItemUsable(selectedItemForPokemon, member)}
                          className={`p-4 rounded-2xl border border-white/10 bg-slate-800 flex items-center justify-between transition-all group ${
                            isItemUsable(selectedItemForPokemon, member)
                              ? 'hover:bg-slate-700 hover:border-white/30'
                              : 'opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-bold group-hover:text-emerald-400 transition-colors">{member.name}</div>
                            {member.status && (
                              <span className="text-[8px] bg-rose-500 px-1 rounded font-bold">{member.status}</span>
                            )}
                          </div>
                          <div className="text-xs font-mono">
                            {member.currentHp} / {member.maxHp} HP
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedItemForPokemon(null)}
                      className="w-full mt-4 p-2 text-slate-400 hover:text-white text-xs font-bold uppercase"
                    >
                      Indietro
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setShowBagMenu(false); setSelectedItemForPokemon(null); }}
                  className="w-full mt-6 p-3 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest"
                >
                  Chiudi Zaino
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch Menu Overlay */}
        <AnimatePresence>
          {showSwitchMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-tighter">Scegli Pokémon</h3>
                <div className="grid gap-3">
                  {party.map((member, i) => (
                    <button
                      key={member.id + i}
                      disabled={i === 0 || member.currentHp <= 0}
                      onClick={() => handleSwitch(i, player.currentHp === 0)}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all
                        ${i === 0 ? 'border-indigo-500/50 bg-indigo-500/10 opacity-50 cursor-not-allowed' :
                          member.currentHp > 0 ? 'border-white/10 bg-slate-800 hover:bg-slate-700 hover:border-white/30' :
                            'border-rose-500/20 bg-rose-500/5 opacity-40 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold">{member.name}</div>
                        <div className="text-[10px] opacity-50">Lv. {member.level}</div>
                      </div>
                      <div className="text-xs font-mono">
                        {member.currentHp} / {member.maxHp} HP
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (player.currentHp > 0) {
                      setShowSwitchMenu(false);
                    }
                  }}
                  className={`w-full mt-6 p-3 font-bold uppercase text-xs tracking-widest ${player.currentHp > 0 ? 'text-slate-500 hover:text-white' : 'text-slate-700 cursor-not-allowed'}`}
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Battle Log */}
        <div className="hidden md:flex w-80 bg-black/40 rounded-xl p-4 border border-white/5 flex-col min-h-0 max-h-full overflow-y-auto z-20">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Battle Log</div>
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
            <AnimatePresence initial={false}>
              {logs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium ${log.type === 'damage' ? 'text-rose-400' :
                      log.type === 'victory' ? 'text-emerald-400 font-bold' :
                        log.type === 'defeat' ? 'text-rose-600 font-bold' : 'text-slate-300'
                    }`}
                >
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
