# Proposal: Workout Mode Choice and Guided Redesign

## Intent

Preserve the completed choice between **Explore exercises** and **Guided workout**, then make Guided progression reliable without losing Phase 1 mode switching or shared progress.

## Scope

### In Scope
- Preserve verified Phase 1: equal EN/ES choices, distinct routes, bidirectional navigation, pause/preserve/resume on switching, and shared progress.
- Deliver Phase 2: one guarded completion path for timer expiry and manual completion; ignore stale or duplicate callbacks.
- Make side, set, rest-purpose, exercise, phase, and final transitions deterministic.
- Retain pause/resume, active-session timing, reload persistence, mobile accessibility, and EN/ES parity.

### Out of Scope
- Phase 3: versioned persistence, validation/recovery, bilingual warnings, and expanded locale/offline recovery coverage.
- Phase 4: Preact Guided redesign, its accessibility refinements, and imperative DOM retirement.
- Reintroducing the abandoned canonical-domain Slice 1A, accounts, cloud sync, voice, or expanded sensory features.

## Capabilities

### New Capabilities
- `workout-experience`: Covers deliberate mode choice, continuity, reliable Guided progression, localization, accessibility, and deferred persistence/UI outcomes.

### Modified Capabilities
None; no existing main OpenSpec capability is present to modify.

## Approach

Treat Phase 1 as the regression baseline. Phase 2 consolidates timer and manual advancement behind one guarded controller command, invalidates stale callbacks, stops superseded timers, and models each rest by purpose. Completion continues through existing shared/idempotent progress behavior. Phases 3–4 remain separate deliveries.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/stores/workoutController.ts` | Modified | Guard completion and transitions. |
| `src/stores/__tests__/workoutController.test.ts` | Modified | Prove races and boundaries. |
| `tests/e2e/workout-flow.spec.ts` | If needed | Preserve runtime regressions. |
| Phase 1 UI/locale files | Preserved | No Phase 2 redesign. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Duplicate/stale advancement | High | Token guard and race tests. |
| Rest skips or repeats work | High | Rest purposes and transition tests. |
| Deferred scope returns early | Medium | Enforce Phase boundaries. |

## Rollback Plan

Revert only Phase 2 controller changes and tests. Retain Phase 1 routes, localization, session switching, and shared progress; never discard stored progress.

## Dependencies

- Existing controller, shared progress, local persistence, and Phase 1 verification.

## Success Criteria

- [ ] Timer and manual completion produce exactly one logical advancement; stale callbacks are no-ops.
- [ ] Side, set, rest, exercise, phase, and terminal transitions never skip, repeat, or create phantom work.
- [ ] Phase 1 behavior, pause/resume, reload persistence, shared progress, mobile accessibility, and EN/ES parity remain green.
- [ ] Phases 3–4 remain explicitly deferred and independently reviewable.
