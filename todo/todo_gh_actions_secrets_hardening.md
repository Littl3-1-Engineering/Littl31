# Todo: GitHub Actions hardening + historical GCP key purge

## Status: 🟢 Shipped 2026-09-14 (GH Actions fixes + main/alfr3d-page history purge); one item accepted as residual risk

## Source

Aikido flagged five findings on this repo in the same batch as the CSP/clickjacking findings
(see `todo_csp_header.md`):

1. **3rd party GitHub Actions should be pinned** (High) — `deploy.yml` and `ci.yml`
2. **Overly Broad Permissions in GitHub Actions Workflows** (Medium) — `deploy.yml`
3. **Uncovered a GCP API key** (Medium) — `integrator.js`
4. **Uncovered a GCP API key** (Medium) — a file named `rs=AA2YrTvod91nzEJFOvvfJUrn6_vLwwY0bw`
5. **`actions/checkout` persists Git credentials in workflow** (Low) — `deploy.yml` and `ci.yml`

## 1, 2, 5 — GitHub Actions workflow hardening

Fixed in commit `a4f34df` ("ci: pin GitHub Actions to commit SHAs, scope permissions, disable
credential persistence"):

- Every action in `deploy.yml`/`ci.yml` (`actions/checkout`, `actions/setup-node`,
  `actions/setup-python`, `peaceiris/actions-gh-pages`, `pre-commit/action`) pinned to its exact
  release commit SHA with a `# vX.Y.Z` comment, instead of a mutable version tag.
- `deploy.yml`'s `contents: write` moved from workflow-level to the `build-and-deploy` job level;
  the workflow-level default is now `contents: read` so any future job added to the file doesn't
  silently inherit write access.
- `persist-credentials: false` added to every `actions/checkout` step. Verified this doesn't break
  the deploy step: `peaceiris/actions-gh-pages` manages its own auth via the `github_token` input,
  independent of the ambient credential `actions/checkout` would otherwise leave in the runner's
  git config.
- Verified live via `gh run watch` — the Deploy workflow ran clean end-to-end with all pinned SHAs.

## 3, 4 — historical GCP API key exposure

**Root cause**: commit `b876caa` (Dec 2020, "tweak rellax and add orange overlay to img")
accidentally committed a full "Save Page As → Complete Webpage" snapshot of a Google Photos share
page under `src/assets/images/Photo in Hex Collective - Google Photos_files/` — 25+ junk files
(Google's own `gapi`/`iframe_api`/widget-API scaffolding, alongside the two files Aikido flagged:
`integrator.js` and `rs=AA2YrTvod91nzEJFOvvfJUrn6_vLwwY0bw`). The embedded key
(`AIzaSyBI3LJQiAfKJMuwtbElfY9CHGAVjVes6L8`) is **Google's own client-side key for their Photos
share-page widget** — not a secret belonging to this project. These are conventionally
referrer-restricted (Google's security model for browser-embedded keys relies on origin
restriction, not secrecy), so real-world risk is low, but it doesn't belong in the repo regardless.

The files were removed from the tree at some later point (not present in current `main`'s tip, nor
`live`'s), but the blobs remained reachable through git history, which is what Aikido's scanner
kept finding on every scan.

**Fix** — purged via `git-filter-repo --path "src/assets/images/Photo in Hex Collective - Google
Photos_files" --invert-paths` in a throwaway `--mirror` clone (never touched the working repo
directly), then force-pushed the rewritten history:

- `main`: rewrite verified content-identical at the tip (`git diff <old> <new> --stat` empty,
  tree hashes equal: `b9a1b4fd...`), force-pushed. New tip: `a4f34df`.
- `alfr3d-page` (a stale, unmerged 44-commit page-redesign branch, last touched 2026-08-19, no open
  PR — initially and **incorrectly** reported as not containing the tainted blob; it does, via its
  own independent pre-rewrite copies of the same early commits): same filter-repo run (mirror
  clone rewrites all refs by default), same tree-identity verification, force-pushed. New tip:
  `10ddcf2`.
- `live`: not touched — confirmed via fresh clone to never have contained the blob (it's an orphan
  history of build output only, unrelated ancestry to `main`'s pre-2026 history).
- 14 other remote branches initially thought to need cleanup (5 already-merged dependabot
  branches, 8 stale dependabot bump branches, 1 superseded WIP docs branch) turned out to already
  be deleted from GitHub before this session — local `git branch -r` was showing stale cached
  remote-tracking refs from an old fetch, not real remote state. No action was actually needed
  there; always verify against `git ls-remote --heads origin` directly rather than trusting local
  remote-tracking branches when doing anything security-sensitive with branch state.

**Verification method**: after every push, did a completely fresh `git clone --mirror` into a
throwaway directory (never trusted local working-copy state, which turned out to have stale
refs) and ran both a filename search (`git log --all --oneline --name-only | grep`) and a content
pickaxe (`git log --all -S"<the actual key value>"`) across all refs.

**Residual risk — accepted, not fixed**: the key is still reachable via ~29 `refs/pull/N/head`
snapshots (roughly PRs #6–#34, all closed). GitHub permanently retains a PR's head-commit snapshot
under `refs/pull/N/head` for the life of the PR regardless of what happens to the source branch
afterward — these refs cannot be deleted or rewritten via git push by anyone, including repo
admins; the only lever is a GitHub Support request to purge cached data. Given the key's low
sensitivity (Google's own, likely referrer-restricted, not this project's secret), decided
2026-09-14 to accept this residual exposure rather than file a support ticket. Revisit only if
Aikido's severity assessment changes or if a genuinely sensitive secret is ever found this way —
in that case, file the GitHub Support request instead of accepting.

## Related

- `todo_csp_header.md` — same Aikido batch, CSP + anti-clickjacking header fixes.
- If this pattern (accidentally-committed browser "Save As" snapshots) recurs, check
  `src/assets/` for any other `*_files/` directories before assuming a clean history.
