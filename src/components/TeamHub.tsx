import React, { useState } from 'react';
import { BattlePokemon, InventoryItem } from '../types';
import { ITEMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Backpack, Play, ChevronUp, ChevronDown, Map as MapIcon, Trophy, Menu } from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import { getTypeColor } from '../utils/typeColors';

interface TeamHubProps {
  party: BattlePokemon[];
  inventory: InventoryItem[];
  roomNumber: number;
  money: number;
  onStartBattle: () => void;
  onSwapPartyOrder: (index1: number, index2: number) => void;
  onUseItem: (itemId: string, pokemonIndex: number) => string;
  onOpenShop: () => void;
  onOpenMenu: () => void;
}

export default function TeamHub({
  party,
  inventory,
  roomNumber,
  money,
  onStartBattle,
  onSwapPartyOrder,
  onUseItem,
  onOpenShop,
  onOpenMenu
}: TeamHubProps) {
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [selectedPokemonForItem, setSelectedPokemonForItem] = useState<number | null>(null);
  const [useItemMessage, setUseItemMessage] = useState<string | null>(null);

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onSwapPartyOrder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < party.length - 1) {
      onSwapPartyOrder(index, index + 1);
    }
  };

  const handleUseItem = (itemId: string, pokemonIndex: number) => {
    const message = onUseItem(itemId, pokemonIndex);
    setUseItemMessage(message);
    setTimeout(() => setUseItemMessage(null), 2000);
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
      case 'full_restore':  return true;
      default:              return true;
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-900 text-white p-4 md:p-6 flex flex-col gap-4">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Progressione Scalata</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            {roomNumber} / 100
          </span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(roomNumber / 100) * 100}%` }}
            className="absolute h-full bg-gradient-to-r from-indigo-600 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
          />
          {/* Boss Markers */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(bossRoom => (
            <div 
              key={bossRoom}
              className={`absolute top-0 w-1 h-full z-10 ${roomNumber >= bossRoom ? 'bg-white/40' : 'bg-white/10'}`}
              style={{ left: `${bossRoom}%` }}
            />
          ))}
        </div>
      </div>

      {/* Header with Menu, Room, Shop/Bag, Money */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Menu Button - Left */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenMenu}
          className="bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-white/30 text-white p-2 md:p-3 rounded-lg transition-all"
          title="Torna al menù principale"
        >
          <Menu size={20} />
        </motion.button>

        {/* Stanza N - Center */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            Stanza {roomNumber}
          </h1>
        </div>

        {/* Shop, Bag, Money - Right */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenShop}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded-lg text-xs md:text-sm transition-all shadow-lg"
          >
            🛍️ Negozio
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBag(!showBag)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded-lg text-xs md:text-sm transition-all shadow-lg relative"
          >
            <Backpack size={16} className="inline mr-1" />
            {inventory.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {inventory.reduce((acc, item) => acc + item.count, 0)}
              </span>
            )}
          </motion.button>

          <div className="bg-slate-800 border border-white/10 px-2 md:px-3 py-1 md:py-2 rounded-lg text-right hidden xs:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Denaro</span>
            <div className="text-sm md:text-base font-mono font-bold">{money}$</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        {/* Squadra - Full width top, then left side */}
        <div className="md:col-span-3 bg-slate-800/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto">
          <h2 className="text-lg font-black uppercase flex items-center gap-2">
            <Users size={20} />
            La tua Squadra
          </h2>
          <div className="space-y-2">
            {party.map((pkmn, i) => (
              <motion.div
                key={pkmn.id + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  i === 0
                    ? 'bg-indigo-500/20 border-indigo-500/50'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-12 flex-shrink-0">
                  <PokemonSprite id={pkmn.id} name={pkmn.name} className="w-full h-full" />
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
                    <span className="text-xs text-slate-400">Lv. {pkmn.level}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        pkmn.currentHp > pkmn.maxHp * 0.5
                          ? 'bg-emerald-500'
                          : pkmn.currentHp > pkmn.maxHp * 0.2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(pkmn.currentHp / pkmn.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1 mt-1">
                    <span className="font-bold">{pkmn.currentHp} / {pkmn.maxHp} HP</span>
                    {pkmn.moves.map((m, idx) => (
                      <span key={m.id + idx} className="opacity-70">
                        {m.name}: {m.currentPp ?? m.pp}/{m.pp}
                      </span>
                    ))}
                  </div>
                </div>
                {showTeamManager && i > 0 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(i)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Sposta su"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Sposta giù"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions - Right Panel */}
        <div className="flex flex-col gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStartBattle}
            className="bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-4 px-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-xs shadow-lg"
          >
            <Play size={16} />
            Battaglia
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTeamManager(!showTeamManager)}
            className="bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black py-4 px-3 rounded-xl uppercase tracking-wider transition-all text-xs shadow-lg"
          >
            {showTeamManager ? 'Chiudi' : 'Gestisci'} Squadra
          </motion.button>
        </div>
      </div>

      {/* Bag Modal */}
      <AnimatePresence>
        {showBag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Backpack size={24} />
                Il tuo Zaino
              </h2>

              {inventory.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p>Il tuo zaino è vuoto!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory.map((invItem) => {
                    const itemData = ITEMS.find((i) => i.id === invItem.itemId);
                    if (!itemData) return null;
                    return (
                      <div
                        key={invItem.itemId}
                        className="bg-slate-900/50 border border-white/10 p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-white">{itemData.name}</h3>
                            <p className="text-xs text-slate-400">{itemData.description}</p>
                          </div>
                          <div className="text-lg font-bold bg-indigo-500/20 px-3 py-1 rounded">
                            x{invItem.count}
                          </div>
                        </div>
                        {selectedPokemonForItem !== null ? (
                          <button
                            onClick={() => {
                              handleUseItem(invItem.itemId, selectedPokemonForItem);
                              setSelectedPokemonForItem(null);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Usa su {party[selectedPokemonForItem]?.name}
                          </button>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {party.map((pkmn, i) => (
                              <button
                                key={pkmn.id + i}
                                onClick={() => setSelectedPokemonForItem(i)}
                                disabled={!isItemUsable(invItem.itemId, pkmn)}
                                className={`bg-slate-800 text-white font-bold py-1 px-2 rounded text-xs transition-colors ${
                                  isItemUsable(invItem.itemId, pkmn)
                                    ? 'hover:bg-indigo-600'
                                    : 'opacity-40 cursor-not-allowed'
                                }`}
                              >
                                {pkmn.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => {
                  setShowBag(false);
                  setSelectedPokemonForItem(null);
                }}
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Chiudi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Use Item Message */}
      <AnimatePresence>
        {useItemMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-6 right-6 z-40 bg-emerald-600 text-white p-4 rounded-2xl font-bold text-center"
          >
            {useItemMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
