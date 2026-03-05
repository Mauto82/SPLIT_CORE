# Projection

Pipeline ContextDoc in Docker per validare e monitorare i file `.ctx`.

## Setup

```bash
cp .env.ctx.example .env.ctx
make ctx-build
```

## Comandi principali

```bash
make ctx-run
make ctx-run-json
make ctx-watch-status
make ctx-watch-live
make ctx-watch-reverse
make ctx-cache-clear
```

## Tool integrati

- `ctx-run`: esegue i `conceptualTests` dei file `.ctx` tramite LLM.
- `ctx-watch`: controlla drift tra file sorgente e file `.ctx`.

## Variabili ambiente

- `CONTEXTDOC_REF`: branch o tag del repository ContextDoc da usare nel container.
- `CTX_MODEL`: modello LiteLLM per `ctx-run`.
- `OLLAMA_BASE_URL`: endpoint Ollama raggiungibile dal container, ad esempio `http://host.docker.internal:11434`.
- `OPENAI_API_KEY`: chiave provider OpenAI opzionale.
- `ANTHROPIC_API_KEY`: chiave provider Anthropic opzionale.
