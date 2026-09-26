#!/usr/bin/env bash
# SolvedIn6 PE Exam Practice Study Portal Launcher
# Starts the background node service and opens the study portal bookmark in the browser

PORT=3000
BOOKMARK_URL="http://localhost:${PORT}/#bookmarks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Ensure systemd user service is running if systemctl is available
if command -v systemctl >/dev/null 2>&1; then
    if ! systemctl --user is-active --quiet pe-water-resources.service 2>/dev/null; then
        systemctl --user start pe-water-resources.service 2>/dev/null || true
    fi
fi

# Wait for server to become responsive on port 3000
SERVER_READY=false
for i in {1..20}; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}" 2>/dev/null | grep -q "200"; then
        SERVER_READY=true
        break
    fi
    sleep 0.4
done

# Fallback: if server is not up via systemd, launch node server directly
if [ "$SERVER_READY" = false ]; then
    NODE_BIN="$(which node 2>/dev/null || echo "/home/artwalk/.nvm/versions/node/v20.20.2/bin/node")"
    if [ -x "$NODE_BIN" ]; then
        cd "$PROJECT_DIR"
        "$NODE_BIN" server.js > /tmp/pe-water-resources.log 2>&1 &
        sleep 1.5
    fi
fi

# Set DISPLAY if missing and available in standard X11 session
if [ -z "$DISPLAY" ]; then
    export DISPLAY=:1
fi

# Launch the bookmark URL in default browser
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$BOOKMARK_URL" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox "$BOOKMARK_URL" >/dev/null 2>&1 &
elif command -v google-chrome >/dev/null 2>&1; then
    google-chrome "$BOOKMARK_URL" >/dev/null 2>&1 &
fi

echo "SolvedIn6 PE Exam Portal started with bookmark: ${BOOKMARK_URL}"
