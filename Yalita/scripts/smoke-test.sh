#!/bin/bash
API="${1:-http://localhost:3001}"
echo "=== Yalita Smoke Test ==="
echo "Target: $API"
echo ""
echo "1. Health check..."
curl -sf "$API/health" | jq .
echo ""
echo "2. Score endpoint (demo wallet)..."
curl -sf "$API/score?address=0xDEMO000000000000000000000000000000000001" | jq .score
echo ""
echo "3. Loans quote..."
curl -sf "$API/loans/quote?address=0xDEMO000000000000000000000000000000000001&principal=150000000&days=90" | jq .annualRateBps
echo ""
echo "=== Done ==="
