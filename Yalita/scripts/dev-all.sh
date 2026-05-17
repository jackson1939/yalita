#!/usr/bin/env bash
# Levanta anvil local + backend + frontend en paralelo

set -e
trap "kill 0" EXIT

echo "🔗 Iniciando anvil (chain local)..."
anvil --host 0.0.0.0 &

sleep 2

echo "⛓️  Desplegando contratos en anvil..."
cd contracts && pnpm deploy:local && cd ..

echo "🚀 Levantando frontend + backend..."
pnpm dev
