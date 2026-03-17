import React, { useMemo } from 'react';
import { Item } from '../types';
import { ITEMS } from '../constants';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface Elite4ShopScreenProps {
  money: number;
  onBuy: (item: Item) => void;
  onExit: () => void;
}

export default function Elite4ShopScreen({ money, onBuy, onExit }: Elite4ShopScreenProps) {
  const shopItems = useMemo(() => {
    const itemIds = ['potion', 'super_potion', 'hyper_potion', 'full_heal', 'full_restore', 'revive', 'ether', 'elixir', 'max_elixir', 'mt-random'];
    return itemIds
      .map(id => ITEMS.find(item => item.id === id))
      .filter((item): item is Item => item !== undefined);
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header fisso */}
      <div className="flex-shrink-0 bg-amber-900/30 border-b border-amber-500/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-amber-400 flex items-center gap-2">
            <ShoppingBag size={24} />
            Negozio Elite 4
          </h1>
          <div className="text-right">
            <div className="text-xs text-amber-200 uppercase tracking-wide font-bold">Denaro</div>
            <div className="text-xl font-black text-amber-300">{money}$</div>
          </div>
        </div>
      </div>

      {/* Griglia scrollabile */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopItems.map((item) => {
            const canBuy = money >= item.price;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 hover:border-amber-500/50 transition-colors"
              >
                {/* Nome e prezzo */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-lg text-amber-300">{item.name}</h3>
                    <p className="text-sm text-amber-200/70">{item.description}</p>
                  </div>
                </div>

                {/* Prezzo */}
                <div className="text-sm font-bold text-amber-400">
                  Prezzo: <span className="text-amber-300">{item.price}$</span>
                </div>

                {/* Bottone Acquista */}
                <motion.button
                  whileTap={{ scale: canBuy ? 0.95 : 1 }}
                  onClick={() => canBuy && onBuy(item)}
                  disabled={!canBuy}
                  className={`w-full font-black uppercase tracking-wider py-3 px-4 rounded-xl transition-all ${
                    canBuy
                      ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {canBuy ? '💰 Acquista' : 'Fondi insufficienti'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer fisso */}
      <div className="flex-shrink-0 border-t border-amber-500/30 p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Torna all'Hub
        </motion.button>
      </div>
    </div>
  );
}