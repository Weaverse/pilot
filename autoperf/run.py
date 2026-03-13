#!/usr/bin/env python3
"""autoperf — Autonomous performance optimization loop for Pilot theme.

Usage: python3 autoperf/run.py [--max-experiments 5] [--port 3457]
"""

import argparse
import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────
PILOT_DIR = Path(__file__).resolve().parent.parent
AUTOPERF_DIR = PILOT_DIR / "autoperf"
RESULTS_FILE = AUTOPERF_DIR / "results.json"
BASELINE_FILE = AUTOPERF_DIR / "baseline.json"
LOG_FILE = AUTOPERF_DIR / "run.log"
BRANCH = "autoperf/experiments"

SERVER_PROC = None


def parse_args():
    p = argparse.ArgumentParser(description="autoperf runner")
    p.add_argument("--max-experiments", type=int, default=5)
    p.add_argument("--port", type=int, default=3457)
    return p.parse_args()


def log(msg: str):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def run(cmd: str, cwd=None, timeout=300, capture=True) -> subprocess.CompletedProcess:
    """Run a shell command, return CompletedProcess."""
    return subprocess.run(
        cmd, shell=True, cwd=cwd or PILOT_DIR,
        capture_output=capture, text=True, timeout=timeout
    )


def git_clean():
    r = run("git diff --name-only HEAD")
    return r.stdout.strip() == ""


def git_branch():
    return run("git rev-parse --abbrev-ref HEAD").stdout.strip()


def git_sha():
    return run("git rev-parse HEAD").stdout.strip()


def git_commit_msg():
    return run("git log -1 --format=%s").stdout.strip()


# ── Build ─────────────────────────────────────────────────────────────

def build() -> tuple[bool, int]:
    """Build the project. Returns (success, build_time_ms)."""
    log("Building...")
    t0 = time.time()
    r = run("npm run build", timeout=300, capture=True)
    dt = int((time.time() - t0) * 1000)
    if r.returncode != 0:
        log(f"BUILD FAILED (exit {r.returncode})")
        with open(LOG_FILE, "a") as f:
            f.write(r.stderr[-2000:] if r.stderr else "")
        return False, dt
    log(f"Build OK ({dt}ms)")
    return True, dt


# ── Server (wrangler dev) ────────────────────────────────────────────

def start_server(port: int) -> bool:
    global SERVER_PROC
    log(f"Starting wrangler SSR server on port {port}...")
    SERVER_PROC = subprocess.Popen(
        [
            "npx", "wrangler", "dev", "dist/server/index.js",
            "--port", str(port),
            "--site", "dist/client",
            "--compatibility-date", "2025-04-01",
            "--no-bundle",
        ],
        cwd=PILOT_DIR,
        stdout=subprocess.DEVNULL,
        stderr=open(LOG_FILE, "a"),
        env={**os.environ, "FORCE_COLOR": "0"},
    )
    # Wait for ready
    for attempt in range(60):
        time.sleep(2)
        try:
            r = subprocess.run(
                ["curl", "-sf", f"http://localhost:{port}/", "-o", "/dev/null"],
                timeout=5, capture_output=True
            )
            if r.returncode == 0:
                log(f"Server ready (pid {SERVER_PROC.pid}, waited {attempt*2}s)")
                return True
        except Exception:
            pass
        # Check if process died
        if SERVER_PROC.poll() is not None:
            log(f"Server process exited with {SERVER_PROC.returncode}")
            SERVER_PROC = None
            return False
    log("Server failed to start after 120s")
    kill_server()
    return False


def kill_server():
    global SERVER_PROC
    if SERVER_PROC and SERVER_PROC.poll() is None:
        log(f"Killing server (pid {SERVER_PROC.pid})")
        os.killpg(os.getpgid(SERVER_PROC.pid), signal.SIGTERM)
        try:
            SERVER_PROC.wait(timeout=10)
        except Exception:
            SERVER_PROC.kill()
    SERVER_PROC = None


# ── Lighthouse ────────────────────────────────────────────────────────

def lighthouse(url: str, output_path: str) -> dict | None:
    """Run Lighthouse and return metrics dict, or None on failure."""
    log(f"Lighthouse: {url}")
    r = run(
        f'lighthouse "{url}" '
        f'--output=json --output-path="{output_path}" '
        f'--chrome-flags="--headless=new --no-sandbox --disable-gpu" '
        f'--only-categories=performance --throttling-method=simulate',
        timeout=120
    )
    if r.returncode != 0 or not Path(output_path).exists():
        log(f"Lighthouse FAILED for {url}")
        with open(LOG_FILE, "a") as f:
            f.write((r.stderr or "")[-1000:] + "\n")
        return None

    with open(output_path) as f:
        data = json.load(f)

    perf = data.get("categories", {}).get("performance", {})
    audits = data.get("audits", {})
    metrics = {
        "score": round(perf.get("score", 0) * 100, 1),
        "lcp_ms": round(audits.get("largest-contentful-paint", {}).get("numericValue", 0)),
        "tbt_ms": round(audits.get("total-blocking-time", {}).get("numericValue", 0)),
        "cls": round(audits.get("cumulative-layout-shift", {}).get("numericValue", 0), 4),
        "fcp_ms": round(audits.get("first-contentful-paint", {}).get("numericValue", 0)),
        "si_ms": round(audits.get("speed-index", {}).get("numericValue", 0)),
    }
    return metrics


def get_bundle_size_kb() -> int:
    total = 0
    for f in (PILOT_DIR / "dist" / "client").rglob("*.js"):
        total += f.stat().st_size
    return total // 1024


# ── Measure all pages ────────────────────────────────────────────────

def measure_pages(port: int, pages: list[str], prefix: str) -> list[dict]:
    scores = []
    for page_url in pages:
        path_part = page_url.replace(f"http://localhost:{port}", "").replace("/", "_").lstrip("_")
        if not path_part or path_part.startswith("?"):
            path_part = "home"
        # Clean query params from filename
        path_part = path_part.split("?")[0] or path_part
        lh_file = str(AUTOPERF_DIR / f"{prefix}_{path_part}.json")
        metrics = lighthouse(page_url, lh_file)
        if metrics:
            log(f"  {path_part}: score={metrics['score']} lcp={metrics['lcp_ms']}ms tbt={metrics['tbt_ms']}ms")
            scores.append(metrics)
        else:
            log(f"  {path_part}: FAILED")
    return scores


def avg_score(scores: list[dict]) -> float:
    if not scores:
        return 0.0
    return round(sum(s["score"] for s in scores) / len(scores), 1)


# ── Claude Code experiment ────────────────────────────────────────────

def run_claude_experiment(best_score: float, baseline_score: float, bundle_kb: int, history: str) -> bool:
    """Ask Claude Code to make one optimization. Returns True if it committed."""
    prompt = f"""You are optimizing the Weaverse Pilot Hydrogen theme for Lighthouse performance.

Current best Lighthouse score: {best_score}/100
Baseline score: {baseline_score}/100
Bundle size: {bundle_kb}KB client JS

Recent experiments:
{history or '(none yet)'}

Make exactly ONE targeted change to improve performance. Focus on:
- Code splitting / lazy loading (React.lazy, dynamic imports)
- Bundle size reduction (tree-shaking, lighter alternatives)
- Image optimization (lazy loading, sizes, fetchpriority)
- CSS optimization (critical CSS, removing unused styles)
- Font loading (display: swap, preload)
- Third-party script deferral

Rules:
- Only edit files in: app/sections/, app/components/, app/routes/, vite.config.ts, server.ts, app/root.tsx
- ONE change per experiment (small, testable)
- Do NOT break existing functionality
- After making the change, run: git add -A && git commit -m 'perf: your message'

Do NOT modify: package.json, .env, autoperf/, node_modules/"""

    sha_before = git_sha()
    log("Running Claude Code...")

    r = run(
        f'claude --dangerously-skip-permissions -p {repr(prompt)}',
        timeout=300, capture=True
    )

    if r.returncode != 0:
        log(f"Claude Code failed (exit {r.returncode})")
        run("git checkout -- .")
        return False

    sha_after = git_sha()
    if sha_after == sha_before:
        log("No new commit — Claude Code didn't make changes")
        run("git checkout -- .")
        return False

    log(f"Claude Code committed: {git_commit_msg()}")
    return True


# ── Main ──────────────────────────────────────────────────────────────

def main():
    args = parse_args()
    port = args.port
    max_exp = args.max_experiments

    pages = [
        f"http://localhost:{port}/",
        f"http://localhost:{port}/products/pack-it-down-vest",
        f"http://localhost:{port}/collections/all",
    ]

    os.chdir(PILOT_DIR)
    LOG_FILE.unlink(missing_ok=True)
    log("=== autoperf starting ===")
    log(f"Dir: {PILOT_DIR}")
    log(f"Max experiments: {max_exp}, port: {port}")

    # Clean check
    if not git_clean():
        log("FATAL: Working directory not clean. Commit or stash changes first.")
        sys.exit(1)

    # Branch
    original_branch = git_branch()
    run(f"git checkout -B {BRANCH}")
    log(f"On branch: {BRANCH} (forked from {original_branch})")

    # Init results
    RESULTS_FILE.write_text("[]")

    try:
        # ── Baseline ──────────────────────────────────────────────
        log("=== Capturing baseline ===")
        ok, build_ms = build()
        if not ok:
            log("FATAL: Baseline build failed")
            sys.exit(1)

        if not start_server(port):
            log("FATAL: Baseline server failed to start")
            sys.exit(1)

        baseline_scores = measure_pages(port, pages, "baseline")
        kill_server()

        if not baseline_scores:
            log("FATAL: No Lighthouse results for baseline")
            sys.exit(1)

        baseline_avg = avg_score(baseline_scores)
        bundle_kb = get_bundle_size_kb()

        baseline = {
            "avg_score": baseline_avg,
            "pages": baseline_scores,
            "bundle_size_kb": bundle_kb,
            "build_time_ms": build_ms,
            "commit": git_sha(),
        }
        BASELINE_FILE.write_text(json.dumps(baseline, indent=2))
        log(f"Baseline: avg={baseline_avg}, bundle={bundle_kb}KB, build={build_ms}ms")
        log(json.dumps(baseline_scores, indent=2))

        # ── Experiment loop ───────────────────────────────────────
        best_score = baseline_avg
        experiments_run = 0
        experiments_kept = 0
        results = []

        log("=== Starting experiment loop ===")

        for i in range(1, max_exp + 1):
            log(f"--- Experiment {i}/{max_exp} (kept: {experiments_kept}, best: {best_score}) ---")

            # Build history string
            history_lines = []
            for r_item in results[-5:]:
                status = "KEPT" if r_item.get("kept") else "REVERTED"
                history_lines.append(
                    f"- #{r_item['id']}: {r_item.get('description', '?')} → score {r_item.get('score', '?')} ({status})"
                )
            history = "\n".join(history_lines)

            # Run Claude Code
            if not run_claude_experiment(best_score, baseline_avg, bundle_kb, history):
                continue

            experiments_run += 1
            commit_msg = git_commit_msg()
            commit_sha = git_sha()

            # Build
            ok, btime = build()
            if not ok:
                log("Build failed. Reverting.")
                run("git reset --hard HEAD~1")
                continue

            # Measure
            if not start_server(port):
                log("Server failed. Reverting.")
                kill_server()
                run("git reset --hard HEAD~1")
                continue

            exp_scores = measure_pages(port, pages, f"exp_{i}")
            kill_server()

            if not exp_scores:
                log("No Lighthouse results. Reverting.")
                run("git reset --hard HEAD~1")
                continue

            exp_avg = avg_score(exp_scores)
            exp_bundle = get_bundle_size_kb()

            log(f"Score: {exp_avg} (best: {best_score}) | Bundle: {exp_bundle}KB | {commit_msg}")

            kept = exp_avg > best_score
            if kept:
                best_score = exp_avg
                experiments_kept += 1
                bundle_kb = exp_bundle
                log(f"✅ KEEPING (score improved: {exp_avg} > previous best)")
            else:
                log(f"❌ REVERTING ({exp_avg} <= {best_score})")
                run("git revert --no-edit HEAD")

            result = {
                "id": i,
                "description": commit_msg,
                "score": exp_avg,
                "best_score": best_score,
                "bundle_kb": exp_bundle,
                "build_time_ms": btime,
                "kept": kept,
                "commit": commit_sha,
                "pages": exp_scores,
            }
            results.append(result)
            RESULTS_FILE.write_text(json.dumps(results, indent=2))

        # ── Summary ───────────────────────────────────────────────
        log("=== autoperf complete ===")
        log(f"Experiments run: {experiments_run}")
        log(f"Experiments kept: {experiments_kept}")
        log(f"Baseline score: {baseline_avg}")
        log(f"Final best score: {best_score}")
        improvement = round(best_score - baseline_avg, 1)
        log(f"Improvement: {'+' if improvement >= 0 else ''}{improvement} points")

        kept_results = [r for r in results if r.get("kept")]
        if kept_results:
            log("Kept changes:")
            for k in kept_results:
                log(f"  ✅ #{k['id']}: {k['description']} (score: {k['score']})")

        log(f"Branch: {BRANCH}")
        log("Done. Review changes and merge what you like.")

    finally:
        kill_server()


if __name__ == "__main__":
    main()
