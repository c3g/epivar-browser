# EpiVar Browser - Production instance

TODO

## Importing Data

Setting up `EPIVAR_UID` environment variable before working:

```bash
export EPIVAR_UID=$UID
```

Genes and gene-peak pairs:

```bash
docker compose exec -iT epivar-node-1-server node ./scripts/import-genes.mjs < /opt/epivar/input-files/flu-infection-gene-peaks.csv
docker compose exec -iT epivar-node-2-server node ./scripts/import-genes.mjs < TODO
```

Peaks:

```bash
docker compose exec epivar-node-1-server node ./scripts/import-peaks.js
docker compose exec epivar-node-2-server node ./scripts/import-peaks.js
```

Calculate summary data:

```bash
docker compose exec epivar-node-1-server node ./scripts/calculate-peak-groups.mjs
docker compose exec epivar-node-2-server node ./scripts/calculate-peak-groups.mjs

docker compose exec epivar-node-1-server node ./scripts/calculate-top-peaks.mjs
docker compose exec epivar-node-2-server node ./scripts/calculate-top-peaks.mjs
```

## Clearing cache

All cache:

```bash
docker compose exec epivar-node-1-server node ./scripts/clear-cache.mjs
docker compose exec epivar-node-2-server node ./scripts/clear-cache.mjs
```

Values cache:

```bash
docker compose exec epivar-node-1-server node ./scripts/clear-values-cache.mjs
docker compose exec epivar-node-2-server node ./scripts/clear-values-cache.mjs
```
