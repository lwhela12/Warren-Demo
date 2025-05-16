#!/usr/bin/env bash
set -e
# MailHog startup script: downloads binary if needed, then runs it
BIN_DIR="$(cd "$(dirname "$0")" && pwd)"
MAILHOG_BIN="$BIN_DIR/mailhog_bin"
if [ ! -f "$MAILHOG_BIN" ]; then
  echo "Downloading MailHog..."
  curl -sSL -o "$MAILHOG_BIN" \
    "https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64"
  chmod +x "$MAILHOG_BIN"
fi
echo "Starting MailHog on SMTP ${MAILHOG_SMTP_HOST:-localhost}:${MAILHOG_SMTP_PORT:-1025}, HTTP port ${MAILHOG_HTTP_PORT:-8025}" 
"$MAILHOG_BIN" \
  --smtp-bind-addr "${MAILHOG_SMTP_HOST:-localhost}:${MAILHOG_SMTP_PORT:-1025}" \
  --api-bind-addr "0.0.0.0:${MAILHOG_HTTP_PORT:-8025}"