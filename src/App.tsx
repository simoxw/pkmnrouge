import React, { useState, useEffect } from 'react';
import { Pokemon, BattlePokemon, GameState, SaveData } from './types';
import DraftScreen from './components/DraftScreen';
import RoomNavigation from './components/RoomNavigation';
import BattleEngine from './components/BattleEngine';
import { RotateCcw, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchPokemonData, fetchNewMove } from './api';
import { BOSS_ENCOUNTERS } from './constants';
import { getActualStats, updateStats } from './battle';

const SAVE_KEY = 'poke_rogue_save';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('DRAFT');
  const [party, setParty] = useState<BattlePokemon[]>([]);
  const [enemyPokemon, setEnemyPokemon] = useState<BattlePokemon | null>(null);
  const [roomNumber, setRoomNumber] = useState(1);
  const [hasSave, setHasSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingRecruit, setPendingRecruit] = useState<BattlePokemon | null>(null);
  const [pendingMove, setPendingMove] = useState<{ pokemonIndex: number, newMove: any } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      setHasSave(true);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'DRAFT' && gameState !== 'GAME_OVER' && party.length > 0) {
      const saveData: SaveData = {
        gameState,
        party,
        roomNumber,
        timestamp: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      setHasSave(true);
    }
    
    if (gameState === 'GAME_OVER') {
      localStorage.removeItem(SAVE_KEY);
      setHasSave(false);
    }
  }, [gameState, party, roomNumber]);

  const loadGame = () => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const data: SaveData = JSON.parse(savedData);
        setParty(data.party);
        setRoomNumber(data.roomNumber);
        setGameState(data.gameState === 'BATTLE' ? 'NAVIGATION' : data.gameState);
      } catch (e) {
        console.error("Save load error", e);
        localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
      }
    }
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
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
      let enemyId: number;
      const isBossRoom = BOSS_ENCOUNTERS[roomNumber];
      
      if (isBossRoom) {
        enemyId = isBossRoom[Math.floor(Math.random() * isBossRoom.length)];
      } else {
        enemyId = Math.floor(Math.random() * 493) + 1;
      }

      const enemyData = await fetchPokemonData(enemyId);
      const actualStats = getActualStats(enemyData.baseStats);
      
      // Boss have a multiplier on HP
      const hpMultiplier = isBossRoom ? 1.5 : 1;
      const maxHp = Math.floor(actualStats.hp * hpMultiplier);

      setEnemyPokemon({
        ...enemyData,
        actualStats,
        currentHp: maxHp,
        maxHp: maxHp,
        status: null
      });
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
    setParty([]);
    setEnemyPokemon(null);
    setPendingRecruit(null);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-950">
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
                onClick={loadGame}
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
        <RoomNavigation 
          roomNumber={roomNumber} 
          onEnterBattle={startBattle} 
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

      {gameState === 'BATTLE' && party.length > 0 && enemyPokemon && (
        <BattleEngine 
          playerPokemon={party[0]} 
          enemyPokemon={enemyPokemon} 
          party={party}
          onBattleEnd={handleBattleEnd} 
          onSwitch={handleSwitch}
        />
      )}

      {gameState === 'LEARN_MOVE' && pendingMove && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-2xl w-full"
          >
            <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Nuova Mossa!</h2>
            <p className="text-slate-400 mb-8">
              {party[pendingMove.pokemonIndex].name} vuole imparare <span className="text-indigo-400 font-bold">{pendingMove.newMove.name}</span>.
              Scegli quale mossa dimenticare.
            </p>

            <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-3xl mb-8 flex flex-col items-center">
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Nuova Mossa</div>
              <div className="text-2xl font-black uppercase">{pendingMove.newMove.name}</div>
              <div className="flex gap-4 mt-2 text-sm opacity-70 font-mono">
                <span>TIPO: {pendingMove.newMove.type}</span>
                <span>PWR: {pendingMove.newMove.power}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {party[pendingMove.pokemonIndex].moves.map((move, i) => (
                <button
                  key={move.id + i}
                  onClick={() => handleLearnMove(i)}
                  className="bg-slate-900 border border-white/10 p-5 rounded-2xl hover:bg-slate-800 hover:border-white/30 transition-all text-left group"
                >
                  <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Slot {i + 1}</div>
                  <div className="font-bold text-lg group-hover:text-indigo-300 transition-colors">{move.name}</div>
                  <div className="flex gap-3 mt-1 text-xs opacity-50 font-mono">
                    <span>{move.type}</span>
                    <span>PWR: {move.power}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleLearnMove(null)}
              className="mt-10 text-slate-500 hover:text-rose-400 text-sm font-bold uppercase tracking-widest transition-colors"
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
            <h1 className="text-6xl font-black text-rose-500 mb-4">GAME OVER</h1>
            <p className="text-slate-400 mb-8">Sei arrivato alla stanza {roomNumber}</p>
            <button 
              onClick={restartGame}
              className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={20} />
              Riprova
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
