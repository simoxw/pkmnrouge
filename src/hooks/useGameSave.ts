import { useState, useEffect } from 'react';
import { GameState, BattlePokemon, InventoryItem, SaveData } from '../types';

const SAVE_KEY = 'poke_rogue_save';

interface Params {
  party: BattlePokemon[];
  roomNumber: number;
  money: number;
  inventory: InventoryItem[];
  gameState: GameState;
}

export function useGameSave({ party, roomNumber, money, inventory, gameState }: Params) {
  const [hasSave, setHasSave] = useState(false);

  // check for existing save on mount
  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) setHasSave(true);
  }, []);

  // auto‑save whenever relevant state changes
  useEffect(() => {
    if (gameState !== 'DRAFT' && gameState !== 'GAME_OVER' && party.length > 0) {
      const saveData: SaveData = {
        gameState,
        party,
        roomNumber,
        money,
        inventory,
        timestamp: Date.now(),
      };
      console.log(`💾 Salvataggio partita - State: ${gameState}, Room: ${roomNumber}, Party: ${party.length}`);
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      setHasSave(true);
    }

    if (gameState === 'GAME_OVER') {
      console.log('🗑️ Gioco finito - Salvataggio rimosso');
      localStorage.removeItem(SAVE_KEY);
      setHasSave(false);
    }
  }, [gameState, party, roomNumber, money, inventory]);

  const loadGame = (): SaveData | null => {
    const savedData = localStorage.getItem(SAVE_KEY);
    console.log('📂 SAVE_KEY:', SAVE_KEY);
    console.log('📂 Dati dal localStorage:', savedData ? savedData.substring(0, 100) + '...' : 'NULL');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as SaveData;
        console.log('✅ Salvataggio parsato con successo');
        return parsed;
      } catch (err) {
        console.error('❌ Errore nel parsing del salvataggio:', err);
        localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
      }
    } else {
      console.warn('⚠️ Nessun salvataggio trovato nel localStorage con chiave:', SAVE_KEY);
    }
    return null;
  };

  return { hasSave, loadGame };
}
