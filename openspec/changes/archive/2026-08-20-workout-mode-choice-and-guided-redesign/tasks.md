# Tasks: Workout Mode Choice and Guided Redesign

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated Phase 2 authored lines | 402 authored lines; split into ~379 + ~23 |
| Session budget (800 lines) | Within budget; two focused chained PR units |
| 400-line reviewer risk | High for the unsplit candidate; resolved by the approved split |
| Chained PRs recommended | Yes |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Controller/type reliability with tests (~379 lines) | PR #1; base = tracker branch | `pnpm exec vitest run src/stores/__tests__/workoutController.test.ts` | N/A: controller-only unit boundary; Chromium remains the integration proof in PR #2 | Revert `src/stores/workoutController.ts`, `src/types/workout.ts`, and controller tests |
| 2 | Guided adapter wiring (~23 lines) with runtime proof | PR #2; base = PR #1 branch | `pnpm exec playwright test tests/e2e/workout-flow.spec.ts --project=chromium` | Node v24.19.0 Guided Chromium 14/14, including shared-progress flow | Revert only `src/pages/[lang]/workout.astro` adapter changes |

## Phase 1: Explicit Mode Choice (completed history)

- [x] 1.1–1.5 Preserve verified EN/ES choices, routes, switching, session continuity, and shared progress; do not reintroduce canonical-domain Slice 1A.

## Phase 2: Reliable Guided Progression (strict TDD)

- [x] 2.1 RED — In `src/stores/__tests__/workoutController.test.ts`, prove timer/manual races, duplicate replay, and stale generation/revision callbacks advance exactly once or no-op.
- [x] 2.2 GREEN — In `src/stores/workoutController.ts`, converge manual and expiry paths on one guarded `completeCurrentStep` command; invalidate tokens, clear superseded timers, and preserve pause/resume persistence.
- [x] 2.3 RED — Add transition fixtures for prep/work, sides, sets, `between-sets`, `between-exercises`, `between-phases`, phase completion, verification, and terminal no-ops; assert no skips, repeats, or phantom progress.
- [x] 2.4 GREEN — Implement typed `CompletionSource`/`RestPurpose`, `stepRevision`, generation checks, captured durations, deterministic transitions, and progress writes only at final side/set exercise boundaries.
- [x] 2.5 RED — Add storage/fake-timer tests for paused work/rest reload, changed settings, timer cleanup, and restoration without replay; add narrowly scoped EN/ES Chromium regression assertions if needed.
- [x] 2.6 GREEN/REFACTOR — Update `src/pages/[lang]/workout.astro` to use generated callbacks and explicit restored pause state; remove duplicate advancement branches and document invariants.
- [x] 2.7 VERIFY — The prior candidate evidence at `sha256:a8e105d0210cee6509dd730ab9fa3aa2125e220061153dbd97733926d17f0dea` failed independent verification; the maintainer-authorized remediation records distinct passing Node v24.19.0 evidence in apply-progress. The original 402-line candidate remains represented by the approved two-unit feature-branch chain, not a size exception.
  - Test-only remediation `phase2-spanish-guided-parity`: targeted Spanish Guided Chromium 1/1, full Guided Chromium 15/15, and EN/ES mode-choice Chromium 2/2 passed on Node v24.19.0.
  - The Spanish path proves side transition, pause/completion control recovery, exercise-boundary REST_PERIOD, and persisted shared progress without production changes.

## Phase 3: Persistence and Recovery (deferred)

Roadmap only: versioned persistence, validation/recovery, warnings, and expanded offline coverage remain deferred and are not current-change tasks.

## Phase 4: Guided UI Redesign (deferred)

Roadmap only: Preact redesign, accessibility refinements, and imperative DOM retirement remain deferred and are not current-change tasks.
