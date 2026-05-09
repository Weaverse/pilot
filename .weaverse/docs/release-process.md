# Release Process

To release a new version of Pilot:

```bash
# 1. Switch to main and pull latest
git checkout main && git pull origin main

# 2. Regenerate package-lock.json (REQUIRED — ensures lockfile matches after merges)
npm i --package-lock-only --workspaces=false

# 3. Bump version (use calver: YYYY.M.D, e.g. 2026.4.7)
npm version <version> --no-git-tag-version

# 4. Commit, tag, and push via PR (main is protected)
git add package.json package-lock.json
git commit -m "chore: release v<version>"
git tag v<version>
git push origin main:release/v<version> --tags
gh pr create --head release/v<version> --base main --title "chore: release v<version>"
gh pr merge <pr-number> --squash --delete-branch

# 5. Create GitHub release with changelog
gh release create v<version> --title "v<version>" --notes "<changelog>"
```

**Important**: Step 2 (`npm i --package-lock-only --workspaces=false`) is critical. Without it, the lockfile may be stale after PR merges, causing dependency drift on CI/deploy.
