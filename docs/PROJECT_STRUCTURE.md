# Project Structure

Questa struttura separa codice, asset runtime, asset sorgente, generatori e documentazione.

```text
Serious_game_CFCA/
├── assets/                  # Asset sorgente per livelli e media
│   └── media/               # Video/audio sorgente non caricati direttamente dal codice
├── docs/                    # Documentazione, direttive e walkthrough
├── public/                  # File serviti da Vite cosi come sono
│   ├── evidence/            # Immagini mostrate dall'Asset Viewer
│   ├── levels/              # JSON dei livelli caricati dal gioco
│   └── intro.mp4            # Intro usata da IntroVideo
├── scripts/
│   ├── level_generation/    # Generatori ufficiali e legacy dei livelli
│   └── experiments/         # Script temporanei conservati come riferimento
├── src/                     # Applicazione React
│   ├── components/
│   ├── data/
│   ├── hooks/
│   └── utils/
└── dist/                    # Output generato da npm run build
```

## Regole pratiche

- Modifica il gioco in `src/`.
- Modifica la campagna narrativa in `src/data/campaign.js`.
- Rigenera i livelli ufficiali con `npm run levels:build`.
- Non modificare manualmente `dist/`: viene rigenerata da `npm run build`.
- Tieni gli script una tantum in `scripts/experiments/`, non nella root.
- Tieni soluzioni e walkthrough in `docs/`, non nella root.
