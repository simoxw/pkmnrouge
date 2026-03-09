import React, { useState, useEffect } from 'react';
import { BattlePokemon, Move, BattleLog, InventoryItem } from '../types';
import { calculateDamage } from '../battle';
import { ITEMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import PokemonSprite from './PokemonSprite';
import { Briefcase } from 'lucide-react';

interface BattleEngineProps {
  playerPokemon: BattlePokemon;
  enemyPokemon: BattlePokemon;
  party: BattlePokemon[];
  inventory: InventoryItem[];
  onBattleEnd: (winner: 'player' | 'enemy') => void;
  onSwitch: (index: number) => void;
  onUseItem: (itemId: string, pokemonIndex: number) => string;
}

export default function BattleEngine({ playerPokemon: initialPlayer, enemyPokemon: initialEnemy, party, inventory, onBattleEnd, onSwitch, onUseItem }: BattleEngineProps) {
  const [player, setPlayer] = useState<BattlePokemon>({ ...initialPlayer, status: initialPlayer.status || null });
  const [enemy, setEnemy] = useState<BattlePokemon>({ ...initialEnemy, status: initialEnemy.status || null });
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(player.actualStats.speed >= enemy.actualStats.speed);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showBagMenu, setShowBagMenu] = useState(false);
  const [selectedItemForPokemon, setSelectedItemForPokemon] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<{ type: string, side: 'player' | 'enemy', text?: string } | null>(null);

  const triggerEffect = (type: string, side: 'player' | 'enemy', text?: string) => {
    setActiveEffect({ type, side, text });
    setTimeout(() => setActiveEffect(null), 1000);
  };

  const playCry = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed", e));
  };

  useEffect(() => {
    // Play cries at start
    playCry(player.cryUrl);
    setTimeout(() => playCry(enemy.cryUrl), 1000);
  }, []);

  const addLog = (message: string, type: BattleLog['type'] = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), message, type }, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!isPlayerTurn && !isBattleOver) {
      const timer = setTimeout(enemyTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, isBattleOver]);

  const handleMove = (move: Move) => {
    if (!isPlayerTurn || isBattleOver) return;

    // Check Status (Paralysis, Sleep, Freeze)
    if (player.status === 'SLP') {
      if (player.sleepTurns && player.sleepTurns > 0) {
        addLog(`${player.name} sta dormendo profondamente...`, 'status');
        setPlayer(prev => ({ ...prev, sleepTurns: (prev.sleepTurns || 1) - 1 }));
        setIsPlayerTurn(false);
        return;
      } else {
        addLog(`${player.name} si è svegliato!`, 'status');
        setPlayer(prev => ({ ...prev, status: null }));
      }
    }

    if (player.status === 'FRZ') {
      if (Math.random() < 0.2) {
        addLog(`${player.name} si è scongelato!`, 'status');
        setPlayer(prev => ({ ...prev, status: null }));
      } else {
        addLog(`${player.name} è congelato!`, 'status');
        setIsPlayerTurn(false);
        return;
      }
    }

    if (player.status === 'PAR' && Math.random() < 0.25) {
      addLog(`${player.name} è paralizzato! Non riesce a muoversi!`, 'status');
      setIsPlayerTurn(false);
      return;
    }

    const { damage, effectiveness, isCritical, isMiss } = calculateDamage(player, enemy, move);
    
    if (isMiss) {
      addLog(`L'attacco di ${player.name} è fallito!`, 'status');
      triggerEffect('miss', 'enemy', 'FALLITO!');
      setIsPlayerTurn(false);
      return;
    }

    const newEnemyHp = Math.max(0, enemy.currentHp - damage);
    
    addLog(`${player.name} usa ${move.name}!`, 'info');
    
    // Trigger visual effect based on move type
    triggerEffect(move.type.toLowerCase(), 'enemy');
    
    if (isCritical) {
      addLog('Brutto colpo!', 'damage');
      setTimeout(() => triggerEffect('crit', 'enemy', 'CRITICO!'), 300);
    }
    
    if (effectiveness > 1) {
      addLog('È superefficace!', 'status');
      setTimeout(() => triggerEffect('supereffective', 'enemy', 'SUPEREFFICACE!'), 500);
    }
    if (effectiveness < 1 && effectiveness > 0) {
      addLog('Non è molto efficace...', 'status');
      setTimeout(() => triggerEffect('ineffective', 'enemy', 'NON EFFICACE'), 500);
    }
    if (effectiveness === 0) {
      addLog('Non ha effetto...', 'status');
      setTimeout(() => triggerEffect('no-effect', 'enemy', 'NESSUN EFFETTO'), 500);
    }
    
    if (damage > 0) addLog(`Danno inflitto: ${damage}`, 'damage');

    // Handle Ailments
    let newEnemyStatus = enemy.status;
    if (move.ailment && !enemy.status && Math.random() * 100 < (move.ailmentChance || 100)) {
      const ailmentMap: Record<string, any> = {
        'paralysis': 'PAR',
        'burn': 'BRN',
        'poison': 'PSN',
        'sleep': 'SLP',
        'freeze': 'FRZ'
      };
      newEnemyStatus = ailmentMap[move.ailment] || null;
      if (newEnemyStatus) {
        addLog(`${enemy.name} è rimasto ${move.ailment}!`, 'status');
      }
    }

    // Handle Stat Changes
    let newEnemyStats = { ...enemy.actualStats };
    if (move.statChanges) {
      move.statChanges.forEach(sc => {
        const currentVal = newEnemyStats[sc.stat];
        const multiplier = sc.change > 0 ? 1.5 : 0.66;
        newEnemyStats[sc.stat] = Math.floor(currentVal * multiplier);
        addLog(`La ${sc.stat} di ${enemy.name} è ${sc.change > 0 ? 'aumentata' : 'diminuita'}!`, 'status');
      });
    }
    
    setEnemy(prev => ({ 
      ...prev, 
      currentHp: newEnemyHp, 
      status: newEnemyStatus,
      actualStats: newEnemyStats,
      sleepTurns: newEnemyStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    if (newEnemyHp === 0) {
      setIsBattleOver(true);
      addLog(`${enemy.name} è esausto! Vittoria!`, 'victory');
      setTimeout(() => onBattleEnd('player'), 2000);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleSwitch = (index: number) => {
    if (index === 0 || party[index].currentHp <= 0) return;
    
    const newActive = party[index];
    addLog(`Rientra ${player.name}! Vai ${newActive.name}!`, 'info');
    
    // Update local state
    setPlayer({ ...newActive });
    onSwitch(index);
    setShowSwitchMenu(false);
    
    // Switching consumes turn
    setIsPlayerTurn(false);
  };

  const handleUseItemInBattle = (itemId: string, pokemonIndex: number) => {
    const message = onUseItem(itemId, pokemonIndex);
    addLog(message, 'status');
    
    // Update local state if used on active pokemon
    if (pokemonIndex === 0) {
      const updatedPkmn = party[0]; // App.tsx already updated it
      // Wait, party is updated in App.tsx, but local 'player' state might be stale
      // Actually, App.tsx updates 'party' which is passed as prop, but 'player' is local state.
      // Let's sync local state.
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

    // Check Status
    if (enemy.status === 'SLP') {
      if (enemy.sleepTurns && enemy.sleepTurns > 0) {
        addLog(`${enemy.name} nemico sta dormendo...`, 'status');
        setEnemy(prev => ({ ...prev, sleepTurns: (prev.sleepTurns || 1) - 1 }));
        applyEndTurnEffects('enemy');
        return;
      } else {
        addLog(`${enemy.name} nemico si è svegliato!`, 'status');
        setEnemy(prev => ({ ...prev, status: null }));
      }
    }

    if (enemy.status === 'FRZ') {
      if (Math.random() < 0.2) {
        addLog(`${enemy.name} nemico si è scongelato!`, 'status');
        setEnemy(prev => ({ ...prev, status: null }));
      } else {
        addLog(`${enemy.name} nemico è congelato!`, 'status');
        applyEndTurnEffects('enemy');
        return;
      }
    }

    if (enemy.status === 'PAR' && Math.random() < 0.25) {
      addLog(`${enemy.name} nemico è paralizzato!`, 'status');
      applyEndTurnEffects('enemy');
      return;
    }

    const move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
    const { damage, effectiveness, isCritical, isMiss } = calculateDamage(enemy, player, move);
    
    if (isMiss) {
      addLog(`L'attacco di ${enemy.name} nemico è fallito!`, 'status');
      triggerEffect('miss', 'player', 'FALLITO!');
      applyEndTurnEffects('enemy');
      return;
    }

    const newPlayerHp = Math.max(0, player.currentHp - damage);

    addLog(`${enemy.name} nemico usa ${move.name}!`, 'info');
    
    // Trigger visual effect
    triggerEffect(move.type.toLowerCase(), 'player');

    if (isCritical) {
      addLog('Brutto colpo!', 'damage');
      setTimeout(() => triggerEffect('crit', 'player', 'CRITICO!'), 300);
    }
    
    if (effectiveness > 1) {
      addLog('È superefficace!', 'status');
      setTimeout(() => triggerEffect('supereffective', 'player', 'SUPEREFFICACE!'), 500);
    }
    if (effectiveness < 1 && effectiveness > 0) {
      addLog('Non è molto efficace...', 'status');
      setTimeout(() => triggerEffect('ineffective', 'player', 'NON EFFICACE'), 500);
    }
    if (effectiveness === 0) {
      addLog('Non ha effetto...', 'status');
      setTimeout(() => triggerEffect('no-effect', 'player', 'NESSUN EFFETTO'), 500);
    }

    if (damage > 0) addLog(`Danno ricevuto: ${damage}`, 'damage');

    // Handle Ailments for Player
    let newPlayerStatus = player.status;
    if (move.ailment && !player.status && Math.random() * 100 < (move.ailmentChance || 100)) {
      const ailmentMap: Record<string, any> = {
        'paralysis': 'PAR',
        'burn': 'BRN',
        'poison': 'PSN',
        'sleep': 'SLP',
        'freeze': 'FRZ'
      };
      newPlayerStatus = ailmentMap[move.ailment] || null;
      if (newPlayerStatus) {
        addLog(`${player.name} è rimasto ${move.ailment}!`, 'status');
      }
    }

    setPlayer(prev => ({ 
      ...prev, 
      currentHp: newPlayerHp, 
      status: newPlayerStatus,
      sleepTurns: newPlayerStatus === 'SLP' ? Math.floor(Math.random() * 3) + 1 : undefined
    }));

    if (newPlayerHp === 0) {
      setIsBattleOver(true);
      addLog(`${player.name} è esausto... Sconfitta.`, 'defeat');
      setTimeout(() => onBattleEnd('enemy'), 2000);
    } else {
      applyEndTurnEffects('enemy');
    }
  };

  const applyEndTurnEffects = (side: 'player' | 'enemy') => {
    const target = side === 'player' ? player : enemy;
    const setTarget = side === 'player' ? setPlayer : setEnemy;
    
    let damage = 0;
    if (target.status === 'BRN' || target.status === 'PSN') {
      damage = Math.floor(target.maxHp / 16);
      addLog(`${target.name} subisce danni dallo stato!`, 'damage');
    }

    if (damage > 0) {
      const newHp = Math.max(0, target.currentHp - damage);
      setTarget(prev => ({ ...prev, currentHp: newHp }));
      
      if (newHp === 0) {
        setIsBattleOver(true);
        addLog(`${target.name} è esausto per lo stato!`, side === 'player' ? 'defeat' : 'victory');
        setTimeout(() => onBattleEnd(side === 'player' ? 'enemy' : 'player'), 2000);
        return;
      }
    }

    if (side === 'enemy') {
      setIsPlayerTurn(true);
    }
  };

  const getHealthColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio > 0.2) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4 font-sans">
      {/* Battle Arena */}
      <div className="flex-1 flex flex-col justify-around relative overflow-hidden">
        {/* Enemy Side */}
        <div className="flex justify-end items-start p-4 relative">
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
            className="bg-slate-800/80 p-4 rounded-2xl border border-white/10 w-64 shadow-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{enemy.name}</span>
                {enemy.status && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white
                    ${enemy.status === 'PAR' ? 'bg-amber-400' : 
                      enemy.status === 'BRN' ? 'bg-rose-500' :
                      enemy.status === 'PSN' ? 'bg-purple-500' :
                      enemy.status === 'SLP' ? 'bg-slate-400' : 'bg-cyan-400'}`}
                  >
                    {enemy.status}
                  </span>
                )}
              </div>
              <span className="text-xs opacity-60">Lv. {enemy.level || 50}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-black/20">
              <motion.div 
                className={`h-full transition-colors duration-500 ${getHealthColor(enemy.currentHp, enemy.maxHp)}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-right text-xs mt-1 font-mono">
              {enemy.currentHp} / {enemy.maxHp} HP
            </div>
          </motion.div>
          <motion.div
            animate={!isPlayerTurn ? { x: [-5, 5, -5] } : (activeEffect?.side === 'enemy' ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } : {})}
            transition={activeEffect?.side === 'enemy' ? { duration: 0.2 } : { repeat: Infinity, duration: 0.5 }}
          >
            <PokemonSprite 
              id={enemy.id} 
              name={enemy.name} 
              className="w-32 h-32 ml-4"
            />
          </motion.div>
        </div>

        {/* Player Side */}
        <div className="flex justify-start items-end p-4 relative">
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
              className="w-48 h-48 mr-4"
            />
          </motion.div>
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-slate-800/80 p-4 rounded-2xl border border-white/10 w-64 shadow-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{player.name}</span>
                {player.status && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white
                    ${player.status === 'PAR' ? 'bg-amber-400' : 
                      player.status === 'BRN' ? 'bg-rose-500' :
                      player.status === 'PSN' ? 'bg-purple-500' :
                      player.status === 'SLP' ? 'bg-slate-400' : 'bg-cyan-400'}`}
                  >
                    {player.status}
                  </span>
                )}
              </div>
              <span className="text-xs opacity-60">Lv. {player.level}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-black/20">
              <motion.div 
                className={`h-full transition-colors duration-500 ${getHealthColor(player.currentHp, player.maxHp)}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
              />
            </div>
            <div className="text-right text-xs mt-1 font-mono">
              {player.currentHp} / {player.maxHp} HP
            </div>
            
            {/* Party Status */}
            <div className="mt-3 pt-2 border-t border-white/5 flex gap-1.5">
              {party.map((member, i) => (
                <div 
                  key={member.id + i}
                  className={`w-2 h-2 rounded-full ${
                    i === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 
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
      <div className="h-64 bg-slate-950 rounded-t-3xl p-6 border-t border-white/10 flex flex-col md:flex-row gap-6">
        {/* Moves Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {player.moves.map(move => (
            <button
              key={move.id}
              onClick={() => handleMove(move)}
              disabled={!isPlayerTurn || isBattleOver || showSwitchMenu}
              className={`p-4 rounded-xl border transition-all flex flex-col items-start gap-1 group
                ${isPlayerTurn && !isBattleOver && !showSwitchMenu
                  ? 'bg-slate-800 border-white/10 hover:bg-slate-700 hover:border-white/30 active:scale-95' 
                  : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
            >
              <span className="font-bold uppercase tracking-wider text-sm">{move.name}</span>
              <div className="flex items-center gap-2 text-[10px] opacity-60">
                <span className="bg-slate-700 px-2 py-0.5 rounded uppercase">{move.type}</span>
                <span>PWR: {move.power}</span>
              </div>
            </button>
          ))}
          
          {/* Switch Button */}
          <button
            onClick={() => setShowSwitchMenu(true)}
            disabled={!isPlayerTurn || isBattleOver || party.length <= 1 || showBagMenu}
            className={`p-3 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs
              ${isPlayerTurn && !isBattleOver && party.length > 1 && !showBagMenu
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 hover:border-indigo-500/50'
                : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
          >
            Cambia Pokémon
          </button>

          {/* Bag Button */}
          <button
            onClick={() => setShowBagMenu(true)}
            disabled={!isPlayerTurn || isBattleOver || inventory.length === 0 || showSwitchMenu}
            className={`p-3 rounded-xl border transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2
              ${isPlayerTurn && !isBattleOver && inventory.length > 0 && !showSwitchMenu
                ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:border-emerald-500/50'
                : 'bg-slate-900 border-white/5 opacity-50 cursor-not-allowed'}`}
          >
            <Briefcase size={14} />
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
                          className="p-4 rounded-2xl border border-white/10 bg-slate-800 hover:bg-slate-700 hover:border-white/30 flex items-center justify-between transition-all group"
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
                      onClick={() => handleSwitch(i)}
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
                  onClick={() => setShowSwitchMenu(false)}
                  className="w-full mt-6 p-3 text-slate-500 hover:text-white font-bold uppercase text-xs tracking-widest"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Battle Log */}
        <div className="w-full md:w-80 bg-black/40 rounded-xl p-4 overflow-y-auto border border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Battle Log</div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {logs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium ${
                    log.type === 'damage' ? 'text-rose-400' : 
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
