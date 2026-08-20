# Design: Phase 2 Reliable Guided Progression

## Technical Approach

Preserve the verified Phase 1 routes, mode switching, imperative Guided UI, and shared progress. Refactor only Guided orchestration so `workoutController` owns one guarded step-completion command, one timer, and one deterministic transition table. Phase 3 versioned validation/recovery and Phase 4 Preact redesign remain deferred.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Patch each timer/manual branch | Small diff, races remain | Reject; every completion source must converge before state mutation. |
| Typed command inside the existing Nanostore controller | Preserves Phase 1 and limits scope | Choose; `createCompletionCallback(source)` captures the current generation/revision token and invokes one synchronous `completeCurrentStep(token)`. |
| New state-machine library | Strong formalism, new dependency and migration | Reject; a closed transition function is sufficient and easier to test strictly. |
| Keep implicit rest inference | Fewer fields, ambiguous restoration | Reject; persist explicit `restPurpose` and a start-of-session timing snapshot. |

`progressStore` remains the sole shared-progress owner. The controller calls its already-idempotent `completeExercise(phaseId, exerciseId)` only when the final side of the final set crosses the exercise boundary. UI, timers, restoration, and navigation never write progress directly.

## State and Transition Contract

Use const objects with derived types for `CompletionSource` and `RestPurpose` (`between-sets`, `between-exercises`, `between-phases`). Extend `WorkoutSession` with `stepRevision`, `restPurpose`, and flat captured durations. A module-local `generation` changes on initialization, restoration, pause, navigation, start-over, and exit; every accepted transition increments `stepRevision`. Callbacks carrying either old value are no-ops.

For `EXERCISE_ACTIVE`, side is the inner boundary and set the outer boundary:

1. More sides: increment side and restart the same work duration.
2. Final side with more sets: enter `between-sets`; expiry increments set, resets side to 1, and resumes work.
3. Final set with another exercise: record progress, enter `between-exercises`, then select the next exercise and prep/work.
4. Final exercise in a phase: record progress, expose `PHASE_COMPLETE`, then use `between-phases` before the next `PHASE_INTRO`.
5. Final workout exercise: record progress and enter `WORKOUT_VERIFICATION`; confirmation enters `WORKOUT_COMPLETE`. Terminal commands are no-ops.

### Completion race

```text
Timer driver ─┐
              ├─ captured token → completeCurrentStep → validate → transition once
Manual UI  ───┘                                      ├→ persist session
                                                     └→ complete progress at exercise boundary
Second callback → stale revision → no-op
```

### Pause, resume, and restoration

```text
Pause/navigation → invalidate generation → clear interval → freeze remaining → persist
Reload → load snapshot → normalize Phase 2 fields → fresh generation → paused render
Resume → fresh token → schedule one interval from persisted remaining
```

The controller exclusively creates and clears `timerInterval`. Scheduling always clears its predecessor and captures a token; ticks only update remaining time while token/current state match. Expiry invokes the same completion closure as manual controls. Every transition, pause, jump, restore, replacement, exit, and terminal state clears the timer. Settings are captured when a new session starts; changes do not alter restored active timing.

Existing compatible snapshots are normalized in memory with inferred rest purpose where unambiguous; restoration never emits completion and resumes only after explicit user action. Phase 2 does not add envelope versions, broad validation, warnings, or recovery UI.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/stores/workoutController.ts` | Modify | Add tokens, timing/rest fields, one completion command, transition helpers, and timer cleanup. |
| `src/pages/[lang]/workout.astro` | Modify | Replace direct atom mutation/forced expiry with generated callbacks; derive pause state from the store and restore paused state explicitly. |
| `src/stores/__tests__/workoutController.test.ts` | Modify | Add strict-TDD race, token, timer, boundary, pause, restore, and parity fixtures. |
| `tests/e2e/workout-flow.spec.ts` | Modify if needed | Cover user-visible race/rest/reload regressions without redesigning Guided UI. |

## Testing Strategy

RED tests precede each seam: pure transition fixtures for side×set ordering and every rest/exercise/phase/final boundary; fake timers for duplicate expiry, manual/expiry races, stale generated callbacks, and cleanup; storage fixtures for work/rest/paused restoration and changed settings; progress mocks proving one boundary write. Then run existing Phase 1 unit/E2E EN/ES mode-switch, shared-progress, pause/resume, mobile-control, and locale-route regressions. GREEN uses the smallest controller/adapter change; REFACTOR only after focused Vitest passes.

## Threat Matrix

N/A — route topology is preserved; this phase introduces no routing, shell, subprocess, VCS/PR automation, executable classification, or process-integration boundary.

## Migration / Rollout

Ship as one reversible controller-and-adapter slice. Roll back those files and tests only; retain Phase 1 routes and all shared progress. Never clear stored progress. Phase 2 session fields are additive; rollback may ignore them.

## Open Questions

None. Phases 3–4 remain independently designed and delivered.
