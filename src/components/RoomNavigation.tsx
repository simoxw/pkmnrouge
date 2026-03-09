import React from 'react';
import { Swords, Map as MapIcon, Trophy, Skull } from 'lucide-react';
import { motion } from 'motion/react';

interface RoomNavigationProps {
  roomNumber: number;
  onEnterBattle: () => void;
}

export default function RoomNavigation({ roomNumber, onEnterBattle }: RoomNavigationProps) {
  const nextBossRoom = Math.ceil(roomNumber / 10) * 10;
  const progress = ((roomNumber % 10) || 10) / 10;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      {/* Visual Progression Map */}
      <div className="w-full max-w-3xl mb-12">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Progressione Scalata</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Prossimo Boss: Stanza {nextBossRoom}</span>
        </div>
        <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
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
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[9px] font-mono text-slate-600">0</span>
          <div className="flex gap-4">
            {[25, 50, 75].map(p => (
              <span key={p} className="text-[9px] font-mono text-slate-600">{p}</span>
            ))}
          </div>
          <span className="text-[9px] font-mono text-slate-600 text-rose-500 font-bold">100</span>
        </div>
      </div>

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
        {/* Map legend or other info could go here */}
      </div>
    </div>
  );
}
