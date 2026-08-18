# Makefile para IIEG Portal
# Gestiona comandos de desarrollo y producción para Docker Compose

GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

# Entorno por defecto: dev
ENV ?= dev

# Entorno que usa `make deploy`. gcp en monolito (el portal comparte VM con el gateway y el
# acervo); prod en un nodo propio, donde iieg-network no existe porque no cruza de maquina.
DEPLOY_ENV ?= gcp

# Configuración según entorno
# - dev:  desarrollo local (acervo y todo en la misma máquina via iieg-network)
# - prod: producción "administración" (servidor aislado, acervo accedido por URL pública)
# - gcp:  producción "GCP" (todo en la misma VM, base + overlay iieg-network)
ifeq ($(ENV),prod)
	COMPOSE_FILES := -f docker-compose.yml
	ENV_FILE      := .env.production
	MSG_ENV       := Producción (administración)
else ifeq ($(ENV),prod-local)
	COMPOSE_FILES := -f docker-compose.yml
	ENV_FILE      := .env.production.local
	MSG_ENV       := Producción (prueba local)
else ifeq ($(ENV),gcp)
	COMPOSE_FILES := -f docker-compose.yml -f docker-compose.gcp.yml
	ENV_FILE      := .env.production
	MSG_ENV       := Producción (GCP)
else
	COMPOSE_FILES := -f docker-compose.dev.yml
	ENV_FILE      := .env.development
	MSG_ENV       := Desarrollo
endif

.PHONY: help up build rebuild deploy _up-prod down logs restart clean prune prune-all shell-api shell-web shell-admin shell-ckan ckan-exec bucket-ls import-data import-one import-mapa import-reportes import-posts install-api-dep install-slugify setup seed up-seed build-seed up-seed-prod-local build-seed-prod-local up-seed-prod build-seed-prod up-seed-gcp build-seed-gcp

help:
	@echo ''
	@echo '${YELLOW}IIEG Portal - Comandos disponibles${RESET}'
	@echo ''
	@echo 'Uso: ${YELLOW}make <comando> [ENV=dev|prod|prod-local|gcp]${RESET} (por defecto ENV=dev)'
	@echo ''
	@echo '${GREEN}Entornos:${RESET}'
	@echo '  ${YELLOW}dev${RESET}        - Desarrollo local (acervo en misma máquina via iieg-network)'
	@echo '  ${YELLOW}prod${RESET}       - Producción administración (servidor aislado, acervo por URL pública)'
	@echo '  ${YELLOW}prod-local${RESET} - Producción prueba local (usa .env.production.local y oculta puertos)'
	@echo '  ${YELLOW}gcp${RESET}        - Producción GCP (todo en una VM, conecta a iieg-network)'
	@echo ''
	@echo '${GREEN}Comandos:${RESET}'
	@echo '  ${YELLOW}make up${RESET}               - Inicia el entorno (en segundo plano)'
	@echo '  ${YELLOW}make build${RESET}            - Reconstruye e inicia el entorno'
	@echo '  ${YELLOW}make deploy [DEPLOY_ENV=gcp|prod]${RESET} - git pull + rebuild. gcp en monolito, prod en nodo propio'
	@echo '  ${YELLOW}make down${RESET}             - Detiene los contenedores'
	@echo '  ${YELLOW}make logs${RESET}             - Muestra logs en tiempo real'
	@echo '  ${YELLOW}make restart${RESET}          - Reinicia el entorno'
	@echo '  ${YELLOW}make clean${RESET}            - Borra contenedores, redes y volúmenes de BD (conserva buckets/acervo)'
	@echo '  ${YELLOW}make up-prod-local${RESET}    - Inicia el entorno en modo producción local'
	@echo '  ${YELLOW}make down-prod-local${RESET}  - Detiene el entorno en modo producción local'
	@echo '  ${YELLOW}make restart-prod-local${RESET}- Reinicia el entorno en modo producción local'
	@echo ''
	@echo '${GREEN}Shells (entran al contenedor del ENV actual):${RESET}'
	@echo '  ${YELLOW}make shell-api${RESET}   - bash en api'
	@echo '  ${YELLOW}make shell-ckan${RESET}  - bash en ckan'
	@echo '  ${YELLOW}make shell-web${RESET}   - sh en web (sólo ENV=dev)'
	@echo '  ${YELLOW}make shell-admin${RESET} - sh en admin (sólo ENV=dev)'
	@echo '  ${YELLOW}make ckan-exec CMD="..."${RESET} - Ejecuta un comando ckan en el contenedor. Ej: make ckan-exec CMD="ckan generate extension"'
	@echo '  ${YELLOW}make bucket-ls [PREFIX=datos-abiertos/]${RESET} - Lista archivos del bucket S3/SeaweedFS en consola'
	@echo '  ${YELLOW}make import-data SCRIPT=api/scripts/import_reportes_data.py SOURCE=api/scripts/examples/reportes_import_example.csv${RESET} - Ejecuta un importador genérico'
	@echo '  ${YELLOW}make import-one MODEL=mapa FILE=api/scripts/examples/mapa_import_example.csv${RESET} - Importa un archivo individual usando scripts/import_<modelo>.py'
	@echo '  ${YELLOW}make import-mapa FILE=api/scripts/examples/mapa_import_example.csv${RESET} - Importa un archivo individual para mapa'
	@echo '  ${YELLOW}make import-reportes SOURCE=api/scripts/examples/reportes_import_example.csv${RESET} - Alias para el importador de reportes'
	@echo '  ${YELLOW}make import-posts SOURCE=api/scripts/examples/posts_import_example.csv${RESET} - Alias para el importador de posts'
	@echo '  ${YELLOW}make install-api-dep DEP=python-slugify${RESET} - Instala una dependencia Python en el contenedor api'
	@echo '  ${YELLOW}make install-slugify${RESET} - Instala python-slugify en el contenedor api'
	@echo ''
	@echo '${GREEN}Setup inicial:${RESET}'
	@echo '  ${YELLOW}make setup${RESET}            - Crea .env.development y .env.production desde los .example si no existen'
	@echo ''
	@echo '${GREEN}Seed / Carga de datos de ejemplo (CSVs):${RESET}'
	@echo '  ${YELLOW}make seed${RESET}             - Importa los CSVs de examples/ en el contenedor api ya levantado'
	@echo '  ${YELLOW}make up-seed${RESET}          - Levanta el entorno E importa los CSVs al iniciar'
	@echo '  ${YELLOW}make build-seed${RESET}       - Reconstruye el entorno E importa los CSVs al iniciar'
	@echo '  ${YELLOW}make up-seed-prod${RESET}         - Igual que up-seed con ENV=prod'
	@echo '  ${YELLOW}make build-seed-prod${RESET}      - Igual que build-seed con ENV=prod'
	@echo '  ${YELLOW}make up-seed-prod-local${RESET}   - Igual que up-seed con ENV=prod-local'
	@echo '  ${YELLOW}make build-seed-prod-local${RESET} - Igual que build-seed con ENV=prod-local'
	@echo '  ${YELLOW}make up-seed-gcp${RESET}          - Igual que up-seed con ENV=gcp'
	@echo '  ${YELLOW}make build-seed-gcp${RESET}       - Igual que build-seed con ENV=gcp'
	@echo '  Opciones opcionales: ${YELLOW}MODE=upsert|insert  DRY_RUN=1  ONLY=page,menu_item  SKIP=mapa${RESET}'
	@echo ''

up:
	@echo "${GREEN}Iniciando entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d

build:
	@echo "${GREEN}Reconstruyendo entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d --build

rebuild:
	@echo "${GREEN}Reconstruyendo SIN caché: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) build --no-cache
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d

down:
	@echo "${YELLOW}Deteniendo entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) down

TAIL ?= 100
SVC  ?=

logs:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) logs -f --tail=$(TAIL) $(SVC)

prune:
	@echo "${YELLOW}Limpiando caché de Docker (build cache, imágenes colgantes)...${RESET}"
	docker builder prune -f
	@echo "${GREEN}Caché eliminada.${RESET}"

prune-all:
	@echo "${RED}Limpieza total: imágenes, volúmenes y caché de build...${RESET}"
	docker system prune -af --volumes
	@echo "${GREEN}Sistema Docker limpiado.${RESET}"

restart: down up

deploy:
	@echo "${GREEN}Desplegando con ENV=$(DEPLOY_ENV)${RESET}"
	@branch=$$(git branch --show-current 2>/dev/null); \
	upstream=$$(git rev-parse --abbrev-ref '@{u}' 2>/dev/null); \
	if [ -z "$$upstream" ]; then \
		echo "${YELLOW}Git: $$branch sin upstream, se despliega el árbol actual${RESET}"; \
	else \
		git fetch --quiet; \
		base=$$(git merge-base HEAD '@{u}'); \
		local_sha=$$(git rev-parse HEAD); \
		remote_sha=$$(git rev-parse '@{u}'); \
		if [ "$$base" != "$$local_sha" ] && [ "$$base" != "$$remote_sha" ]; then \
			echo "${RED}Git: $$branch divergió de $$upstream, resuélvelo antes de desplegar${RESET}"; \
			exit 1; \
		fi; \
		if git merge --ff-only --quiet '@{u}' 2>/dev/null; then \
			echo "${GREEN}Git: $$branch actualizado desde $$upstream${RESET}"; \
		else \
			echo "${YELLOW}Git: $$branch sin actualizar, se despliega el árbol actual${RESET}"; \
		fi; \
	fi
	$(MAKE) build ENV=$(DEPLOY_ENV)

_up-prod:
	$(MAKE) up ENV=$(DEPLOY_ENV)

up-prod-local:
	$(MAKE) up ENV=prod-local

down-prod-local:
	$(MAKE) down ENV=prod-local

restart-prod-local:
	$(MAKE) restart ENV=prod-local

clean:
	@echo "${RED}⚠ Esto borra contenedores, redes y volúmenes de BD de TODOS los modos (dev/prod/gcp).${RESET}"
	@echo "${RED}  Se perderán datos de Postgres, CKAN-db, Redis y Solr.${RESET}"
	@echo "${GREEN}  Se CONSERVAN: SeaweedFS (buckets/acervo), CKAN storage y node_modules.${RESET}"
	@if [ "$(FORCE)" != "1" ]; then \
		printf "Escribe ${YELLOW}yes${RESET} para confirmar: "; \
		read confirm; \
		[ "$$confirm" = "yes" ] || { echo "${YELLOW}Cancelado.${RESET}"; exit 1; }; \
	fi
	@echo "${YELLOW}Deteniendo contenedores (sin borrar volúmenes)...${RESET}"
	-docker compose --env-file .env.development -f docker-compose.dev.yml down --remove-orphans
	-docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.gcp.yml down --remove-orphans
	-docker compose --env-file .env.production -f docker-compose.yml down --remove-orphans
	@echo "${YELLOW}Eliminando volúmenes de base de datos...${RESET}"
	-docker volume rm portal_postgres_data_dev portal_redis_data_dev portal_ckan_db_data_dev portal_ckan_solr_data_dev 2>/dev/null
	-docker volume rm portal_postgres_data portal_redis_data portal_ckan_db_data portal_ckan_solr_data 2>/dev/null
	@echo "${GREEN}Limpieza completada. Los buckets (SeaweedFS/acervo) y CKAN storage se conservaron.${RESET}"

shell-api:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec api /bin/bash

shell-ckan:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec ckan /bin/bash

shell-web:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec web /bin/sh

shell-admin:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec admin /bin/sh

ckan-exec:
	@test -n "$(CMD)" || { echo "${RED}Uso: make ckan-exec CMD=\"ckan generate extension\"${RESET}"; exit 1; }
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec ckan $(CMD)

bucket-ls:
	@echo "${GREEN}Listando bucket ($(MSG_ENV))...${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec -T api python -c "import boto3, os; ep = os.environ.get('ACERVO_S3_URL') or ('http://' + os.environ.get('ACERVO_ENDPOINT')); bucket = os.environ.get('ACERVO_BUCKET_NAME'); prefix = os.environ.get('PREFIX', 'datos-abiertos/'); s3 = boto3.client('s3', endpoint_url=ep, aws_access_key_id=os.environ.get('ACERVO_ACCESS_KEY'), aws_secret_access_key=os.environ.get('ACERVO_SECRET_KEY'), verify=False); res = s3.list_objects_v2(Bucket=bucket, Prefix=prefix, MaxKeys=200); objs = res.get('Contents', []); print(f'Bucket: {bucket}'); print(f'Endpoint: {ep}'); print(f'Prefix: {prefix}'); print('---'); [print(f\"{o['LastModified']} | {o['Size']:>10} | {o['Key']}\") for o in objs] if objs else print('Sin archivos para ese prefijo')" \
		PREFIX="$(PREFIX)"

import-data:
	@test -n "$(SCRIPT)" || { echo "${RED}Uso: make import-data SCRIPT=api/scripts/importador.py SOURCE=api/scripts/examples/datos.csv [ENV=dev|prod|gcp] [MODE=upsert|insert] [LIMIT=10] [DRY_RUN=1] [ARGS='--flag valor']${RESET}"; exit 1; }
	@test -n "$(SOURCE)" || { echo "${RED}Uso: make import-data SCRIPT=api/scripts/importador.py SOURCE=api/scripts/examples/datos.csv [ENV=dev|prod|gcp] [MODE=upsert|insert] [LIMIT=10] [DRY_RUN=1] [ARGS='--flag valor']${RESET}"; exit 1; }
	@echo "${GREEN}Ejecutando importador $(SCRIPT) en $(MSG_ENV) con fuente $(SOURCE)...${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec -T api python $(patsubst api/%,%,$(SCRIPT)) $(patsubst api/%,%,$(SOURCE)) $(if $(MODE),--mode $(MODE),) $(if $(LIMIT),--limit $(LIMIT),) $(if $(DRY_RUN),--dry-run,) $(ARGS)

import-one:
	@test -n "$(MODEL)" || { echo "${RED}Uso: make import-one MODEL=mapa FILE=api/scripts/examples/mapa_import_example.csv [ENV=dev|prod|gcp] [MODE=upsert|insert] [LIMIT=10] [DRY_RUN=1] [ARGS='--flag valor']${RESET}"; exit 1; }
	@test -n "$(FILE)" || { echo "${RED}Uso: make import-one MODEL=mapa FILE=api/scripts/examples/mapa_import_example.csv [ENV=dev|prod|gcp] [MODE=upsert|insert] [LIMIT=10] [DRY_RUN=1] [ARGS='--flag valor']${RESET}"; exit 1; }
	@test -f "api/scripts/import_$(MODEL).py" || { echo "${RED}No existe api/scripts/import_$(MODEL).py${RESET}"; exit 1; }
	@test -f "$(FILE)" || { echo "${RED}No existe el archivo de entrada: $(FILE)${RESET}"; exit 1; }
	@echo "${GREEN}Importando archivo individual ($(FILE)) con import_$(MODEL).py en $(MSG_ENV)...${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec -T api python scripts/import_$(MODEL).py $(patsubst api/%,%,$(FILE)) $(if $(MODE),--mode $(MODE),) $(if $(LIMIT),--limit $(LIMIT),) $(if $(DRY_RUN),--dry-run,) $(ARGS)

import-mapa:
	@test -n "$(FILE)" || { echo "${RED}Uso: make import-mapa FILE=api/scripts/examples/mapa_import_example.csv [ENV=dev|prod|gcp] [MODE=upsert|insert] [LIMIT=10] [DRY_RUN=1] [ARGS='--key-field slug']${RESET}"; exit 1; }
	@$(MAKE) import-one ENV=$(ENV) MODEL=mapa FILE=$(FILE) MODE=$(MODE) LIMIT=$(LIMIT) DRY_RUN=$(DRY_RUN) ARGS="$(if $(ARGS),$(ARGS),--key-field slug)"


install-api-dep:
	@test -n "$(DEP)" || { echo "${RED}Uso: make install-api-dep DEP=python-slugify [ENV=dev|prod|gcp]${RESET}"; exit 1; }
	@echo "${GREEN}Instalando dependencia Python $(DEP) en api ($(MSG_ENV))...${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec -T api pip install "$(DEP)"

install-slugify:
	@$(MAKE) install-api-dep ENV=$(ENV) DEP=python-slugify

import-reportes:
	@$(MAKE) import-data ENV=$(ENV) SCRIPT=api/scripts/import_reportes.py SOURCE=api/scripts/examples/reportes_import_example.csv MODE=$(MODE) DRY_RUN=$(DRY_RUN) ARGS=$(ARGS)

import-posts:
	@$(MAKE) import-data ENV=$(ENV) SCRIPT=api/scripts/import_posts.py SOURCE=api/scripts/examples/posts_import_example.csv MODE=$(MODE) DRY_RUN=$(DRY_RUN) ARGS=$(ARGS)

setup:
	@./scripts/init-env.sh

# ── Seed / Carga de datos de ejemplo ────────────────────────────────────────
# Construye los argumentos opcionales para import_all_examples.py
SEED_ARGS := --mode $(if $(MODE),$(MODE),upsert)
ifdef DRY_RUN
	SEED_ARGS += --dry-run
endif
ifdef ONLY
	SEED_ARGS += --only $(ONLY)
endif
ifdef SKIP
	SEED_ARGS += --skip $(SKIP)
endif

## seed: Ejecuta la importación de CSVs en el contenedor api ya levantado.
##       Útil cuando el ambiente está corriendo y quieres poblar/repoblar la BD.
##       Opciones: MODE=upsert|insert  DRY_RUN=1  ONLY=page,menu_item  SKIP=mapa
seed:
	@echo "${GREEN}Importando datos de ejemplo (CSVs) → $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec -T api \
		python scripts/import_all_examples.py $(SEED_ARGS)

## up-seed: Levanta el entorno (sin rebuild) y activa la carga de CSVs al iniciar.
up-seed:
	@echo "${GREEN}Levantando entorno con seed: $(MSG_ENV)${RESET}"
	SEED_EXAMPLES=true docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d

## build-seed: Reconstruye el entorno y activa la carga de CSVs al iniciar.
##             Equivalente a: SEED_EXAMPLES=true docker compose up --build
build-seed:
	@echo "${GREEN}Reconstruyendo entorno con seed: $(MSG_ENV)${RESET}"
	SEED_EXAMPLES=true docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d --build

## Atajos rápidos por entorno
up-seed-prod:
	$(MAKE) up-seed ENV=prod

build-seed-prod:
	$(MAKE) build-seed ENV=prod

up-seed-prod-local:
	$(MAKE) up-seed ENV=prod-local

build-seed-prod-local:
	$(MAKE) build-seed ENV=prod-local

up-seed-gcp:
	$(MAKE) up-seed ENV=gcp

build-seed-gcp:
	$(MAKE) build-seed ENV=gcp