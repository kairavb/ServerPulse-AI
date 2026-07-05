#!/usr/bin/env bash
# Start the local RocketRide engine with a writable /opt/data volume.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT/.data/rocketride"
IMAGE="ghcr.io/rocketride-org/rocketride-engine:latest"
NAME="rocketride-engine"

mkdir -p "$DATA_DIR"
# Container runs as uid 999 — ensure the mount is writable (dev setup).
chmod 777 "$DATA_DIR"

# Stop any other container bound to 5565 (e.g. old runs without a volume).
while read -r cid; do
  [[ -z "$cid" ]] && continue
  echo "Stopping container on port 5565: $cid"
  docker rm -f "$cid" >/dev/null
done < <(docker ps -q --filter publish=5565)

docker rm -f "$NAME" 2>/dev/null || true

echo "Starting $NAME (first boot may take 1–2 minutes)..."
docker run -d --name "$NAME" -p 5565:5565 \
  -v "$DATA_DIR:/opt/data" \
  -v "$ROOT/backend/pipeline:/pipeline:ro" \
  --entrypoint ./engine \
  "$IMAGE" \
  --node_path=/pipeline ./ai/eaas.py --host=0.0.0.0

echo "Waiting for RocketRide to be ready..."
for _ in $(seq 1 40); do
  if docker logs "$NAME" 2>&1 | grep -q "Uvicorn running"; then
    echo "RocketRide is ready at http://localhost:5565"
    echo "Use ROCKETRIDE_APIKEY=MYAPIKEY in backend/.env"
    exit 0
  fi
  sleep 3
done

echo "RocketRide is still starting. Check: docker logs -f $NAME"
exit 0
