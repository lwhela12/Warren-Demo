#!/usr/bin/env bash
set -e
# Ngrok tunneling script
if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok not found. Please install ngrok before running this script."
  exit 1
fi
if [ -n "$NGROK_AUTH_TOKEN" ]; then
  ngrok config add-authtoken "$NGROK_AUTH_TOKEN" 2>/dev/null || true
fi
echo "Starting ngrok tunnel on http://localhost:3000"
ngrok http 3000