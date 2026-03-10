# Project Structure

Questa web app usa Vite + React + TypeScript e implementa un roguelike Pokémon leggero.

## Root

- `index.html`: pagina HTML entry con meta tag SEO/PWA e lingua `it`.
- `package.json`: dipendenze e script (`dev`, `build`, `lint`).
- `tsconfig.json`: configurazione TypeScript.
- `vite.config.ts`: configurazione Vite (alias, plugin, PWA).
- `README.md`: documentazione di progetto.
- `PROJECT_STRUCTURE.md`: questa mappa.
- `REFACTORING_COMPLETE.md`: report refactor & status.

## `src/`

- `main.tsx`: mount React.
- `App.tsx`: controller global-state e game flow (MAIN_MENU, DRAFT, HUB, BATTLE, ecc.).
- `constants.ts`: dati statici (tipo, boss, articoli, costanti di gioco).
- `types.ts`: definizioni TypeScript (`BattlePokemon`, `Move`, `GameState`, `SaveData`, ecc.).

### `src/utils/`

- `battleMechanics.ts`: calcolo stats, tipo efficacia, danno, logica di battaglia.
- `moveEffectHandler.ts`: applicazione effetti mosse (status, modificatori statistici, danno end-turn, messaggistica).

### `src/hooks/`

- `useGameSave.ts`: salvataggio e caricamento da localStorage.
- `useSoundEffects.ts`: controllo e riproduzione effetti sonori.

### `src/components/`

- `MainMenu.tsx`: interfaccia menù principale.
- `DraftScreen.tsx`: draft Pokémon durante run.
- `TeamHub.tsx`: hub giocatore (statistiche, squadra, item, saldo).
- `RoomNavigation.tsx`: selezione stanza e andamento run.
- `ShopScreen.tsx`: shop in-game.
- `BattleEngine.tsx`: loop di battaglia e log.
- `PokemonSprite.tsx`: visual dei Pokemon.
- `StatStagesBadges.tsx`: indicatori modificatori statistici.

## Tooling

- Tailwind per stili utility-centric.
- Framer Motion per animazioni.
- PWA plugin (vite-plugin-pwa) per supporto installabile.

## Nota

La struttura è aggiornata al 2026. Mantieni coerente questo file dopo ogni refactor significativo.
