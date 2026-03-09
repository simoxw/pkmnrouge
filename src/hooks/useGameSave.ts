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
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      setHasSave(true);
    }

    if (gameState === 'GAME_OVER') {
      localStorage.removeItem(SAVE_KEY);
      setHasSave(false);
    }
  }, [gameState, party, roomNumber, money, inventory]);

  const loadGame = (): SaveData | null => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData) as SaveData;
      } catch (err) {
        console.error('Save load error', err);
        localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
      }
    }
    return null;
  };

  return { hasSave, loadGame };
}
