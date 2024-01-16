#!/usr/bin/env bash

export EPIVAR_UID=$UID
docker system prune -a -f
docker compose pull
