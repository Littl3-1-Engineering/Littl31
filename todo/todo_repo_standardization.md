# Todo: Repo Tooling Standardization (Cross-Repo)

## Status: 🟡 pre-commit + Dependabot + CI done; only Aikido (blocked, needs paid plan) remains

Tracked canonically in `alfr3d/todo/todo_repo_standardization.md` (path: `/home/athos/Projects/Alfr3d/alfr3d/todo/todo_repo_standardization.md`). Added `.pre-commit-config.yaml` (generic pre-commit-hooks set + detect-secrets, no black/flake8/ktlint since this is a plain Node/Pug/Stylus static-site build) and `.github/dependabot.yml` (`npm` + `github-actions` ecosystems — this repo already has `.github/workflows/deploy.yml`). Generated `.secrets.baseline` via a throwaway venv (repo's own `detect-secrets` CLI is broken the same way `alfr3d`'s is — `ModuleNotFoundError`); zero findings. `pre-commit run --all-files` auto-fixed 3 pre-existing files missing a trailing newline/trailing whitespace (`src/assets/fonts/audimat.svg`, `src/assets/images/logo.svg`, `src/js/scramble.js`) — trivial, kept.

**2026-09-08 — CI added.** `.github/workflows/ci.yml`: a `build` job (`npm ci` + `npm run build:prod`, Node 22 to match `deploy.yml`) and a `pre-commit` job (`pre-commit/action@v3.0.1`), triggered on `pull_request` + non-`main`/`live` pushes + `workflow_dispatch` (`main` pushes already run `build:prod` via `deploy.yml`, so this fills the PR/branch gap without double-building). Both `npm ci` and `pre-commit run --all-files` verified green locally before adding. Not yet observed on an actual GitHub Actions run.

Aikido still isn't set up (needs a paid plan — see `alfr3d`'s note). See the canonical file for the full task list.
