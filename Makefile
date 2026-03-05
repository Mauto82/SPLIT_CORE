CTX_COMPOSE=docker compose -f docker-compose.ctx.yml --env-file .env.ctx
CTX_RUN=python /opt/contextdoc/tools/ctx-run/ctx_run.py
CTX_WATCH=python /opt/contextdoc/tools/ctx-watch/ctx_watch.py

.PHONY: ctx-build ctx-run ctx-run-json ctx-watch-status ctx-watch-live ctx-watch-reverse ctx-cache-clear

ctx-build:
	$(CTX_COMPOSE) build contextdoc-tools

ctx-run:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_RUN) run .

ctx-run-json:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_RUN) run . --output json

ctx-watch-status:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_WATCH) status . --since 86400

ctx-watch-live:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_WATCH) watch . --grace 300

ctx-watch-reverse:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_WATCH) status . --reverse

ctx-cache-clear:
	$(CTX_COMPOSE) run --rm contextdoc-tools $(CTX_RUN) clear-cache
