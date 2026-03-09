<div align="center">
<img width="800" alt="PKM Rouge Logo" src="/public/logo.png" />
</div>

# PKM Rouge

**PKM Rouge** è un gioco di battaglie strategiche ispirato al mondo dei mostriciattoli tascabili. I giocatori affrontano sfide in un’arena digitale dove le scelte tattiche e la gestione delle risorse determinano la vittoria.

## Introduzione al gioco

L’obiettivo principale è sconfiggere i Pokémon avversari durante gli scontri. Ogni partita si svolge in tempo reale con un massimo di quattro creature per squadra. Il giocatore può acquistare, vendere e potenziare mostri in un negozio interno al gioco, influenzando così la composizione e la forza della propria squadra.

### Meccaniche principali

- **Draft e negozio:** All’inizio di ogni turno, il giocatore dispone di una certa quantità di monete da spendere nel negozio. Qui può acquistare nuovi Pokémon, vendere quelli esistenti o pagare per rinnovare l’inventario.
- **Statistica delle creature:** Ogni Pokémon ha valori di attacco, difesa e velocità che influenzano l’esito degli scontri automatici. L’algoritmo di battaglia (`battleLogic.ts`) si occupa di simulare il combattimento tra le due squadre.
- **Ordine di attacco:** La velocità determina quale Pokémon attacca per primo. Le abilità e gli oggetti non sono ancora implementati ma potrebbero essere aggiunti in futuro.
- **Progresso:** Dopo ogni turno, la squadra può essere modificata. Gli XP o i livelli non sono gestiti nel codice attuale; invece, i potenziamenti si ottengono unendo creature dello stesso tipo attraverso operazioni di ``merge`` o con monete.
- **Interfaccia:** Il front-end React (`App.tsx`, `BattleEngine.tsx`, ecc.) gestisce la visualizzazione degli sprite, delle schermate di negozio/draft e della navigazione tra le varie sezioni del gioco.

## Come eseguire il progetto

> Nota: la logica principale del gioco non verrà modificata durante queste operazioni.

1. Assicurati di avere Node.js installato.
2. Dalla radice del progetto installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
4. Apri un browser e visita `http://localhost:3000` (o la porta indicata dal terminale) per giocare.

Buon divertimento con **PKM Rouge!**