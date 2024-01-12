#!/usr/bin/env bash

export EPIVAR_UID=$UID
docker system prune -a
docker compose pull
