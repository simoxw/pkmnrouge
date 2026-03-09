import React, { useState, useEffect } from 'react';
import { Pokemon, BattlePokemon, GameState, SaveData } from './types';
import DraftScreen from './components/DraftScreen';
import RoomNavigation from './components/RoomNavigation';
import BattleEngine from './components/BattleEngine';
import ShopScreen from './components/ShopScreen';
import { RotateCcw, Download, Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchPokemonData, fetchNewMove } from './api';
import { BOSS_ENCOUNTERS, ITEMS } from './constants';
import { getActualStats, updateStats } from './utils/battleMechanics';
import { Item, InventoryItem } from './types';
import { useGameSave } from './hooks/useGameSave';
import { useSoundEffects } from './hooks/useSoundEffects';



export default function App() {
  const [gameState, setGameState] = useState<GameState>('DRAFT');
  const [party, setParty] = useState<BattlePokemon[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<BattlePokemon[]>([]);
  const [roomNumber, setRoomNumber] = useState(1);
  const [money, setMoney] = useState(100); // Start with 100 money
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingRecruit, setPendingRecruit] = useState<BattlePokemon | null>(null);
  const [pendingMove, setPendingMove] = useState<{ pokemonIndex: number, newMove: any } | null>(null);

  // handle persistent storage and provide helpers
  const { hasSave, loadGame } = useGameSave({ party, roomNumber, money, inventory, gameState });
  
  // sound effects for UI interactions
  const { playSound } = useSoundEffects(true);

  const handleLoadGame = () => {
    playSound('click');
    const data = loadGame();
    if (data) {
      setParty(data.party);
      setRoomNumber(data.roomNumber);
      setMoney(data.money || 0);
      setInventory(data.inventory || []);
      setGameState(data.gameState === 'BATTLE' ? 'NAVIGATION' : data.gameState);
    }
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    playSound('click');
    const actualStats = getActualStats(pokemon.baseStats);
    const newPokemon: BattlePokemon = {
      ...pokemon,
      actualStats,
      currentHp: actualStats.hp,
      maxHp: actualStats.hp,
      level: 50,
      status: null
    };

    if (gameState === 'DRAFT') {
      setParty([newPokemon]);
      setGameState('NAVIGATION');
    } else if (gameState === 'RECRUITMENT') {
      if (party.length < 6) {
        setParty(prev => [...prev, newPokemon]);
        setGameState('NAVIGATION');
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
      setGameState('NAVIGATION');
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
        // Boss team size: 1 at room 10, 2 at room 20, ..., 6 at room 60+
        const teamSize = Math.min(6, Math.floor(roomNumber / 10));
        
        // Pick 'teamSize' random IDs from the boss encounter list for this room
        for (let i = 0; i < teamSize; i++) {
          enemiesToFetch.push(isBossRoom[Math.floor(Math.random() * isBossRoom.length)]);
        }
      } else {
        enemiesToFetch = [Math.floor(Math.random() * 493) + 1];
      }

      const fetchedEnemies = await Promise.all(enemiesToFetch.map(async (id) => {
        const enemyData = await fetchPokemonData(id);
        const actualStats = getActualStats(enemyData.baseStats, enemyLevel);
        const hpMultiplier = isBossRoom ? 1.5 : 1;
        const maxHp = Math.floor(actualStats.hp * hpMultiplier);
        
        return {
          ...enemyData,
          actualStats,
          currentHp: maxHp,
          maxHp: maxHp,
          level: enemyLevel,
          status: null
        };
      }));

      setEnemyTeam(fetchedEnemies);
      setGameState('BATTLE');
    } catch (error) {
      console.error("Failed to start battle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (index: number) => {
    if (index === 0 || index >= party.length) return;
    const newParty = [...party];
    const temp = newParty[0];
    newParty[0] = newParty[index];
    newParty[index] = temp;
    setParty(newParty);
  };

  const handleBattleEnd = async (winner: 'player' | 'enemy') => {
    if (winner === 'player') {
      // Award money
      setMoney(prev => prev + 100);

      // Level Up & Heal Active Pokemon
      const updatedParty = [...party];
      let activePkmn = updatedParty[0];
      
      // Level Up
      const oldLevel = activePkmn.level;
      const newLevel = oldLevel + 1;
      activePkmn = updateStats(activePkmn, newLevel);
      
      // Heal 30%
      const healAmount = Math.floor(activePkmn.maxHp * 0.3);
      activePkmn.currentHp = Math.min(activePkmn.maxHp, activePkmn.currentHp + healAmount);
      
      updatedParty[0] = activePkmn;
      setParty(updatedParty);

      // Move Learning every 5 levels
      if (newLevel % 5 === 0) {
        setLoading(true);
        try {
          const currentMoveIds = activePkmn.moves.map(m => m.id);
          const newMove = await fetchNewMove(activePkmn.id, currentMoveIds);
          if (newMove) {
            setPendingMove({ pokemonIndex: 0, newMove });
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

      const nextRoom = roomNumber + 1;
      if (nextRoom > 100) {
        setGameState('GAME_OVER'); // We'll use GAME_OVER state but with a victory message
        return;
      }
      setRoomNumber(nextRoom);

      // Check for Recruitment (Boss floors 10, 20, 30, 40, 50, or every boss after 60)
      const isBossFloor = BOSS_ENCOUNTERS[roomNumber];
      if (isBossFloor && (roomNumber <= 50 || roomNumber >= 60)) {
        setGameState('RECRUITMENT');
      } else {
        setGameState('NAVIGATION');
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
    
    // Continue to next state
    const nextRoom = roomNumber + 1;
    if (nextRoom > 100) {
      setGameState('GAME_OVER');
      return;
    }
    setRoomNumber(nextRoom);
    
    const isBossFloor = BOSS_ENCOUNTERS[roomNumber];
    if (isBossFloor && (roomNumber <= 50 || roomNumber >= 60)) {
      setGameState('RECRUITMENT');
    } else {
      setGameState('NAVIGATION');
    }
  };

  const restartGame = () => {
    setGameState('DRAFT');
    setRoomNumber(1);
    setMoney(100);
    setInventory([]);
    setParty([]);
    setEnemyTeam([]);
    setPendingRecruit(null);
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
      <div className="orientation-warning hidden fixed inset-0 bg-black/80 text-white flex items-center justify-center text-xl font-bold z-50">
        Ruota il dispositivo in verticale per continuare
      </div>
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <p className="font-bold tracking-widest uppercase text-sm">Preparazione Battaglia...</p>
        </div>
      )}

      {gameState === 'DRAFT' && (
        <div className="relative h-full">
          {hasSave && (
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={handleLoadGame}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
              >
                <Download size={18} />
                Carica Partita
              </button>
            </div>
          )}
          <DraftScreen onSelect={handlePokemonSelect} />
        </div>
      )}

      {gameState === 'NAVIGATION' && (
        <div className="h-full flex flex-col">
          <div className="absolute top-6 right-6 z-50 flex gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl shadow-lg">
              <ShoppingBag className="text-indigo-400" size={18} />
              <span className="font-bold text-white font-mono">{money} $</span>
            </div>
            <button
              onClick={() => setGameState('SHOP')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95"
            >
              Negozio
            </button>
          </div>
          <RoomNavigation 
            roomNumber={roomNumber} 
            onEnterBattle={startBattle} 
          />
        </div>
      )}

      {gameState === 'SHOP' && (
        <ShopScreen 
          money={money} 
          onBuy={handleBuyItem} 
          onExit={() => setGameState('NAVIGATION')} 
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
            onClick={() => { setPendingRecruit(null); setGameState('NAVIGATION'); }}
            className="mt-8 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest"
          >
            Annulla Reclutamento
          </button>
        </div>
      )}

      {gameState === 'BATTLE' && party.length > 0 && enemyTeam.length > 0 && (
        <BattleEngine 
          playerPokemon={party[0]} 
          enemyTeam={enemyTeam} 
          party={party}
          inventory={inventory}
          onBattleEnd={handleBattleEnd} 
          onSwitch={handleSwitch}
          onUseItem={handleUseItem}
        />
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
        <div className="h-full bg-slate-950 text-white flex flex-col items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            {roomNumber > 100 ? (
              <>
                <h1 className="text-6xl font-black text-emerald-500 mb-4 italic uppercase">VITTORIA!</h1>
                <p className="text-slate-400 mb-8">Hai completato la scalata delle 100 stanze! Sei il Campione!</p>
              </>
            ) : (
              <>
                <h1 className="text-6xl font-black text-rose-500 mb-4">GAME OVER</h1>
                <p className="text-slate-400 mb-8">Sei arrivato alla stanza {roomNumber}</p>
              </>
            )}
            <button 
              onClick={restartGame}
              className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors mx-auto"
            >
              <RotateCcw size={20} />
              {roomNumber > 100 ? 'Nuova Scalata' : 'Riprova'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
