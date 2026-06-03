#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Samagama — Local Start Script
#  Usage:  ./start.sh          (normal start)
#          ./start.sh --seed   (reset DB + seed sample data, then start)
#          ./start.sh --clean  (kill existing processes on ports 5001/5173)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
LOG_DIR="$ROOT_DIR/.logs"
SERVER_LOG="$LOG_DIR/server.log"
CLIENT_LOG="$LOG_DIR/client.log"
MONGO_LOG="$LOG_DIR/mongo.log"
PID_FILE="$ROOT_DIR/.samagama.pids"

SEED=false
CLEAN=false
SEED_VINS=false

# ── Parse args ────────────────────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --seed)       SEED=true       ;;
    --seed-vins)  SEED_VINS=true  ;;
    --clean)      CLEAN=true      ;;
    --help)
      echo -e "${BOLD}Samagama start script${NC}"
      echo "  ./start.sh                Start everything"
      echo "  ./start.sh --seed         Seed the database first, then start"
      echo "  ./start.sh --seed-vins    Add VINS FAQs to DB (requires --seed first run)"
      echo "  ./start.sh --clean        Kill processes on ports 5001/5173 first"
      exit 0
      ;;
  esac
done

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ██╗    ██╗██╗███████╗███████╗███████╗██╗      ██████╗ ██╗    ██╗"
echo "  ██║    ██║██║██╔════╝██╔════╝██╔════╝██║     ██╔═══██╗██║    ██║"
echo "  ██║ █╗ ██║██║███████╗█████╗  █████╗  ██║     ██║   ██║██║ █╗ ██║"
echo "  ██║███╗██║██║╚════██║██╔══╝  ██╔══╝  ██║     ██║   ██║██║███╗██║"
echo "  ╚███╔███╔╝██║███████║███████╗██║     ███████╗╚██████╔╝╚███╔███╔╝"
echo "   ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ "
echo -e "${NC}"
echo -e "${BOLD}  Community FAQ Platform — Local Dev Server${NC}"
echo -e "  ${BLUE}http://localhost:5173${NC} (client)   ${BLUE}http://localhost:5001${NC} (API)"
echo ""

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "  ${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "  ${GREEN}[  OK]${NC}  $1"; }
warn()    { echo -e "  ${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "  ${RED}[FAIL]${NC}  $1"; exit 1; }

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "'$1' is not installed. $2"
  fi
}

port_in_use() { lsof -ti tcp:"$1" &>/dev/null; }

kill_port() {
  local port=$1
  if port_in_use "$port"; then
    warn "Killing existing process on port $port..."
    lsof -ti tcp:"$port" | xargs kill -9 2>/dev/null || true
    sleep 0.5
  fi
}

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down Samagama..."
  if [[ -f "$PID_FILE" ]]; then
    while IFS= read -r pid; do
      kill "$pid" 2>/dev/null || true
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi
  # Stop local mongod if we started it
  if [[ "${MONGO_STARTED:-false}" == "true" ]]; then
    info "Stopping local MongoDB..."
    mongod --shutdown --dbpath "$ROOT_DIR/.mongo/data" &>/dev/null || pkill -x mongod 2>/dev/null || true
  fi
  echo -e "  ${GREEN}Goodbye!${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# ── Prerequisite checks ───────────────────────────────────────────────────────
echo -e "${BOLD}── Prerequisites ────────────────────────────────────────${NC}"

check_cmd "node" "Install from https://nodejs.org"
check_cmd "npm"  "Install from https://nodejs.org"

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VER" -lt 18 ]]; then
  error "Node.js v18+ required. Current: $(node -v)"
fi
success "Node.js $(node -v)"

# ── Clean ports if requested ──────────────────────────────────────────────────
if $CLEAN; then
  kill_port 5001
  kill_port 5173
fi

# ── Check/start MongoDB ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}── MongoDB ──────────────────────────────────────────────${NC}"
MONGO_STARTED=false

if mongosh --quiet --eval "db.adminCommand('ping')" &>/dev/null 2>&1; then
  success "MongoDB already running at mongodb://localhost:27017"
elif mongod --version &>/dev/null 2>&1; then
  # MongoDB installed but not running — start it locally
  MONGO_DATA="$ROOT_DIR/.mongo/data"
  mkdir -p "$MONGO_DATA"
  mkdir -p "$LOG_DIR"
  info "Starting local MongoDB (data: .mongo/data)..."
  mongod --dbpath "$MONGO_DATA" \
         --logpath "$MONGO_LOG" \
         --fork \
         --port 27017 \
         --quiet
  sleep 2
  if mongosh --quiet --eval "db.adminCommand('ping')" &>/dev/null 2>&1; then
    success "MongoDB started (log: .logs/mongo.log)"
    MONGO_STARTED=true
  else
    error "MongoDB failed to start. Check .logs/mongo.log"
  fi
else
  warn "MongoDB not found locally."
  warn "Make sure MONGODB_URI in server/.env points to a running instance (Atlas, Docker, etc.)"
  info  "Continuing — the server will fail if MongoDB is unreachable."
fi

# ── Install dependencies ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}── Dependencies ─────────────────────────────────────────${NC}"

install_if_needed() {
  local dir=$1
  local label=$2
  if [[ ! -d "$dir/node_modules" ]]; then
    info "Installing $label dependencies..."
    npm install --prefix "$dir" --silent
    success "$label dependencies installed"
  else
    success "$label dependencies already installed"
  fi
}

install_if_needed "$SERVER_DIR" "Server"
install_if_needed "$CLIENT_DIR" "Client"

# ── Seed (optional) ───────────────────────────────────────────────────────────
if $SEED; then
  echo ""
  echo -e "${BOLD}── Database Seed ────────────────────────────────────────${NC}"
  info "Seeding database with sample data..."
  cd "$SERVER_DIR"
  npx ts-node src/scripts/seed.ts
  cd "$ROOT_DIR"
  echo ""
  echo -e "  ${GREEN}${BOLD}Seed complete! Admin credentials:${NC}"
  echo -e "  ${CYAN}  Email:    admin@samagama.dev${NC}"
  echo -e "  ${CYAN}  Password: admin123${NC}"
fi

# ── Seed VINS FAQs (optional) ─────────────────────────────────────────────────
if $SEED_VINS; then
  echo ""
  echo -e "${BOLD}── VINS FAQ Seed ────────────────────────────────────────${NC}"

  info "Seeding VINS FAQs..."
  cd "$SERVER_DIR"
  npx ts-node src/scripts/seed-vins-faqs.ts
  cd "$ROOT_DIR"
fi

# ── Create log dir ────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
> "$PID_FILE"

# ── Start Server ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}── Starting Services ────────────────────────────────────${NC}"

if port_in_use 5001; then
  warn "Port 5001 still in use after clean. Killing again..."
  kill_port 5001
  sleep 1
fi
info "Starting API server on http://localhost:5001 ..."
cd "$SERVER_DIR"
npm run dev > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" >> "$PID_FILE"
cd "$ROOT_DIR"

# Wait for server to be ready (up to 20 s)
TIMEOUT=20; ELAPSED=0
printf "  [INFO]  Waiting for server"
while ! curl -sf http://localhost:5001/health &>/dev/null; do
  printf "."
  sleep 1; ELAPSED=$((ELAPSED+1))
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    echo ""
    error "Server didn't start in ${TIMEOUT}s. Check .logs/server.log"
  fi
done
echo ""
success "API server ready  → http://localhost:5001"

# ── Start Client ──────────────────────────────────────────────────────────────
if port_in_use 5173; then
  warn "Port 5173 still in use after clean. Killing again..."
  kill_port 5173
  sleep 1
fi
info "Starting Vite client on http://localhost:5173 ..."
cd "$CLIENT_DIR"
npm run dev -- --host 0.0.0.0 > "$CLIENT_LOG" 2>&1 &
CLIENT_PID=$!
echo "$CLIENT_PID" >> "$PID_FILE"
cd "$ROOT_DIR"

# Wait for Vite to be ready (up to 20 s)
TIMEOUT=20; ELAPSED=0
printf "  [INFO]  Waiting for client"
while ! curl -sf http://localhost:5173 &>/dev/null; do
  printf "."
  sleep 1; ELAPSED=$((ELAPSED+1))
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    echo ""
    error "Vite dev server didn't start in ${TIMEOUT}s. Check .logs/client.log"
  fi
done
echo ""
success "Client ready      → http://localhost:5173"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  ✓  Samagama is running!${NC}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}  ${CYAN}http://localhost:5173${NC}"
echo -e "  ${BOLD}API:${NC}       ${CYAN}http://localhost:5001${NC}"
echo -e "  ${BOLD}Health:${NC}    ${CYAN}http://localhost:5001/health${NC}"
echo ""
echo -e "  ${BOLD}Logs:${NC}"
echo -e "    Server → ${YELLOW}.logs/server.log${NC}"
echo -e "    Client → ${YELLOW}.logs/client.log${NC}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop everything."
echo ""

# ── Tail logs live ────────────────────────────────────────────────────────────
tail -f "$SERVER_LOG" "$CLIENT_LOG" &
TAIL_PID=$!
echo "$TAIL_PID" >> "$PID_FILE"

wait
