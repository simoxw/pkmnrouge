<div align="center">
<img width="800" alt="PKM Rouge Logo" src="/public/logo.png" />
</div>

# PKM Rouge

**PKM Rouge** è un gioco di battaglie strategiche ispirato al mondo dei mostriciattoli tascabili, sviluppato con Vite + React + TypeScript.

## Funzionalità principali

- Combattimento automatico a squadre (fino a 4 Pokémon per squadra)
- Draft iniziale & shop in-game con monete, acquisti e vendite
- Navigazione tra stanze con boss encounter a intervalli prefissati
- Gestione party, oggetti e riepilogo statistiche di gioco
- Salvataggio locale (`localStorage`) e caricamento della sessione
- Interfaccia responsive (desktop/mobile) con animazioni

## Architettura del progetto

- `src/App.tsx`: orchestratore stato e game flow
- `src/components/`: UI (MainMenu, DraftScreen, Hub, BattleEngine, Shop, RoomNavigation, TeamHub, ecc.)
- `src/utils/battleMechanics.ts`: logiche di battaglia (danno, efficacia, statistica)
- `src/utils/moveEffectHandler.ts`: pipeline effetti mosse e messaggi di combattimento
- `src/hooks/useGameSave.ts`: gestione salvataggio/caricamento
- `src/hooks/useSoundEffects.ts`: effetti sonori
- `src/constants.ts`: costanti tipi, boss, item
- `src/types.ts`: tipi TS condivisi (`BattlePokemon`, `GameState`, `SaveData`, ecc.)

## Installazione e avvio

1. Clonare il repository
2. Eseguire `npm install`
3. Avviare con `npm run dev`
4. Aprire `http://localhost:3000`

## Monitorare tipo e build

- `npm run build` per compilare in produzione
- `npm run lint` per analisi statiche

## Note rapide

- Il file `index.html` contiene metadati SEO/PWA e impostazione lingua in italiano (`lang="it"`).
- Per modifiche principali, aggiornare anche `PROJECT_STRUCTURE.md` e `REFACTORING_COMPLETE.md`.
