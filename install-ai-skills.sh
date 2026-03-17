#!/bin/bash
# Install Weaverse AI Skills for enhanced AI coding agent support
# Works with Cursor, Claude Code, Windsurf, Codex, GitHub Copilot
#
# Usage:
#   bash install-ai-skills.sh

set -e

SKILLS_DIR=".weaverse-skills"
SKILLS_REPO="https://github.com/Weaverse/skills.git"

if [ -d "$SKILLS_DIR" ]; then
  echo "Updating existing skills..."
  cd "$SKILLS_DIR" && git pull && cd ..
else
  echo "Installing Weaverse AI skills..."
  git clone --depth=1 "$SKILLS_REPO" "$SKILLS_DIR"
fi

# Ensure .weaverse-skills is gitignored
if ! grep -q "^\.weaverse-skills" .gitignore 2>/dev/null; then
  echo ".weaverse-skills/" >> .gitignore
  echo "Added .weaverse-skills/ to .gitignore"
fi

echo ""
echo "✅ Weaverse AI skills installed at ./$SKILLS_DIR"
echo ""
echo "Usage:"
echo "  • Cursor: cp .weaverse-skills/.cursorrules .cursorrules"
echo "  • Claude Code / Codex: skills auto-referenced via AGENTS.md"
echo "  • Other agents: point agent to .weaverse-skills/SKILL.md"
