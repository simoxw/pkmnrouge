# Project Structure

Questo progetto è una web app (Vite + React + TypeScript + Tailwind) che implementa un mini roguelike Pokémon con draft iniziale, navigazione stanze, battaglia a turni, shop, salvataggio e PWA.

## Root

- **`index.html`**: entry HTML usata da Vite.
- **`package.json`**: dipendenze e script (`dev`, `build`, `lint`).
- **`vite.config.ts`**: configurazione Vite, PWA (`vite-plugin-pwa`) e alias `@ -> /src`.
- **`PROJECT_STRUCTURE.md`**: questa mappa del progetto.

## `src/` (codice applicazione)

- **`main.tsx`**: bootstrap React (mount dell’app).
- **`App.tsx`**: orchestratore dello stato globale (party, enemyTeam, room, inventario, gameState) e routing tra schermate; contiene anche la logica di generazione dei nemici/boss (`startBattle`).
- **`types.ts`**: tipi TypeScript condivisi (`BattlePokemon`, `Move`, `GameState`, ecc.).
- **`constants.ts`**: costanti di gioco.
  - **`TYPE_CHART`**: tabella efficacia tipi (usata da `getTypeEffectiveness`).
  - **`BOSS_ENCOUNTERS`**: **lista manuale** dei Pokémon Boss per stanza (10, 20, …, 100).
  - **`ITEMS`**: definizione strumenti e relativi effetti.
- **`api.ts`**: chiamate/fetch per ottenere dati Pokémon e mosse (sorgente dati esterna o layer di accesso).
- **`pokemonData.ts` / `data.ts`**: dataset/helpers di supporto (cache, mapping, dati locali).
- **`battle.ts`**: entry “legacy” che re-esporta la logica di battaglia da `utils/` per import più comodi.
- **`battleLogic.ts`**: entry “legacy” che re-esporta `utils/battleMechanics.ts` (type effectiveness, danno, ecc.).

### `src/utils/` (logica di dominio)

- **`utils/battleMechanics.ts`**: formule di gioco (statistiche attuali, update livello, efficacia tipi, calcolo danno con STAB/crit/accuracy).
- **`utils/moveEffectHandler.ts`**: pipeline turni/effetti mosse (status, stat stages, end-turn damage) e messaggistica “di battaglia”.

### `src/hooks/` (stato e side effects)

- **`hooks/useGameSave.ts`**: salvataggio/caricamento partita (persistent storage).
- **`hooks/useSoundEffects.ts`**: riproduzione effetti sonori UI/battaglia.

### `src/components/` (UI)

- **`components/DraftScreen.tsx`**: selezione Pokémon (inizio run e reclutamento).
- **`components/RoomNavigation.tsx`**: schermata navigazione/progressione stanze e accesso alla battaglia.
- **`components/BattleEngine.tsx`**: UI e loop della battaglia (turni, log, switch, bag, overlay messaggi).
- **`components/ShopScreen.tsx`**: UI shop e acquisto strumenti.
- **`components/PokemonSprite.tsx`**: rendering sprite (front/back).
- **`components/StatStagesBadges.tsx`**: badge/stato per i potenziamenti/penalità alle statistiche.

### Styling

- **`index.css`**: base CSS (Tailwind + custom utilities).

