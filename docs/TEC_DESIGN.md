# PROJECTION
## Documento Tecnico

---

## 1. Architettura Generale

Tipo: Web SPA
Deploy: Static hosting (es. Netlify)
Backend: Nessuno (v1)
Persistenza: localStorage + export JSON

Componenti principali:

- Terminal Engine
- State Manager
- Storage Manager
- Evolution Engine
- Animation Engine

---

## 2. Struttura Stato Applicazione

Chiave localStorage:
projection_state

Struttura dati:

{
  "version": 1,
  "created_at": "ISO_TIMESTAMP",
  "commands_history": [],
  "folders": {
    "clues": [],
    "trash": [],
    "meta": [],
    "user": []
  },
  "metrics": {
    "command_count": 0,
    "session_time": 0,
    "hesitation_time": 0
  },
  "evolution_level": 0
}

---

## 3. Export / Import

### export_progress

- Serializza lo stato
- Scarica file JSON
- Opzionale cifratura

### import_progress

- Carica JSON
- Valida struttura
- Ripristina stato completo

Nessun login richiesto.

---

## 4. Terminal Engine

Componenti:

- Input parser
- Command registry
- Output renderer
- History buffer

Comandi base:

- ls
- cat
- mv
- help
- whoami
- export_progress
- import_progress

Fallback:
Comandi sconosciuti producono output ambiguo.

---

## 5. Evolution Engine

Calcolo livello evolutivo basato su:

- Numero comandi eseguiti
- Tempo sessione
- Numero file archiviati
- Pattern interazione

Livelli:

0 → Terminale B/N
1 → Colori CSS
2 → Interattività (link cliccabili)
3 → Animazioni ASCII + glitch

---

## 6. Animation Engine

Tipi supportati:

- Loader ASCII
- Glitch randomico
- Frame ciclici
- Output distorto

Reattivo allo stato del sistema.

---

## 7. Sistema Finale

Generazione basata su:

- Hash stato completo
- Sequenza comandi
- Ordine cartelline
- Tempo totale sessione

Finale deterministico ma personalizzato.

---

## 8. Anti-AI Strategy

- Dipendenza da metriche temporali
- Generazione contenuti basata su stato locale
- Nessuna soluzione hardcoded unica
- Finali parametrizzati

---

## 9. Stack Suggerito

Versione 1:
- Vanilla JS
- CSS minimale
- localStorage

Versione 2:
- Vue.js
- Modularizzazione Engine
- State centralizzato

---

## 10. Versioning

Ogni export include:

- Versione schema
- Checksum stato
- Compatibilità futura