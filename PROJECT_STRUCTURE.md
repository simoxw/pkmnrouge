# PKM Rouge — Project Structure

Roguelike Pokémon basato su **Vite 6 + React 19 + TypeScript 5.8 + Tailwind CSS 4**.
Le battaglie sono interamente automatizzate turn-by-turn; i dati dei Pokémon vengono scaricati live da [PokeAPI](https://pokeapi.co/).

---

## Struttura ad albero

```
pkmrouge/
├── index.html                  ← Entrypoint HTML con SEO/PWA/meta
├── vite.config.ts              ← Config Vite (PWA, Tailwind, alias @)
├── tsconfig.json               ← Config TypeScript
├── package.json                ← Dipendenze e script npm
├── .env.example                ← Variabili d'ambiente di esempio
├── metadata.json               ← Metadati progetto generici
├── public/
│   └── manifest.json           ← Manifest PWA
├── scripts/
│   └── parse_pk.js             ← Script utility (parsing file PKHeX .pk)
└── src/
    ├── main.tsx                ← Bootstrap React + registrazione Service Worker PWA
    ├── App.tsx                 ← Controller principale: stato globale e game flow
    ├── api.ts                  ← Fetch da PokeAPI (Pokémon, mosse, draft)
    ├── constants.ts            ← Dati statici: ITEMS, TYPE_CHART, BOSS_ENCOUNTERS
    ├── types.ts                ← Tipi TypeScript condivisi
    ├── pokemonData.ts          ← Database locale Pokémon Gen 4 (fallback/dev)
    ├── index.css               ← Stili globali Tailwind
    ├── vite-env.d.ts           ← Dichiarazioni ambiente Vite
    ├── components/
    │   ├── BattleEngine.tsx    ← Loop di battaglia completo (UI + logica turn-based)
    │   ├── BattleBackground.tsx← Sfondo animato battaglia (normale vs boss)
    │   ├── DraftScreen.tsx     ← Schermata di scelta Pokémon (draft / reclutamento)
    │   ├── MainMenu.tsx        ← Menu principale (profilo, opzioni, salvataggio)
    │   ├── PokemonSprite.tsx   ← Rendering sprite Pokémon (Gen 4 / official-artwork)
    │   ├── RoomNavigation.tsx  ← Mappa progressione e pulsante entra in battaglia
    │   ├── ShopScreen.tsx      ← Negozio oggetti in-game
    │   ├── StatStagesBadges.tsx← Badge visuali modificatori stat (+/-) in battaglia
    │   └── TeamHub.tsx         ← Hub giocatore: squadra, zaino, avvio battaglia
    ├── hooks/
    │   ├── useGameSave.ts      ← Salvataggio/caricamento automatico via localStorage
    │   └── useSoundEffects.ts  ← Riproduzione effetti sonori (click, hit, victory)
    └── utils/
        ├── battleMechanics.ts  ← Calcolo statistiche, danno, efficacia tipo, stage
        └── moveEffectHandler.ts← Pipeline effetti mosse: categorie, status, drain, buff
```

---

## File di configurazione e root

### `index.html`
Entry point HTML. Configura:
- `lang="it"`, viewport ottimizzata per mobile (`maximum-scale=1.0, user-scalable=no`)
- Meta SEO (description, keywords, Open Graph)
- PWA: `<link rel="manifest">`, `apple-mobile-web-app-capable`, `status-bar-style`
- `theme-color: #6366f1` (indigo)

### `vite.config.ts`
- Plugin: `@vitejs/plugin-react`, `@tailwindcss/vite`, `VitePWA`
- PWA con `registerType: 'autoUpdate'`, workbox per caching completo degli asset
- Alias `@` → `./src`
- `base: './'` per deploy su path relativo

### `package.json`
Principali dipendenze:
| Pacchetto | Versione | Uso |
|---|---|---|
| `react` / `react-dom` | 19 | Framework UI |
| `vite` | 6 | Build tool |
| `motion` | 12 | Animazioni (Framer Motion) |
| `lucide-react` | 0.546 | Icone SVG |
| `tailwindcss` | 4 | Stili utility |
| `vite-plugin-pwa` | 1.2 | Supporto PWA |
| `@google/genai` | 1.29 | SDK Google AI (non attivo nel core) |
| `express` / `better-sqlite3` | — | Backend futuro / non attivo |

Script disponibili: `dev` (porta 3000), `build`, `preview`, `clean`, `lint` (tsc --noEmit).

---

## `src/` — Codice sorgente

### `src/main.tsx`
Bootstrap dell'app: monta `<App>` in `StrictMode`, importa `index.css`, registra il **Service Worker PWA** tramite `registerSW` (virtual:pwa-register). Logga eventi `onNeedRefresh` e `onOfflineReady`.

---

### `src/App.tsx` — Controller Globale
**Il componente radice** che gestisce tutto il game flow tramite una macchina a stati (`GameState`).

**Stati di gioco gestiti:**
| Stato | Descrizione |
|---|---|
| `MAIN_MENU` | Menu principale |
| `DRAFT` | Scelta Pokémon iniziale (3 opzioni random Gen1-5) |
| `HUB` | Hub della squadra tra una battaglia e l'altra |
| `NAVIGATION` | (legacy) Navigazione stanze |
| `BATTLE` | Battaglia in corso |
| `RECRUITMENT` | Scelta nuovo Pokémon dopo boss |
| `LEARN_MOVE` | UI per apprendere una nuova mossa ogni 5 livelli |
| `SHOP` | Negozio oggetti |
| `GAME_OVER` | Fine partita (sconfitta o vittoria a stanza 100+) |

**Stato globale gestito:**
- `party`: array `BattlePokemon[]` (max 6 Pokémon)
- `enemyTeam`: array nemici per la battaglia corrente
- `roomNumber`: stanza attuale (1–100)
- `money`: monete del giocatore (parte da 100, +50 per vittoria)
- `inventory`: array `InventoryItem[]`
- `settings`: preferenze suoni/musica (persistite in `localStorage`)
- `gameStats`: statistiche run (stanza max, livello max, Pokémon più usato)

**Logiche principali:**
- `startBattle()`: fetch nemici da PokeAPI, scala livello/stats per stanza, applica boss buff (HP ×1.5+, stat ×1.15+)
- `handleBattleEnd()`: award money, level-up del Pokémon attivo, `applyRest()` (30% HP + 3 PP per mossa), check `LEARN_MOVE` ogni 5 livelli
- `applyRest()`: ripristino post-battaglia (30% HP, +3 PP/mossa, reset statStages)
- `handleLearnMove()`: aggiorna la mossa nel party e avanza alla stanza
- `handlePokemonSelect()`: crea `BattlePokemon` da `Pokemon` raw con stats calcolate al livello corretto
- Boss scaling: livello base 50 + (floor/10)*5; boss HP moltiplicatore +0.1 per blocco da 10 stanze
- `handleUseItem()` / `handleBuyItem()`: gestione inventario

---

### `src/types.ts` — Tipi TypeScript
Definizioni condivise in tutto il progetto.

**Enum e tipi principali:**

- **`Type`** (enum): tutti e 18 tipi Pokémon incluso `FAIRY`
- **`DamageClass`**: `'physical' | 'special' | 'status'`
- **`StatusCondition`**: `'PAR' | 'BRN' | 'PSN' | 'SLP' | 'FRZ'`
- **`GameState`**: unione di stringhe per la macchina a stati

**Interfacce:**

| Interfaccia | Campi principali |
|---|---|
| `Move` | id, name, type, power, accuracy, pp, currentPp, damageClass, ailment, ailmentChance, statChanges, target, priority |
| `Stats` | hp, attack, defense, spAtk, spDef, speed |
| `Pokemon` | id, name, types, baseStats, moves, ability, spriteUrl, cryUrl |
| `BattlePokemon` | estende Pokemon + currentHp, maxHp, actualStats, level, status, sleepTurns, statStages |
| `BattleLog` | id, message, type (info/damage/status/victory/defeat) |
| `Item` | id, name, description, price, minRoom, effect(pokemon) |
| `InventoryItem` | itemId, count |
| `SaveData` | gameState, party, roomNumber, money, inventory, timestamp |
| `GameStats` | maxRoomReached, mostUsedPokemonId, maxLevelAchieved |
| `Settings` | soundEnabled, musicEnabled |

---

### `src/constants.ts` — Dati Statici

**`ITEMS`** — Array di 15 oggetti acquistabili:
| ID | Nome | Effetto | Prezzo | Min Room |
|---|---|---|---|---|
| `potion` | Pozione | +50 HP | 50$ | 1 |
| `super_potion` | Superpozione | +120 HP | 120$ | 10 |
| `hyper_potion` | Iperpozione | +200 HP | 250$ | 40 |
| `full_restore` | Ripristino Totale | HP max + cura stato | 1000$ | 60 |
| `revive` | Revitalizzante | Riporta in vita al 50% HP | 350$ | 50 |
| `antidote` | Antidoto | Cura PSN | 30$ | 1 |
| `paralyze_heal` | Antiparalisi | Cura PAR | 30$ | 1 |
| `awakening` | Sveglia | Cura SLP | 40$ | 1 |
| `burn_heal` | Antiscottatura | Cura BRN | 40$ | 1 |
| `ice_heal` | Antigelo | Cura FRZ | 40$ | 1 |
| `full_heal` | Guarisci Tutto | Cura qualsiasi stato | 100$ | 10 |
| `ether` | Etere | +10 PP alla mossa con meno PP | 80$ | 20 |
| `max_ether` | Superetere | PP max alla mossa con meno PP | 150$ | 20 |
| `elixir` | Elisir | +10 PP a tutte le mosse | 250$ | 40 |
| `max_elixir` | Superelisir | PP max a tutte le mosse | 500$ | 50 |

**`TYPE_CHART`** — Tabella efficacia tipo Gen 4 completa (18 tipi), include FAIRY retroattivo:
- FAIRY è super-efficace su Fighting, Dragon, Dark
- FAIRY è resistito da Fire, Poison, Steel
- FAIRY è immune a Dragon

**`BOSS_ENCOUNTERS`** — Tabella boss per stanza (multipli di 10):
| Stanza | Pokémon |
|---|---|
| 10 | Snorlax (143) |
| 20 | Dragonite (149), Tyranitar (248) |
| 30 | Raikou (243), Entei (244), Suicune (245) |
| 40 | Mew (151), Celebi (251), Jirachi (385), Manaphy (490) |
| 50 | Cresselia (488), Dialga (483), Palkia (484), Darkrai (491), Giratina (487) |
| 60 | Lugia (249), Ho-Oh (250), Rayquaza (384), Deoxys (386), Kyogre (382), Groudon (383) |
| 70 | Heatran (485), Regigigas (486), Shaymin (492), Latias (380), Latios (381), Mewtwo (150) |
| 80 | Zapdos (145), Articuno (144), Moltres (146), Regice (378), Regirock (377), Registeel (379) |
| 90 | Giratina (487), Mew (151), Kyogre (382), Rayquaza (384), Deoxys (386), Lugia (249) |
| 100 | Mewtwo (150), Arceus (493), Blissey (242), Deoxys (386), Mew (151), Regigigas (486) |

---

### `src/api.ts` — Integrazione PokeAPI

**`fetchPokemonData(id: number): Promise<Pokemon>`**
- Scarica dati Pokémon da `https://pokeapi.co/api/v2/pokemon/{id}`
- Estrae: baseStats, tipi, abilità, sprite, cry URL
- Scarica 4 mosse random escludendo `EXCLUDED_MOVE_IDS` (lista di ~100 mosse non gestibili: Protect, Sostituto, mosse meteo, terreno, hazard, mosse suicida, ecc.)
- Fallback: se nessuna mossa valida, usa le prime 4 senza filtro
- Normalizza il nome della mossa in italiano (campo `names` con `language.name === 'it'`)

**`fetchNewMove(pokemonId, currentMoveIds): Promise<Move | null>`**
- Usato a livelli multipli di 5 per l'apprendimento mosse
- Scarica un subset di 10 mosse disponibili (non già note, non escluse)
- Preferisce mosse dello stesso tipo del Pokémon (STAB priority)
- Fallback a mossa casuale dal subset

**`generateDraft(): Promise<Pokemon[]>`**
- Genera 3 Pokémon random (ID 1–649, Gen 1–5)
- Usata da `DraftScreen` per il draft iniziale e i reclutamenti

**`EXCLUDED_MOVE_IDS`** — Set con ~100 ID di mosse escluse, raggruppate per categoria:
protezione/sostituti, confusione/attrazione, meteo, terreni, trappole/hazard, cambi forzati, barriere, mosse copia, potenza variabile, dipendenti dal peso, danno fisso/percentuale, mosse suicide, controattacchi, accumulatori, effetti futuri, scambi stat, controllo avversario, dipendenti da amicizia, status persistenti, mosse non gestibili.

---

### `src/utils/battleMechanics.ts` — Calcolo Statistiche e Danno

**Costanti:**
- `STAGE_MULTIPLIERS`: moltiplicatori stage da -6 a +6 (Gen 4/5 standard)

**Funzioni esportate:**

| Funzione | Descrizione |
|---|---|
| `getStatWithStage(baseStat, stage)` | Applica moltiplicatore stage a una stat base |
| `calculateHP(base, level)` | Formula HP: `floor((base*level)/50) + level + 10` |
| `calculateStat(base, level)` | Formula stat: `floor((base*level)/50) + 5` |
| `getActualStats(baseStats, level)` | Calcola tutte le stat effettive al livello dato |
| `updateStats(pokemon, newLevel)` | Ricalcola stats al level-up, mantiene proporzione HP corrente |
| `getTypeEffectiveness(attackType, targetType)` | Legge TYPE_CHART, default 1x |
| `calculateDamage(attacker, defender, move)` | Formula danno completa con STAB, efficacia, critico, stage, burn |

**Formula danno:**
```
Damage = floor( (((2*Level/5+2) * Power * (A/D)) / 50 + 2) * random * STAB * effectiveness * crit )
```
- `random`: 0.85–1.0
- `STAB`: 1.5 se stesso tipo
- `crit`: 6.25% chance, ×1.5
- Burn su mosse fisiche: A ×0.5
- Stage applicati ad A e D prima del calcolo

---

### `src/utils/moveEffectHandler.ts` — Pipeline Effetti Mosse

**`MoveCategory`** (enum): `DAMAGE`, `HEALING`, `STAT_BUFF`, `STAT_DEBUFF`, `STATUS_ONLY`, `DAMAGE_STATUS`, `DAMAGE_DEBUFF`, `DRAIN`, `NO_EFFECT`

**`MoveEffectResult`** (interfaccia):
```ts
{
  damage?: number;
  healing?: number;
  statChanges?: { stat, change, target: 'user'|'opponent' }[];
  statusApplied?: { status: StatusCondition; target: 'user'|'opponent' };
  messages: string[];
  effectiveness?: number;
  isCritical?: boolean;
  isMiss?: boolean;
}
```

**Metodi statici della classe `MoveEffectHandler`:**

| Metodo | Descrizione |
|---|---|
| `categorizeMove(move)` | Classifica la mossa in una `MoveCategory` |
| `processMove(attacker, defender, move)` | Dispatch principale, chiama il metodo corretto |
| `processDamageMove` | Chiama `calculateDamage`, restituisce danno |
| `processDrainMove` | Danno + healing pari alla metà del danno inflitto |
| `processHealingMove` | Rest (HP max + SLP) o 50% HP per altre mosse |
| `processStatBuffMove` | Applica stage +N al user |
| `processStatDebuffMove` | Applica stage -N all'avversario |
| `processStatusOnlyMove` | Applica stato alterato (con immunity check) |
| `processDamageStatusMove` | Danno + chance stato (10%) |
| `processDamageDebuffMove` | Danno + chance debuff stat (10%) |
| `canAct(pokemon)` | Check SLP (decrementa sleepTurns), FRZ (20% thaw), PAR (25% immobile) |
| `processTurn(attacker, defender, move)` | Combina `canAct` + `processMove` in un unico risultato |
| `applyStatusEffects(pokemon)` | Ritorna actualStats senza mutazioni (la paralisi speed si calcola al momento) |
| `applyEndOfTurnEffects(pokemon)` | Danno fine turno da PSN/BRN (`maxHp / 8`) |

**Mosse Drain supportate:** absorb, mega-drain, giga-drain, leech-life, drain-punch, dream-eater, horn-leech, oblivion-wing

**Mosse Healing supportate:** rest, recover, synthesis, roost, wish, milk-drink, soft-boiled, moonlight, morning-sun, slack-off, healing-wish, jungle-healing, life-dew, shore-up, strength-sap

**Immunità stato per tipo:**
- BRN: immuni tipo Fire
- PAR: immuni tipo Electric
- FRZ: immuni tipo Ice
- PSN: immuni tipo Poison e Steel

---

## `src/components/` — Componenti UI

### `BattleEngine.tsx`
Il componente più complesso del progetto. Gestisce l'intera **sessione di battaglia**.

**Props:** `playerPokemon`, `enemyTeam`, `party`, `inventory`, `isBoss`, `onBattleEnd`, `onSwitch`, `onUpdatePartyMember`, `onUseItem`

**Stato interno:**
- `player` / `enemy`: `BattlePokemon` locali per aggiornamenti rapidi
- `enemyIndex`: indice Pokémon nemico attivo (per squadre boss)
- `isPlayerTurn`: determinato inizialmente da speed (con stage)
- `logs`: ultimi 5 messaggi di battaglia
- `showSwitchMenu` / `showBagMenu` / `selectedItemForPokemon`
- `activeEffect`: effetto visivo temporaneo (tipo, lato, testo)
- `hoveredMove`: info mossa su hover/touch
- `lastEnemyMove`: ultima mossa usata dal nemico (mostrata in UI)
- `playerEffectivenessMessage` / `enemyEffectivenessMessage`

**Funzioni principali:**
- `handleMove(move)`: gestisce turno giocatore (status check → PP decrement → danno → effetti → passaggio turno)
- `enemyTurn()`: AI nemica con move pool pesato per efficacia tipo (supereff ×3, normal ×1, resist ×0.5)
- `handleSwitch(index, isForced)`: cambio Pokémon (costa turno se volontario, gratis se forzato da KO)
- `handleUseItemInBattle(itemId, pokemonIndex)`: usa oggetto e passa il turno
- `applyEndTurnEffects()`: applica danno PSN/BRN a entrambi, gestisce KO da status
- `commitPlayer(updater)`: aggiorna stato locale e propaga a App tramite `onUpdatePartyMember`
- `playCry(url)`: riproduce il verso del Pokémon

**UI:** arena a 3 fasce (enemy side, log centrale, player side) + pannello controlli (griglia mosse 2×2, switch, zaino, battle log su desktop).

---

### `BattleBackground.tsx`
Sfondo CSS/SVG animato che cambia in base a `isBoss`:

- **Normale:** cielo gradiente blu + prato verde, nuvole in drift orizzontale
- **Boss:** caverna scura con soffitto roccioso, stalattiti, torce animate (flicker), brace che salgono (ember animation), glow ambientale arancione

Usa `useMemo` per generare le particelle brace solo al mount.

---

### `DraftScreen.tsx`
Schermata di selezione Pokémon. Riusata per:
1. **Draft iniziale** (starter): titolo default "Scegli il tuo Starter"
2. **Reclutamento** post-boss: titolo/subtitle passati come prop

**Funzionamento:**
- Al mount chiama `generateDraft()` (3 Pokémon random da PokeAPI)
- Mostra spinner Loader2 durante il fetch
- Griglia responsiva 1→3 colonne, ogni card mostra: sprite, nome, tipi, stats effettive al livello 50
- Click → callback `onSelect(pokemon)` verso App

---

### `MainMenu.tsx`
Menu principale con animazioni Framer Motion.

**Props:** `onStart`, `onLoadGame`, `hasSave`

**Pulsanti:**
- **Nuova Partita** → `onStart()`
- **Carica Partita** → `onLoadGame()` (visibile solo se `hasSave === true`)
- **Profilo** → modal con statistiche (`maxRoomReached`, `maxLevelAchieved`) + 8 medaglie (Shield icon, colorata se stanza boss superata)
- **Modalità Online** → disabilitato (placeholder "Prossimamente")
- **Opzioni** → modal con toggle Suoni e Musica (salvati in `localStorage` con key `pkmrouge_settings`)

Medaglie: 8 shield corrispondenti alle stanze boss 10→80. Titoli speciali: "Campione della Lega" (stanza ≥90), "Pokémon Master" (stanza ≥100).

---

### `TeamHub.tsx`
Hub tra le battaglie. Mostra il party e permette azioni pre-battaglia.

**Props:** `party`, `inventory`, `roomNumber`, `money`, `onStartBattle`, `onSwapPartyOrder`, `onUseItem`, `onOpenShop`, `onOpenMenu`

**UI:**
- Barra di progressione 0→100 con marker boss ogni 10 stanze
- Header: bottone Menu (←), titolo "Stanza N", bottoni Negozio e Zaino, saldo monete
- Lista squadra: sprite Pokémon, nome, tipi, status badge, barra HP colorata, livello, PP correnti di tutte le mosse
- Pannello azioni: "Battaglia" (verde), "Gestisci Squadra" (viola) per riordinare con frecce su/giù

**Zaino modale:** lista oggetti con quantità, selezione Pokémon target, check usability per tipo oggetto. Feedback toast animato 2 secondi.

---

### `ShopScreen.tsx`
Negozio in-game accessibile dall'hub.

**Props:** `money`, `roomNumber`, `onBuy`, `onExit`

**Funzionamento:**
- Al mount filtra ITEMS disponibili per `minRoom ≤ roomNumber`
- Seleziona un pool di ~5 oggetti bilanciato: 2 cure HP, 2 cure stato, 1 PP restore
- Se pool < 4 oggetti, riempie con oggetti rimanenti
- Shuffle finale del pool
- Ogni card mostra: nome, descrizione, prezzo; bottone "Acquista" (disabled se fondi insufficienti)
- Feedback verde animato post-acquisto

---

### `RoomNavigation.tsx`
Schermata di navigazione (stato `NAVIGATION`, legacy/non principale).

**Props:** `roomNumber`, `onEnterBattle`

**UI:** mappa progressione con marker boss, indicazione prossimo boss, unico pulsante "Combatti Allenatore".

---

### `PokemonSprite.tsx`
Componente puro per il rendering degli sprite.

**Props:** `id`, `name`, `isBack?`, `className?`

**Logica:**
- Sprite frontale: `PokeAPI/sprites/...generation-iv/diamond-pearl/{id}.png`
- Sprite posteriore: `...diamond-pearl/back/{id}.png`
- Fallback `onError`: `official-artwork/{id}.png`
- Classe CSS `pixelated` per rendering pixel-perfect

---

### `StatStagesBadges.tsx`
Badge visuali per i modificatori statistici attivi durante la battaglia.

**Props:** `pokemon: BattlePokemon`, `className?`

**Logica:** filtra statStages diversi da 0 (ATK, DEF, SPA, SPD, SPE), mostra badge colorati (blu per positivi ⬆, rosso per negativi ⬇) con il valore assoluto.

---

## `src/hooks/`

### `useGameSave.ts`
Gestione persistenza con `localStorage`.

**Key di storage:** `poke_rogue_save`

**Input (Params):** `party`, `roomNumber`, `money`, `inventory`, `gameState`

**Funzionamento:**
- Mount: verifica esistenza save → imposta `hasSave`
- Auto-save su ogni cambio di stato rilevante (escluso DRAFT e GAME_OVER, richiede `party.length > 0`)
- `GAME_OVER`: cancella il save automaticamente
- `loadGame()`: deserializza e ritorna `SaveData`, gestisce errori di parsing

**Output:** `{ hasSave: boolean, loadGame: () => SaveData | null }`

---

### `useSoundEffects.ts`
Gestione effetti sonori tramite Web Audio API.

**Suoni configurati:**
| Key | URL | Uso |
|---|---|---|
| `click` | CDN Pixabay | Click pulsanti |
| `hit` | CDN Pixabay | Danno in battaglia |
| `victory` | CDN Pixabay | Vittoria battaglia |

**Funzionamento:**
- `useRef` per cache degli oggetti `Audio` (evita reload multipli)
- `playSound(key, config?)`: play con volume 0.4 di default, gestisce errori silenziosamente
- Se `enabled === false` ritorna senza riprodurre

---

## `src/pokemonData.ts` — Database Locale Gen 4

File di dati **statici** (non usato nel game flow principale, usato come riferimento/dev).

Contiene:
- `GEN4_MOVES`: dizionario di 20 mosse Gen 4 predefinite (tackle, flamethrower, thunderbolt, ecc.) con tutti i campi `Move`
- `POKEMON_DATABASE`: array di 10 Pokémon Gen 4 starter (Turtwig, Grotle, Torterra, Chimchar, Monferno, Infernape, Piplup, Prinplup, Empoleon, Starly) con baseStats e movesets fissi

> ⚠️ Questo file non è importato da nessun componente attivo. Serve come dataset di riferimento o per test offline.

---

## `scripts/parse_pk.js`
Script Node.js **utility** (non fa parte del bundle).

**Scopo:** parsing di file binari `.pk` (formato PKHeX) → JSON compatibile con la struttura `Pokemon`.

**Funzionamento attuale:** pseudocodice/esempio. Legge buffer binario da `./pk_files/*.pk`, estrae baseStats da offset fissi, scrive output in `./src/data/pokemon_extracted.json`.

> ⚠️ La cartella `pk_files` non è presente nel repository. Lo script è un placeholder per futura funzionalità di import personalizzato.

---

## Flusso di Gioco

```
MAIN_MENU
   │
   ├─ Nuova Partita ──► DRAFT (3 Pokémon random da PokeAPI)
   │                        │
   │                        └─► HUB
   │
   └─ Carica Partita ──────► HUB
                               │
                  ┌────────────┼────────────┐
                  │            │            │
               SHOP         Battaglia    Gestisci Squadra
                  │            │
                  └────────► BATTLE
                               │
                    ┌──────────┴──────────┐
                  Vittoria            Sconfitta
                    │                    │
         ┌──────────┤               GAME_OVER
         │          │
      Boss?      LEARN_MOVE? (ogni 5 livelli)
         │          │
    RECRUITMENT      └─► HUB (stanza+1)
         │
         └─► HUB (stanza+1)
```

---

## Stanze e Scaling

- **Stanze 1–100**, loop roguelike
- **Livello nemici:** 50 + (floor((room-1)/10) * 5) → da 50 (stanza 1) a 95 (stanza 91+)
- **Nemici per stanza:** 1 (1-20), 2 (21-50), 3 (51-70), 4 (71-90), 5 (91-100)
- **Boss (ogni 10 stanze):** team fisso da BOSS_ENCOUNTERS, dimensione = min(6, floor(room/10))
- **Boss buff:** HP ×(1.5 + scalingFactor×0.1), stat ×(1.15 + scalingFactor×0.05)
- **Post-vittoria:** +50$, +1 livello al Pokémon attivo, 30% HP a tutta la squadra, +3 PP/mossa
- **Post-boss:** RECRUITMENT (scelta nuovo Pokémon, max 6 slot, con sostituzione se pieno)
- **Vittoria:** completare la stanza 100 → "VITTORIA!" con stato GAME_OVER speciale

---

## Chiavi localStorage

| Chiave | Contenuto |
|---|---|
| `poke_rogue_save` | `SaveData` JSON completo (party, room, money, inventory, timestamp) |
| `pkmrouge_stats` | `GameStats` JSON (maxRoom, maxLevel, mostUsedPokemon) |
| `pkmrouge_settings` | `Settings` JSON (soundEnabled, musicEnabled) |

---

## Tooling & Build

- **Tailwind CSS 4** (via `@tailwindcss/vite`) — utility-first styling
- **Framer Motion 12** (importato come `motion/react`) — animazioni componenti
- **Lucide React** — icone SVG (RotateCcw, Download, Loader2, ShoppingBag, Users, ecc.)
- **vite-plugin-pwa** — Service Worker, caching offline, manifest PWA
- **TypeScript 5.8** con `strict` implicito via tsconfig

---

*Ultima revisione: Marzo 2026 — aggiornare dopo ogni refactor significativo.*
