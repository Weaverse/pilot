#!/bin/bash
# autoperf - Autonomous performance optimization loop for Pilot theme
# Usage: ./autoperf/run.sh [--max-experiments 50] [--port 3456]

set -euo pipefail

PILOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AUTOPERF_DIR="$PILOT_DIR/autoperf"
RESULTS_FILE="$AUTOPERF_DIR/results.json"
BASELINE_FILE="$AUTOPERF_DIR/baseline.json"
LOG_FILE="$AUTOPERF_DIR/run.log"
MAX_EXPERIMENTS=50
PORT=3457  # Different from dev port
LIGHTHOUSE_TIMEOUT=60
BUILD_TIMEOUT=180
PAGES=("http://localhost:$PORT/" "http://localhost:$PORT/products/pack-it-down-vest?Color=Slate+Brown&Size=XS" "http://localhost:$PORT/collections/all")
BRANCH="autoperf/experiments"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --max-experiments) MAX_EXPERIMENTS="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
die() { log "FATAL: $*"; exit 1; }

# -------------------------------------------------------------------
# 1. Setup
# -------------------------------------------------------------------
cd "$PILOT_DIR"
log "=== autoperf starting ==="
log "Dir: $PILOT_DIR"
log "Max experiments: $MAX_EXPERIMENTS"

# Ensure clean git state (tracked files only)
if [[ -n "$(git diff --name-only HEAD)" ]]; then
  die "Working directory not clean. Commit or stash changes first."
fi

# Create experiment branch from current HEAD
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git checkout -B "$BRANCH" 2>/dev/null
log "On branch: $BRANCH (forked from $ORIGINAL_BRANCH)"

# Init results
echo '[]' > "$RESULTS_FILE"

# -------------------------------------------------------------------
# 2. Helper: Build + Serve + Measure
# -------------------------------------------------------------------
kill_server() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    unset SERVER_PID
  fi
}
trap kill_server EXIT

build_project() {
  log "Building..."
  local start_ms=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
  if ! timeout "$BUILD_TIMEOUT" npm run build 2>&1 | tail -5 >> "$LOG_FILE"; then
    log "BUILD FAILED"
    return 1
  fi
  local end_ms=$(date +%s%3N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1000))')
  BUILD_TIME_MS=$(( end_ms - start_ms ))
  log "Build OK (${BUILD_TIME_MS}ms)"
  return 0
}

start_server() {
  log "Starting preview server on port $PORT..."
  npx shopify hydrogen preview --port "$PORT" &>/dev/null &
  SERVER_PID=$!
  # Wait for server to be ready
  local attempts=0
  while ! curl -s "http://localhost:$PORT/" > /dev/null 2>&1; do
    sleep 1
    attempts=$((attempts + 1))
    if [[ $attempts -ge 30 ]]; then
      log "Server failed to start"
      kill_server
      return 1
    fi
  done
  log "Server ready (pid $SERVER_PID)"
}

measure_lighthouse() {
  local url="$1"
  local output_file="$2"
  log "Lighthouse: $url"
  lighthouse "$url" \
    --output=json \
    --output-path="$output_file" \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --only-categories=performance \
    --throttling-method=simulate \
    --quiet 2>> "$LOG_FILE" || return 1
}

extract_metrics() {
  local json_file="$1"
  python3 -c "
import json, sys
with open('$json_file') as f:
    data = json.load(f)
perf = data.get('categories', {}).get('performance', {})
audits = data.get('audits', {})
print(json.dumps({
    'score': round(perf.get('score', 0) * 100, 1),
    'lcp_ms': audits.get('largest-contentful-paint', {}).get('numericValue', 0),
    'tbt_ms': audits.get('total-blocking-time', {}).get('numericValue', 0),
    'cls': audits.get('cumulative-layout-shift', {}).get('numericValue', 0),
    'fcp_ms': audits.get('first-contentful-paint', {}).get('numericValue', 0),
    'si_ms': audits.get('speed-index', {}).get('numericValue', 0),
}))
"
}

get_bundle_size() {
  find dist/client -name '*.js' -exec du -b {} + 2>/dev/null | awk '{s+=$1}END{print s}' || echo "0"
}

# -------------------------------------------------------------------
# 3. Capture baseline
# -------------------------------------------------------------------
log "=== Capturing baseline ==="
build_project || die "Baseline build failed"
start_server || die "Baseline server failed"

BASELINE_SCORES=()
for page in "${PAGES[@]}"; do
  page_name=$(echo "$page" | sed "s|http://localhost:$PORT||;s|/|_|g;s|^_||")
  [[ -z "$page_name" ]] && page_name="home"
  lh_file="$AUTOPERF_DIR/baseline_${page_name}.json"
  
  if measure_lighthouse "$page" "$lh_file"; then
    metrics=$(extract_metrics "$lh_file")
    log "Baseline $page_name: $metrics"
    BASELINE_SCORES+=("$metrics")
  else
    log "WARN: Lighthouse failed for $page_name, skipping"
  fi
done

BASELINE_BUNDLE_KB=$(( $(get_bundle_size) / 1024 ))
BASELINE_BUILD_MS=$BUILD_TIME_MS

# Save baseline
python3 -c "
import json
scores = [json.loads(s) for s in '''$(printf '%s\n' "${BASELINE_SCORES[@]}")'''.strip().split('\n')]
avg_score = sum(s['score'] for s in scores) / len(scores) if scores else 0
baseline = {
    'avg_score': round(avg_score, 1),
    'pages': scores,
    'bundle_size_kb': $BASELINE_BUNDLE_KB,
    'build_time_ms': $BASELINE_BUILD_MS,
    'commit': '$(git rev-parse HEAD)'
}
with open('$BASELINE_FILE', 'w') as f:
    json.dump(baseline, f, indent=2)
print(json.dumps(baseline, indent=2))
" | tee -a "$LOG_FILE"

kill_server
log "Baseline captured. Avg score: $(python3 -c "import json; print(json.load(open('$BASELINE_FILE'))['avg_score'])")"

# -------------------------------------------------------------------
# 4. Experiment loop
# -------------------------------------------------------------------
BEST_SCORE=$(python3 -c "import json; print(json.load(open('$BASELINE_FILE'))['avg_score'])")
EXPERIMENTS_RUN=0
EXPERIMENTS_KEPT=0

log "=== Starting experiment loop ==="

for i in $(seq 1 "$MAX_EXPERIMENTS"); do
  log "--- Experiment $i/$MAX_EXPERIMENTS (kept: $EXPERIMENTS_KEPT, best: $BEST_SCORE) ---"
  
  # Build history of what's been tried
  HISTORY=""
  if [[ -f "$RESULTS_FILE" ]] && [[ $(python3 -c "import json; print(len(json.load(open('$RESULTS_FILE'))))" 2>/dev/null) -gt 0 ]]; then
    HISTORY=$(python3 -c "
import json
results = json.load(open('$RESULTS_FILE'))
for r in results[-5:]:
    status = 'KEPT' if r.get('kept') else 'REVERTED'
    print(f\"- Experiment {r['id']}: {r.get('description','?')} → score {r.get('score','?')} ({status})\")
")
  fi

  # Ask Claude Code to make ONE optimization
  PROMPT="You are optimizing the Weaverse Pilot Hydrogen theme for web performance.

Current best Lighthouse performance score: $BEST_SCORE/100
Baseline score: $(python3 -c "import json; print(json.load(open('$BASELINE_FILE'))['avg_score'])")/100
Bundle size: ${BASELINE_BUNDLE_KB}KB client JS

Recent experiments:
$HISTORY

Make exactly ONE targeted change to improve performance. Focus areas:
- Code splitting / lazy loading (React.lazy, dynamic imports)
- Bundle size reduction (tree-shaking, lighter alternatives)
- Image optimization (lazy loading, sizes, fetchpriority)
- CSS optimization (critical CSS, removing unused styles)
- Hydration strategy (defer non-critical hydration)
- SSR optimization (streaming, caching)
- Font loading (display: swap, preload)
- Third-party script loading (defer, async)

Rules:
- Only edit files in: app/sections/, app/components/, app/routes/, vite.config.ts, server.ts, app/root.tsx
- Make ONE change per experiment (small, testable)
- Do NOT break existing functionality
- Write a clear git commit message explaining the change
- After making the change, run: git add -A && git commit -m 'your message'

Do NOT modify: package.json, .env, autoperf/, node_modules/"

  # Run Claude Code for this experiment
  if command -v claude &>/dev/null; then
    log "Running Claude Code..."
    timeout 300 claude --dangerously-skip-permissions -p "$PROMPT" 2>> "$LOG_FILE" || {
      log "Claude Code failed or timed out, skipping"
      git checkout -- . 2>/dev/null
      continue
    }
  else
    log "ERROR: claude CLI not found. Install Claude Code first."
    exit 1
  fi

  # Check if agent made a commit
  LATEST_COMMIT=$(git log -1 --format="%H")
  COMMIT_MSG=$(git log -1 --format="%s")
  
  if [[ "$LATEST_COMMIT" == "$(python3 -c "import json; print(json.load(open('$BASELINE_FILE'))['commit'])")" ]] && [[ $EXPERIMENTS_KEPT -eq 0 ]]; then
    log "No new commit detected, agent may not have made changes. Skipping."
    continue
  fi
  
  EXPERIMENTS_RUN=$((EXPERIMENTS_RUN + 1))

  # Build
  if ! build_project; then
    log "Build failed. Reverting."
    git revert --no-edit HEAD 2>/dev/null || git reset --hard HEAD~1
    continue
  fi

  # Start server + measure
  start_server || { log "Server start failed. Reverting."; git reset --hard HEAD~1; continue; }

  EXPERIMENT_SCORES=()
  for page in "${PAGES[@]}"; do
    page_name=$(echo "$page" | sed "s|http://localhost:$PORT||;s|/|_|g;s|^_||")
    [[ -z "$page_name" ]] && page_name="home"
    lh_file="$AUTOPERF_DIR/exp_${i}_${page_name}.json"
    
    if measure_lighthouse "$page" "$lh_file"; then
      metrics=$(extract_metrics "$lh_file")
      EXPERIMENT_SCORES+=("$metrics")
    fi
  done

  kill_server

  # Calculate average score
  if [[ ${#EXPERIMENT_SCORES[@]} -eq 0 ]]; then
    log "No Lighthouse results. Reverting."
    git reset --hard HEAD~1
    continue
  fi

  AVG_SCORE=$(python3 -c "
import json
scores = [json.loads(s) for s in '''$(printf '%s\n' "${EXPERIMENT_SCORES[@]}")'''.strip().split('\n')]
print(round(sum(s['score'] for s in scores) / len(scores), 1))
")
  
  CURRENT_BUNDLE_KB=$(( $(get_bundle_size) / 1024 ))

  log "Score: $AVG_SCORE (best: $BEST_SCORE) | Bundle: ${CURRENT_BUNDLE_KB}KB | Commit: $COMMIT_MSG"

  # Decide keep or revert
  KEEP=false
  if python3 -c "exit(0 if $AVG_SCORE > $BEST_SCORE else 1)"; then
    KEEP=true
    BEST_SCORE=$AVG_SCORE
    EXPERIMENTS_KEPT=$((EXPERIMENTS_KEPT + 1))
    log "✅ KEEPING (score improved: $AVG_SCORE > previous best)"
  else
    log "❌ REVERTING (score did not improve: $AVG_SCORE <= $BEST_SCORE)"
    git revert --no-edit HEAD 2>/dev/null || git reset --hard HEAD~1
  fi

  # Log result
  python3 -c "
import json
results = json.load(open('$RESULTS_FILE'))
results.append({
    'id': $i,
    'description': '''$COMMIT_MSG''',
    'score': $AVG_SCORE,
    'best_score': $BEST_SCORE,
    'bundle_kb': $CURRENT_BUNDLE_KB,
    'build_time_ms': $BUILD_TIME_MS,
    'kept': $( [[ "$KEEP" == "true" ]] && echo "True" || echo "False"),
    'commit': '$LATEST_COMMIT'
})
with open('$RESULTS_FILE', 'w') as f:
    json.dump(results, f, indent=2)
"

done

# -------------------------------------------------------------------
# 5. Summary
# -------------------------------------------------------------------
log "=== autoperf complete ==="
log "Experiments run: $EXPERIMENTS_RUN"
log "Experiments kept: $EXPERIMENTS_KEPT"
log "Baseline score: $(python3 -c "import json; print(json.load(open('$BASELINE_FILE'))['avg_score'])")"
log "Final best score: $BEST_SCORE"
log "Results: $RESULTS_FILE"
log "Branch: $BRANCH"

python3 -c "
import json
baseline = json.load(open('$BASELINE_FILE'))
results = json.load(open('$RESULTS_FILE'))
kept = [r for r in results if r.get('kept')]
print()
print('=== SUMMARY ===')
print(f\"Baseline: {baseline['avg_score']}\")
print(f\"Final: $BEST_SCORE\")
print(f\"Improvement: {round($BEST_SCORE - baseline['avg_score'], 1)} points\")
print(f\"Experiments: {len(results)} run, {len(kept)} kept\")
if kept:
    print()
    print('Kept changes:')
    for k in kept:
        print(f\"  ✅ #{k['id']}: {k['description']} (score: {k['score']})\")
"

log "Done. Review changes on branch '$BRANCH' and merge what you like."
