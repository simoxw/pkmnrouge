import React, { useState, useEffect } from 'react';
import { GameStats, Settings } from '../types';
import { motion } from 'motion/react';
import { User, Volume2, VolumeX, Music, SkipForward, Shield } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onLoadGame: () => void;
  hasSave: boolean;
}

export default function MainMenu({ onStart, onLoadGame, hasSave }: MainMenuProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('pkmrouge_settings');
    return saved ? JSON.parse(saved) : { soundEnabled: true, musicEnabled: true };
  });

  useEffect(() => {
    const stats = localStorage.getItem('pkmrouge_stats');
    if (stats) {
      setGameStats(JSON.parse(stats));
    }
  }, []);

  const handleSettingsChange = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('pkmrouge_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full opacity-10 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-black italic text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text mb-2 uppercase tracking-tighter">
            Pokémon Rouge
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Modals */}
        {showProfile && gameStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl"
          >
            <div className="bg-slate-800 border border-white/10 p-8 rounded-3xl max-w-md w-full">
              <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-2">
                <User size={24} />
                Il tuo Profilo
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-indigo-500/30">
                  <div className="text-xs text-indigo-400 uppercase font-bold mb-1">Stanza Massima</div>
                  <div className="text-2xl font-black text-white">{gameStats.maxRoomReached || 0}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-purple-500/30">
                  <div className="text-xs text-purple-400 uppercase font-bold mb-1">Livello Massimo</div>
                  <div className="text-2xl font-black text-white">{gameStats.maxLevelAchieved || 0}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400 uppercase font-bold mb-3">Medaglie</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { room: 10, color: '#ef4444' },
                      { room: 20, color: '#f97316' },
                      { room: 30, color: '#eab308' },
                      { room: 40, color: '#22c55e' },
                      { room: 50, color: '#06b6d4' },
                      { room: 60, color: '#3b82f6' },
                      { room: 70, color: '#8b5cf6' },
                      { room: 80, color: '#ec4899' },
                    ].map(({ room, color }, i) => {
                      const earned = gameStats.maxRoomReached >= room;
                      return (
                        <div key={room} title={`Medaglia ${i+1} — Boss stanza ${room}`}
                          className="flex flex-col items-center gap-0.5">
                          <Shield
                            size={28}
                            color={earned ? color : '#334155'}
                            fill={earned ? color + '33' : 'transparent'}
                            strokeWidth={2}
                          />
                          <span className="text-[8px] font-bold" style={{ color: earned ? color : '#475569' }}>
                            {i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {gameStats.maxRoomReached >= 90 && (
                    <div className="mt-3 text-xs font-bold text-yellow-300 flex items-center gap-1">🏆 Campione della Lega</div>
                  )}
                  {gameStats.maxRoomReached >= 100 && (
                    <div className="mt-1 text-xs font-bold text-yellow-400 flex items-center gap-1">⭐ Pokémon Master</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Chiudi
              </button>
            </div>
          </motion.div>
        )}

        {showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl"
          >
            <div className="bg-slate-800 border border-white/10 p-8 rounded-3xl max-w-md w-full">
              <h2 className="text-2xl font-black text-white mb-6 uppercase">Opzioni</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-indigo-400" />
                    <span className="font-bold text-white">Suoni</span>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('soundEnabled', !settings.soundEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Music size={20} className="text-purple-400" />
                    <span className="font-bold text-white">Musica</span>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('musicEnabled', !settings.musicEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      settings.musicEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.musicEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Chiudi
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Buttons */}
        <div className="w-full space-y-4 mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onStart}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
          >
            Nuova Partita
          </motion.button>

          {hasSave && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onLoadGame}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
            >
              Carica Partita
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowProfile(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <User size={20} />
            Profilo
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            disabled
            className="w-full bg-slate-700 text-slate-400 font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider cursor-not-allowed opacity-50"
          >
            Modalità Online
            <div className="inline-block ml-2 text-xs font-bold">Prossimamente</div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => setShowOptions(true)}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
          >
            Opzioni
          </motion.button>
        </div>
      </div>
    </div>
  );
}
