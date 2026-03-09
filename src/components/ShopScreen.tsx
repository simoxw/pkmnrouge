import React, { useState, useEffect } from 'react';
import { Item, InventoryItem } from '../types';
import { ITEMS } from '../constants';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, ArrowLeft, Check } from 'lucide-react';

interface ShopScreenProps {
  money: number;
  onBuy: (item: Item) => void;
  onExit: () => void;
}

export default function ShopScreen({ money, onBuy, onExit }: ShopScreenProps) {
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Select 4 random items for the shop
    const shuffled = [...ITEMS].sort(() => 0.5 - Math.random());
    setShopItems(shuffled.slice(0, 4));
  }, []);

  const handleBuy = (item: Item) => {
    if (money >= item.price) {
      onBuy(item);
      setPurchaseFeedback(`Hai comprato ${item.name}!`);
      setTimeout(() => setPurchaseFeedback(null), 2000);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col p-6 text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-sm">Torna Indietro</span>
        </button>
        
        <div className="flex items-center gap-3 bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
          <Coins className="text-amber-400" size={20} />
          <span className="text-xl font-black font-mono">{money} $</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Pokémon Market</h1>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Rifornisci il tuo zaino prima della prossima sfida</p>
        </div>

        {purchaseFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold"
          >
            <Check size={18} />
            {purchaseFeedback}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shopItems.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black uppercase group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                  <div className="bg-slate-800 px-3 py-1 rounded-full text-amber-400 font-bold font-mono border border-white/5">
                    {item.price} $
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{item.description}</p>
              </div>

              <button
                onClick={() => handleBuy(item)}
                disabled={money < item.price}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                  ${money >= item.price 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
              >
                <ShoppingBag size={18} />
                {money >= item.price ? 'Acquista' : 'Fondi Insufficienti'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl text-center">
          <p className="text-slate-500 text-sm italic">"Benvenuto! Abbiamo tutto ciò che serve per un allenatore in viaggio."</p>
        </div>
      </div>
    </div>
  );
}
