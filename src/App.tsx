import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, BattlePokemon, GameState, SaveData, GameStats, Settings } from './types';
import MainMenu from './components/MainMenu';
import DraftScreen from './components/DraftScreen';
import TeamHub from './components/TeamHub';
import BattleEngine from './components/BattleEngine';
import ShopScreen from './components/ShopScreen';
import GameOverScreen from './components/GameOverScreen';
import { RotateCcw, Download, Loader2, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchPokemonData, fetchNewMove } from './api';
import { BOSS_ENCOUNTERS, ITEMS } from './constants';
import { getActualStats, updateStats } from './utils/battleMechanics';
import { Item, InventoryItem } from './types';
import { useGameSave } from './hooks/useGameSave';
import { useSoundEffects } from './hooks/useSoundEffects';
import Elite4App from './Elite4App';



const STATS_KEY = 'pkmrouge_stats';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [party, setParty] = useState<BattlePokemon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<BattlePokemon[]>([]);
  const [roomNumber, setRoomNumber] = useState(1);
  const [money, setMoney] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBossRoomActive, setIsBossRoomActive] = useState(false);
  const [pendingRecruit, setPendingRecruit] = useState<BattlePokemon | null>(null);
  const [pendingMove, setPendingMove] = useState<{ pokemonIndex: number, newMove: any } | null>(null);
  const [pendingNextRoom, setPendingNextRoom] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('pkmrouge_settings');
    return saved ? JSON.parse(saved) : { soundEnabled: true, musicEnabled: true };
  });
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem(STATS_KEY);
    return saved
      ? JSON.parse(saved)
      : { maxRoomReached: 0, mostUsedPokemonId: '', maxLevelAchieved: 0 };
  });

  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const tracks: Partial<Record<GameState, string>> = {
      MAIN_MENU: `${base}audio/pokemon_red_opening.mp3`,
      HUB: `${base}audio/pokemon_trap_mix.mp3`,
      SHOP: `${base}audio/pokemon_trap_mix.mp3`,
      RECRUITMENT: `${base}audio/pokemon_trap_mix.mp3`,
      LEARN_MOVE: `${base}audio/pokemon_trap_mix.mp3`,
      BATTLE: isBossRoomActive ? `${base}audio/team_galactic.mp3` : `${base}audio/pokemon_battle.mp3`,
    };

    const trackUrl = tracks[gameState];

    if (!settings.musicEnabled) {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      return;
    }

    if (!trackUrl) return;

    // Evita di riavviare lo stesso brano
    if (musicRef.current?.src.endsWith(trackUrl)) return;

    if (musicRef.current) {
      musicRef.current.pause();
    }

    const audio = new Audio(trackUrl);
    audio.loop = true;
    audio.volume = 0.3;
    musicRef.current = audio;
    audio.play().catch(e => console.log('Music play failed:', e));

  }, [gameState, settings.musicEnabled, isBossRoomActive]);

  // handle persistent storage and provide helpers
  const { hasSave, loadGame } = useGameSave({ party, roomNumber, money, inventory, gameState });
  
  // sound effects for UI interactions
  const { playSound } = useSoundEffects(settings.soundEnabled);

  const handleLoadGame = () => {
    playSound('click');
    const data = loadGame();
    if (data) {
      setParty(data.party);
      setRoomNumber(data.roomNumber);
      setMoney(data.money || 0);
      setInventory(data.inventory || []);
      // Converte qualsiasi stato a HUB quando si carica una partita salvata
      let nextState: GameState = 'HUB';
      setGameState(nextState);
    }
  };

  // Apply 30% healing to all pokemon after battle and reset stat stage modifiers
  const applyRest = (partyToRest: BattlePokemon[]): BattlePokemon[] => {
    return partyToRest.map(pkmn => ({
      ...pkmn,
      currentHp: Math.min(pkmn.maxHp, Math.ceil(pkmn.currentHp + pkmn.maxHp * 0.3)),
      // Reset stat stage modifiers (+1, +2, -1, -2) but keep status conditions (paralysis, poison, etc.)
      statStages: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
      moves: pkmn.moves.map(m => ({
        ...m,
        currentPp: Math.min(m.pp, (m.currentPp ?? m.pp) + 3)
        // +3 PP per mossa dopo ogni vittoria, mai sopra il massimo
      }))
    }));
  };

  // Update game stats after reaching a new room or level
  const updateGameStats = (newRoom: number, newMaxLevel: number) => {
    setGameStats(prev => {
      const updated = {
        ...prev,
        maxRoomReached: Math.max(prev.maxRoomReached, newRoom),
        maxLevelAchieved: Math.max(prev.maxLevelAchieved, newMaxLevel),
        mostUsedPokemonId: party[0]?.name || prev.mostUsedPokemonId
      };
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Swap two pokemon in the party
  const handleSwapPartyOrder = (index1: number, index2: number) => {
    const newParty = [...party];
    const temp = newParty[index1];
    newParty[index1] = newParty[index2];
    newParty[index2] = temp;
    setParty(newParty);
  };

  const getRecruitLevel = (): number => {
    const levels: Record<number, number> = {
      10: 50, 20: 55, 30: 60, 40: 65,
      50: 70, 60: 75, 70: 80, 80: 85,
      90: 90,
    };
    return levels[roomNumber -1] ?? 50;
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    playSound('click');
    const recruitLevel = gameState === 'RECRUITMENT' ? getRecruitLevel() : 50;
    const actualStats = getActualStats(pokemon.baseStats, recruitLevel);
    const newPokemon: BattlePokemon = {
      ...pokemon,
      actualStats,
      currentHp: actualStats.hp,
      maxHp: actualStats.hp,
      level: recruitLevel,
      status: null,
      statStages: {
        hp: 0,
        attack: 0,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0
      },
      moves: pokemon.moves.map(m => ({
        ...m,
        currentPp: m.pp
      }))
    };

    if (gameState === 'DRAFT') {
      setParty([newPokemon]);
      setGameState('HUB');
    } else if (gameState === 'RECRUITMENT') {
      if (party.length < 6) {
        setParty(prev => [...prev, newPokemon]);
        setGameState('HUB');
      } else {
        // Party is full, need to choose who to replace
        setPendingRecruit(newPokemon);
      }
    }
  };

  const handleReplace = (index: number) => {
    if (pendingRecruit) {
      const newParty = [...party];
      newParty[index] = pendingRecruit;
      setParty(newParty);
      setPendingRecruit(null);
      setGameState('HUB');
    }
  };

  const startBattle = async () => {
    setLoading(true);
    try {
      const isBossRoom = BOSS_ENCOUNTERS[roomNumber];
      const scalingFactor = Math.floor((roomNumber - 1) / 10);
      const enemyLevel = 50 + (scalingFactor * 5);
      
      let enemiesToFetch: number[] = [];
      
      if (isBossRoom) {
        const teamSize = Math.min(6, Math.floor(roomNumber / 10));
        enemiesToFetch = isBossRoom.slice(0, teamSize);
      } else {
        const enemyCount = roomNumber >= 91 ? 5
          : roomNumber >= 71 ? 4
          : roomNumber >= 51 ? 3
          : roomNumber >= 21 ? 2
          : 1;
        enemiesToFetch = Array.from({ length: enemyCount },
          () => Math.floor(Math.random() * 649) + 1
        );
      }

      const fetchedEnemies = await Promise.all(enemiesToFetch.map(async (id) => {
        const enemyData = await fetchPokemonData(id);
        const baseActualStats = getActualStats(enemyData.baseStats, enemyLevel);

        // Boss buffs must live on the instance created here (not recalculated on switches).
        const scalingFactor = Math.floor((roomNumber - 1) / 10);
        const bossHpMultiplier = isBossRoom ? (
          roomNumber >= 90 ? 1.60 :
          roomNumber >= 70 ? 1.56 :
          roomNumber >= 50 ? 1.54 :
          1.3 + Math.floor((roomNumber - 1) / 10) * 0.08
        ) : 1;

        const bossStatMultiplier = isBossRoom ? (
          roomNumber >= 90 ? 1.28 :
          roomNumber >= 70 ? 1.24 :
          roomNumber >= 50 ? 1.20 :
          1.08 + Math.floor((roomNumber - 1) / 10) * 0.04
        ) : 1;

        const actualStats = isBossRoom ? {
          ...baseActualStats,
          attack: Math.floor(baseActualStats.attack * bossStatMultiplier),
          defense: Math.floor(baseActualStats.defense * bossStatMultiplier),
          spAtk: Math.floor(baseActualStats.spAtk * bossStatMultiplier),
          spDef: Math.floor(baseActualStats.spDef * bossStatMultiplier),
          speed: Math.floor(baseActualStats.speed * bossStatMultiplier),
        } : baseActualStats;

        const maxHp = Math.floor(actualStats.hp * bossHpMultiplier);
        
        return {
          ...enemyData,
          actualStats,
          currentHp: maxHp,
          maxHp: maxHp,
          level: enemyLevel,
          status: null,
          statStages: {
            hp: 0,
            attack: 0,
            defense: 0,
            spAtk: 0,
            spDef: 0,
            speed: 0
          },
          moves: enemyData.moves.map(m => ({ ...m, currentPp: m.pp }))
        };
      }));

      setEnemyTeam(fetchedEnemies);
      setIsBossRoomActive(!!isBossRoom);
      setGameState('BATTLE');
    } catch (error) {
      console.error("Failed to start battle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (index: number) => {
    if (index === 0 || index >= party.length) return;
    if (party[index].currentHp <= 0) return;
    const newParty = [...party];
    const temp = newParty[0];
    newParty[0] = newParty[index];
    newParty[index] = temp;
    setParty(newParty);
  };

  const handleUpdatePartyMember = (index: number, updated: BattlePokemon) => {
    setParty(prev => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleBattleEnd = async (winner: 'player' | 'enemy') => {
    if (winner === 'player') {
      // Award money (and check if current floor is boss for bonus/recruitment)
      const isBossFloor = BOSS_ENCOUNTERS[roomNumber];
      setMoney(prev => prev + 50 + (isBossFloor ? 50 : 0));

      // Level Up & Heal Active Pokemon
      const updatedParty = [...party];
      let activePkmn = updatedParty[0];
      
      // Level Up
      const oldLevel = activePkmn.level;
      const newLevel = Math.min(100, oldLevel + 1);
      activePkmn = updateStats(activePkmn, newLevel);
      updatedParty[0] = activePkmn; // Assign the updated Pokémon back

      // Stanza 51+: level-up silenzioso a tutta la panchina
      if (roomNumber >= 51) {
        for (let i = 1; i < updatedParty.length; i++) {
          updatedParty[i] = updateStats(updatedParty[i], Math.min(100, updatedParty[i].level + 1));
        }
      }
      
      // Apply Rest (30% healing to all)
      const restedParty = applyRest(updatedParty);
      setParty(restedParty);

      // Update game stats
      const nextRoom = roomNumber + 1;
      updateGameStats(nextRoom, newLevel);

      // Move Learning every 5 levels (only when actually leveling up past a multiple of 5)
      if (newLevel % 5 === 0 && newLevel > oldLevel) {
        setLoading(true);
        try {
          const currentMoveIds = activePkmn.moves.map(m => m.id);
          const newMove = await fetchNewMove(activePkmn.id, currentMoveIds);
          if (newMove) {
            setPendingMove({ pokemonIndex: 0, newMove });
            setPendingNextRoom(nextRoom);
            setGameState('LEARN_MOVE');
            setLoading(false);
            return; // Wait for move choice
          }
        } catch (e) {
          console.error("Failed to learn new move", e);
        } finally {
          setLoading(false);
        }
      }

      if (nextRoom > 100) {
        setRoomNumber(nextRoom);
        setGameState('GAME_OVER'); // We'll use GAME_OVER state but with a victory message
        return;
      }
      setRoomNumber(nextRoom);

      // Check for Recruitment (Boss floors 10, 20, 30, 40, 50, or every boss after 60)
      if (isBossFloor) {
        setGameState('RECRUITMENT');
      } else {
        setGameState('HUB');
      }
    } else {
      setGameState('GAME_OVER');
    }
  };

  const handleLearnMove = (replaceIndex: number | null) => {
    if (!pendingMove) return;

    if (replaceIndex !== null) {
      const updatedParty = [...party];
      const pkmn = { ...updatedParty[pendingMove.pokemonIndex] };
      const newMoves = [...pkmn.moves];
      newMoves[replaceIndex] = pendingMove.newMove;
      pkmn.moves = newMoves;
      updatedParty[pendingMove.pokemonIndex] = pkmn;
      setParty(updatedParty);
    }

    setPendingMove(null);

    const roomToSet = pendingNextRoom ?? roomNumber + 1;
    setPendingNextRoom(null);

    if (roomToSet > 100) {
      setGameState('GAME_OVER');
      return;
    }
    setRoomNumber(roomToSet);

    const isBossFloor = BOSS_ENCOUNTERS[roomToSet - 1];
    if (isBossFloor) {
      setGameState('RECRUITMENT');
    } else {
      setGameState('HUB');
    }
  };

  const restartGame = () => {
    setGameState('MAIN_MENU');
    setRoomNumber(1);
    setMoney(100);
    setInventory([]);
    setParty([]);
    setEnemyTeam([]);
    setPendingRecruit(null);
  };

  const handleStartGame = () => {
    playSound('click');
    setGameState('DRAFT');
    setRoomNumber(1);
    setMoney(100);
    setInventory([]);
    setParty([]);
    setEnemyTeam([]);
  };

  const handleBuyItem = (item: Item) => {
    setMoney(prev => prev - item.price);
    setInventory(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, count: i.count + 1 } : i);
      }
      return [...prev, { itemId: item.id, count: 1 }];
    });
  };

  const handleUseItem = (itemId: string, pokemonIndex: number): string => {
    if (itemId === 'mt-random') {
      const targetPkmn = party[pokemonIndex];
      setLoading(true);
      fetchNewMove(targetPkmn.id, targetPkmn.moves.map(m => m.id)).then(newMove => {
        if (newMove) {
          setPendingMove({ pokemonIndex, newMove });
          setPendingNextRoom(null);
          setGameState('LEARN_MOVE');
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
    if (!item) return "Strumento non trovato.";

    const targetPkmn = party[pokemonIndex];
    const { updatedPokemon, message } = item.effect(targetPkmn);

    if (updatedPokemon === targetPkmn) return message; // Effect didn't apply

    // Update party
    const newParty = [...party];
    newParty[pokemonIndex] = updatedPokemon;
    setParty(newParty);

    // Update inventory
    setInventory(prev => {
      return prev.map(i => i.itemId === itemId ? { ...i, count: i.count - 1 } : i)
        .filter(i => i.count > 0);
    });

    return message;
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-950">
      {/* orientation warning for landscape mode */}
      <div className="landscape-warning hidden fixed inset-0 bg-black/80 text-white flex items-center justify-center text-xl font-bold z-50">
        Ruota il dispositivo in verticale per continuare
      </div>
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <p className="font-bold tracking-widest uppercase text-sm">Preparazione Battaglia...</p>
        </div>
      )}

      {/* Bottone audio fisso */}
      <button
        onClick={() => {
          const newValue = !(settings.soundEnabled && settings.musicEnabled);
          const next = { ...settings, soundEnabled: newValue, musicEnabled: newValue };
          setSettings(next);
          localStorage.setItem('pkmrouge_settings', JSON.stringify(next));
          if (!newValue) {
            musicRef.current?.pause();
          } else {
            musicRef.current?.play().catch(() => {});
          }
        }}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-[200] bg-slate-800/80 backdrop-blur-sm border border-white/10 text-white p-2 rounded-full shadow-lg"
      >
        {settings.soundEnabled && settings.musicEnabled
          ? <Volume2 size={18} />
          : <VolumeX size={18} />
        }
      </button>

      {gameState === 'MAIN_MENU' && (
        <MainMenu 
          onStart={handleStartGame}
          onLoadGame={handleLoadGame}
          hasSave={hasSave}
          onStartElite4={() => { playSound('click'); setGameState('ELITE4'); }}
        />
      )}

      {gameState === 'DRAFT' && (
        <div className="relative h-full">
          <DraftScreen onSelect={handlePokemonSelect} />
        </div>
      )}

      {gameState === 'HUB' && (
        <TeamHub
          party={party}
          inventory={inventory}
          roomNumber={roomNumber}
          money={money}
          onStartBattle={startBattle}
          onSwapPartyOrder={handleSwapPartyOrder}
          onUseItem={handleUseItem}
          onOpenShop={() => setGameState('SHOP')}
          onOpenMenu={() => setGameState('MAIN_MENU')}
        />
      )}

      {gameState === 'SHOP' && (
        <ShopScreen 
          money={money}
          roomNumber={roomNumber}
          onBuy={handleBuyItem} 
          onExit={() => setGameState('HUB')}
          playSound={playSound}
        />
      )}

      {gameState === 'RECRUITMENT' && (
        <DraftScreen 
          onSelect={handlePokemonSelect} 
          title="Nuovo Reclutamento" 
          subtitle={`Hai sconfitto il Boss! Scegli un nuovo membro per il tuo party.`}
        />
      )}

      {pendingRecruit && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Party Pieno!</h2>
          <p className="text-slate-400 mb-8">Scegli chi sostituire con {pendingRecruit.name}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {party.map((pkmn, i) => (
              <button
                key={pkmn.id + i}
                onClick={() => handleReplace(i)}
                className="bg-slate-900 border border-white/10 p-4 rounded-2xl hover:bg-rose-900/40 hover:border-rose-500/50 transition-all group"
              >
                <div className="text-xs text-slate-500 mb-1">Slot {i + 1}</div>
                <div className="font-bold text-white group-hover:text-rose-200">{pkmn.name}</div>
                <div className="text-[10px] text-slate-400">Lv. {pkmn.level}</div>
              </button>
            ))}
          </div>
          <button 
            onClick={() => { setPendingRecruit(null); setGameState('HUB'); }}
            className="mt-8 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest"
          >
            Annulla Reclutamento
          </button>
        </div>
      )}

      {gameState === 'BATTLE' && party.length > 0 && enemyTeam.length > 0 && (
        <div className="absolute inset-0">
          <BattleEngine 
            playerPokemon={party[0]} 
            enemyTeam={enemyTeam} 
            party={party}
            inventory={inventory}
            isBoss={isBossRoomActive}
            soundEnabled={settings.soundEnabled}
            onBattleEnd={handleBattleEnd} 
            onSwitch={handleSwitch}
            onUpdatePartyMember={handleUpdatePartyMember}
            onUseItem={handleUseItem}
          />
        </div>
      )}

      {gameState === 'LEARN_MOVE' && pendingMove && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 pb-10 max-h-[100dvh] overflow-y-auto custom-scrollbar text-white">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-2xl w-full flex flex-col items-center"
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-2 uppercase italic tracking-tighter">Nuova Mossa!</h2>
            <p className="text-slate-400 mb-6">
              {party[pendingMove.pokemonIndex].name} vuole imparare <span className="text-indigo-400 font-bold">{pendingMove.newMove.name}</span>.
              Scegli quale mossa dimenticare.
            </p>

            <div className="bg-indigo-600/10 border border-indigo-500/30 p-4 sm:p-6 rounded-3xl mb-6 flex flex-col items-center w-full">
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Nuova Mossa</div>
              <div className="text-xl sm:text-2xl font-black uppercase">{pendingMove.newMove.name}</div>
              <div className="flex gap-3 sm:gap-4 mt-2 text-xs sm:text-sm opacity-70 font-mono">
                <span>TIPO: {pendingMove.newMove.type}</span>
                <span>PWR: {pendingMove.newMove.power}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
              {party[pendingMove.pokemonIndex].moves.map((move, i) => (
                <button
                  key={move.id + i}
                  onClick={() => handleLearnMove(i)}
                  className="bg-slate-900 border border-white/10 py-2 px-3 sm:p-5 rounded-2xl hover:bg-slate-800 hover:border-white/30 transition-all text-left group active:border-indigo-400 active:ring-2 active:ring-indigo-400"
                >
                  <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Slot {i + 1}</div>
                  <div className="font-bold text-lg sm:text-xl group-hover:text-indigo-300 transition-colors">{move.name}</div>
                  <div className="flex gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs opacity-50 font-mono">
                    <span>{move.type}</span>
                    <span>PWR: {move.power}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleLearnMove(null)}
              className="mt-6 mb-6 text-slate-500 hover:text-rose-400 text-sm font-bold uppercase tracking-widest transition-colors sticky bottom-0"
            >
              Non imparare {pendingMove.newMove.name}
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverScreen
          won={roomNumber > 100}
          roomNumber={roomNumber}
          party={party}
          runStats={gameStats}
          onRestart={restartGame}
        />
      )}

      {gameState === 'ELITE4' && (
        <Elite4App
          onExit={() => setGameState('MAIN_MENU')}
          soundEnabled={settings.soundEnabled}
        />
      )}
    </div>
  );
}
