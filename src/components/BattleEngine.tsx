import React, { useState, useEffect } from 'react';
import { BattlePokemon, Move, BattleLog } from '../types';
import { calculateDamage } from '../battle';
import { motion, AnimatePresence } from 'motion/react';
import PokemonSprite from './PokemonSprite';

interface BattleEngineProps {
  playerPokemon: BattlePokemon;
  enemyPokemon: BattlePokemon;
  party: BattlePokemon[];
  onBattleEnd: (winner: 'player' | 'enemy') => void;
}

export default function BattleEngine({ playerPokemon: initialPlayer, enemyPokemon: initialEnemy, party, onBattleEnd }: BattleEngineProps) {
  const [player, setPlayer] = useState<BattlePokemon>({ ...initialPlayer });
  const [enemy, setEnemy] = useState<BattlePokemon>({ ...initialEnemy });
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(player.actualStats.speed >= enemy.actualStats.speed);
  const [isBattleOver, setIsBattleOver] = useState(false);

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

    const { damage, effectiveness } = calculateDamage(player, enemy, move);
    const newEnemyHp = Math.max(0, enemy.currentHp - damage);
    
    setEnemy(prev => ({ ...prev, currentHp: newEnemyHp }));
    addLog(`${player.name} usa ${move.name}!`, 'info');
    
    if (effectiveness > 1) addLog('È superefficace!', 'status');
    if (effectiveness < 1 && effectiveness > 0) addLog('Non è molto efficace...', 'status');
    if (effectiveness === 0) addLog('Non ha effetto...', 'status');
    
    addLog(`Danno inflitto: ${damage}`, 'damage');

    if (newEnemyHp === 0) {
      setIsBattleOver(true);
      addLog(`${enemy.name} è esausto! Vittoria!`, 'victory');
      setTimeout(() => onBattleEnd('player'), 2000);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const enemyTurn = () => {
    const move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
    const { damage, effectiveness } = calculateDamage(enemy, player, move);
    const newPlayerHp = Math.max(0, player.currentHp - damage);

    setPlayer(prev => ({ ...prev, currentHp: newPlayerHp }));
    addLog(`${enemy.name} nemico usa ${move.name}!`, 'info');
    
    if (effectiveness > 1) addLog('È superefficace!', 'status');
    if (effectiveness < 1 && effectiveness > 0) addLog('Non è molto efficace...', 'status');
    if (effectiveness === 0) addLog('Non ha effetto...', 'status');

    addLog(`Danno ricevuto: ${damage}`, 'damage');

    if (newPlayerHp === 0) {
      setIsBattleOver(true);
      addLog(`${player.name} è esausto... Sconfitta.`, 'defeat');
      setTimeout(() => onBattleEnd('enemy'), 2000);
    } else {
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
        <div className="flex justify-end items-start p-4">
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-slate-800/80 p-4 rounded-2xl border border-white/10 w-64 shadow-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{enemy.name}</span>
              <span className="text-xs opacity-60">Lv. 50</span>
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
            animate={!isPlayerTurn ? { x: [-5, 5, -5] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <PokemonSprite 
              id={enemy.id} 
              name={enemy.name} 
              className="w-32 h-32 ml-4"
            />
          </motion.div>
        </div>

        {/* Player Side */}
        <div className="flex justify-start items-end p-4">
          <motion.div
            animate={isPlayerTurn ? { x: [-5, 5, -5] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
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
              <span className="font-bold text-lg">{player.name}</span>
              <span className="text-xs opacity-60">Lv. 50</span>
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
              disabled={!isPlayerTurn || isBattleOver}
              className={`p-4 rounded-xl border transition-all flex flex-col items-start gap-1 group
                ${isPlayerTurn && !isBattleOver 
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
        </div>

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
