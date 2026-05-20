# Makefile para IIEG Portal
# Gestiona comandos de desarrollo y producción para Docker Compose

GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

# Entorno por defecto: dev
ENV ?= dev

# Configuración según entorno
# - dev:  desarrollo local (acervo y todo en la misma máquina via iieg-network)
# - prod: producción "administración" (servidor aislado, acervo accedido por URL pública)
# - gcp:  producción "GCP" (todo en la misma VM, base + overlay iieg-network)
ifeq ($(ENV),prod)
	COMPOSE_FILES := -f docker-compose.yml
	ENV_FILE      := .env.production
	MSG_ENV       := Producción (administración)
else ifeq ($(ENV),gcp)
	COMPOSE_FILES := -f docker-compose.yml -f docker-compose.gcp.yml
	ENV_FILE      := .env.production
	MSG_ENV       := Producción (GCP)
else
	COMPOSE_FILES := -f docker-compose.dev.yml
	ENV_FILE      := .env.development
	MSG_ENV       := Desarrollo
endif

.PHONY: help up build down logs restart clean shell-api shell-web shell-admin shell-ckan setup

help:
	@echo ''
	@echo '${YELLOW}IIEG Portal - Comandos disponibles${RESET}'
	@echo ''
	@echo 'Uso: ${YELLOW}make <comando> [ENV=dev|prod|gcp]${RESET} (por defecto ENV=dev)'
	@echo ''
	@echo '${GREEN}Entornos:${RESET}'
	@echo '  ${YELLOW}dev${RESET}   - Desarrollo local (acervo en misma máquina via iieg-network)'
	@echo '  ${YELLOW}prod${RESET}  - Producción administración (servidor aislado, acervo por URL pública)'
	@echo '  ${YELLOW}gcp${RESET}   - Producción GCP (todo en una VM, conecta a iieg-network)'
	@echo ''
	@echo '${GREEN}Comandos:${RESET}'
	@echo '  ${YELLOW}make up${RESET}          - Inicia el entorno (en segundo plano)'
	@echo '  ${YELLOW}make build${RESET}       - Reconstruye e inicia el entorno'
	@echo '  ${YELLOW}make down${RESET}        - Detiene los contenedores'
	@echo '  ${YELLOW}make logs${RESET}        - Muestra logs en tiempo real'
	@echo '  ${YELLOW}make restart${RESET}     - Reinicia el entorno'
	@echo '  ${YELLOW}make clean${RESET}       - Borra contenedores, redes y volúmenes (pide confirmación, FORCE=1 lo salta)'
	@echo ''
	@echo '${GREEN}Shells (entran al contenedor del ENV actual):${RESET}'
	@echo '  ${YELLOW}make shell-api${RESET}   - bash en api'
	@echo '  ${YELLOW}make shell-ckan${RESET}  - bash en ckan'
	@echo '  ${YELLOW}make shell-web${RESET}   - sh en web (sólo ENV=dev)'
	@echo '  ${YELLOW}make shell-admin${RESET} - sh en admin (sólo ENV=dev)'
	@echo ''
	@echo '${GREEN}Setup inicial:${RESET}'
	@echo '  ${YELLOW}make setup${RESET}       - Crea .env.development y .env.production desde los .example si no existen'
	@echo ''

up:
	@echo "${GREEN}Iniciando entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d

build:
	@echo "${GREEN}Reconstruyendo entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) up -d --build

down:
	@echo "${YELLOW}Deteniendo entorno: $(MSG_ENV)${RESET}"
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) down

logs:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) logs -f

restart: down up

clean:
	@echo "${RED}⚠ Esto borra contenedores, redes y volúmenes de TODOS los modos (dev/prod/gcp).${RESET}"
	@echo "${RED}  Se perderán datos de Postgres, CKAN-db, Redis, Solr, SeaweedFS y Media.${RESET}"
	@if [ "$(FORCE)" != "1" ]; then \
		printf "Escribe ${YELLOW}yes${RESET} para confirmar: "; \
		read confirm; \
		[ "$$confirm" = "yes" ] || { echo "${YELLOW}Cancelado.${RESET}"; exit 1; }; \
	fi
	-docker compose --env-file .env.development -f docker-compose.dev.yml down -v --remove-orphans
	-docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.gcp.yml down -v --remove-orphans
	-docker compose --env-file .env.production -f docker-compose.yml down -v --remove-orphans

shell-api:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec api /bin/bash

shell-ckan:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec ckan /bin/bash

shell-web:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec web /bin/sh

shell-admin:
	docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES) exec admin /bin/sh

setup:
	@./scripts/init-env.sh
