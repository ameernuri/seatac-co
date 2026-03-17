#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST="${1:?Usage: ./scripts/deploy-next-vps.sh <host-or-ip> [user] }"
REMOTE_USER="${2:-root}"
REMOTE="${REMOTE_USER}@${HOST}"
REMOTE_DIR="/home/deploy/pierlimo-next"
SSH_KEY="${PIERLIMO_SSH_KEY:-/Users/ameer/.ssh/do_digitalocean_ed25519}"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -i "$SSH_KEY")

if [[ ! -f deploy/.env.production ]]; then
  echo "Missing deploy/.env.production"
  exit 1
fi

echo "Syncing Next app to ${REMOTE}..."
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude '.DS_Store' \
  --exclude '.env' \
  --exclude 'node_modules' \
  --exclude '.next' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo "Starting Postgres..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p ${REMOTE_DIR} && cd ${REMOTE_DIR} && docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml up -d db"

echo "Running schema push and seed..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "cd ${REMOTE_DIR} && docker run --rm --network pierlimo-next_default --env-file deploy/.env.production -v ${REMOTE_DIR}:/app -w /app node:22-alpine sh -lc 'npm ci && npm run db:push && npm run db:seed'"

echo "Building and starting Next app..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "cd ${REMOTE_DIR} && docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml up -d --build app"

echo "Installing nginx config..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "sudo cp ${REMOTE_DIR}/deploy/nginx/next-pierlimo.conf /etc/nginx/sites-available/next-pierlimo.conf && sudo ln -sfn /etc/nginx/sites-available/next-pierlimo.conf /etc/nginx/sites-enabled/next-pierlimo.conf && sudo nginx -t && sudo systemctl reload nginx"

echo "Deployment complete. Issue or renew TLS with certbot for next.pierlimo.com once DNS points to ${HOST}."
