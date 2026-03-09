import React from 'react';
import { Swords, Map as MapIcon, Trophy, Skull } from 'lucide-react';
import { motion } from 'motion/react';

interface RoomNavigationProps {
  roomNumber: number;
  onEnterBattle: () => void;
}

export default function RoomNavigation({ roomNumber, onEnterBattle }: RoomNavigationProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1 rounded-full text-indigo-400 text-sm font-bold mb-4">
          <MapIcon size={14} />
          STANZA {roomNumber}
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter">Cosa vuoi fare?</h1>
      </div>

      <div className="flex justify-center w-full max-w-3xl">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnterBattle}
          className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-3xl flex flex-col items-center gap-6 hover:bg-rose-500/20 transition-all group w-full max-w-md"
        >
          <div className="w-20 h-20 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/40 group-hover:rotate-12 transition-transform">
            <Swords size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Combatti Allenatore</h3>
            <p className="text-slate-400">Affronta un nemico casuale per progredire</p>
          </div>
        </motion.button>
      </div>

      <div className="mt-12 flex items-center gap-8 text-slate-500">
        <div className="flex flex-col items-center gap-1">
          <Skull size={20} />
          <span className="text-[10px] font-bold uppercase">Boss al piano 10</span>
        </div>
      </div>
    </div>
  );
}
