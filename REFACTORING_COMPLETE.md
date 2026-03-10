# PKM Rouge - Refactoring & Mobile Optimization Complete ✅

## Stato corrente (2026)

Il progetto è stato refattorizzato e ottimizzato per mobile con tutte le seguenti funzionalità funzionanti:

- Game flow completo: MAIN_MENU, DRAFT, HUB, BATTLE, SHOP, GAME_OVER
- Salvataggio/carroicamento via `localStorage`
- Battaglia con log, ordine di attacco, calcolo danni, status e stati stanza
- UI responsive con animazioni Framer Motion e badge stato
- Supporto PWA e metadati SEO nel `index.html`

## Refactoring chiave

- `App.tsx`: stato globale ridotto e clear separation of concerns
- `src/utils/battleMechanics.ts`: ora contiene tutte le formule e funzioni di battaglia
- `src/utils/moveEffectHandler.ts`: gestisce status, stage stats e azioni turn-based
- `src/hooks/useGameSave.ts`: centralizza persist action in localStorage
- `src/hooks/useSoundEffects.ts`: effetto sonori implementati e controllabili

## Dettagli delle modifiche

### `index.html`
- Meta viewport ottimizzata per mobile
- Supporto PWA iOS (apple-mobile-web-app-capable, status-bar-style)
- Open Graph e description SEO
- `lang="it"`

### `src/utils/battleMechanics.ts`
- `calculateHP`, `calculateStat`, `getActualStats`, `getTypeEffectiveness`, `calculateDamage`
- STAB, critical, effectiveness, burn, accuracy

### `src/utils/moveEffectHandler.ts`
- Gestione effetti standanti e temporanei: sleep, burn, poison, stat stages
- Aggiornamento HP per end-turn
- Messaggi di battaglia coerenti con `BattleEngine`

### Componenti
- `BattleEngine.tsx`: loop di combattimento, log, bottoni azione, animazioni
- `TeamHub.tsx`: gestione squadre, progress bar, bottoni e status
- `ShopScreen.tsx`: acquisto e vendita oggetti
- `DraftScreen.tsx`: selezione Pokémon

## Verifica

- `npm run lint` ✔️
- `npm run build` ✔️
- Nessun riferimento a `src/battle.ts` (non presente) ✔️

## Note finali

- Se il progetto si evolve, aggiornare prima `PROJECT_STRUCTURE.md`, poi `README.md` e `REFACTORING_COMPLETE.md`.
- Documentazione ora descrive lo stato reale del repository.
