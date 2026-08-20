# Workout Experience Specification

Phase 1 mode choice and continuity are the verified baseline. This specification defines the immediate Phase 2 Guided reliability scope only. Phases 3–4 remain deferred and MUST NOT be implemented by this change.

## Requirements

### Requirement: Preserve verified mode choice and shared continuity

The system MUST preserve equal EN/ES choices for Explore exercises and Guided workout, distinct routes, bidirectional switching, pause/preserve/resume behavior, and shared idempotent progress. Phase 2 changes MUST NOT remove or alter these verified outcomes.

#### Scenario: Switch modes without losing progress

- GIVEN a user has an active or paused Guided session and completed shared exercises
- WHEN the user switches to Explore and returns to Guided
- THEN the session state and shared progress remain available without duplicate completion

#### Scenario: Preserve bilingual choice

- GIVEN the user opens either the EN or ES entry route
- WHEN the mode choice is rendered
- THEN both modes are equally available, correctly localized, and navigate to their locale-specific routes

### Requirement: Guard all completion sources

The Guided controller MUST route timer expiry and manual completion through one guarded logical completion operation. A completion MUST advance at most once; stale, duplicate, or superseded callbacks MUST be no-ops, and superseded timers MUST NOT mutate current state.

#### Scenario: Timer and manual completion race

- GIVEN an active timed item is at its completion boundary
- WHEN timer expiry and manual completion occur together
- THEN exactly one logical advancement occurs and no duplicate progress is recorded

#### Scenario: Stale callback after navigation

- GIVEN a callback belongs to a prior item or session generation
- WHEN it runs after navigation, pause, reload, or replacement
- THEN it produces no state, progress, or timer mutation

### Requirement: Make Guided progression deterministic

The system MUST transition deterministically through side, set, rest-purpose, exercise, phase, and final-workout boundaries. It MUST NOT skip, repeat, or create phantom work, and each rest MUST retain its declared purpose.

#### Scenario: Multi-set and side progression

- GIVEN an exercise has sides and/or multiple sets
- WHEN the current side or set completes
- THEN the next declared side/set is selected exactly once before the appropriate rest or exercise boundary

#### Scenario: Phase and final boundary

- GIVEN the final item of a phase or workout completes
- WHEN the guarded completion operation runs
- THEN the controller enters the declared next phase or terminal state exactly once

### Requirement: Preserve active-session timing and pause/resume

The system MUST pause elapsed timing while paused, resume from the preserved active item, and keep timing consistent for new and restored sessions, including changed user settings.

#### Scenario: Pause and resume

- GIVEN a timed Guided item is active
- WHEN the user pauses and later resumes
- THEN elapsed timing does not advance while paused and resumes from the preserved position

### Requirement: Persist and localize reliable Guided state

The system MUST persist sufficient active-session state for reload restoration, retain shared progress across mode and locale navigation, and provide equivalent EN/ES Guided behavior and accessible mobile controls.

#### Scenario: Reload an active session

- GIVEN a user reloads during work, rest, or a paused boundary
- WHEN the Guided route initializes
- THEN the compatible active session restores its item and timing state without replaying completion

#### Scenario: Locale parity

- GIVEN equivalent EN and ES workout data
- WHEN the same Guided path is completed in either locale
- THEN transitions, completion semantics, controls, and shared progress are equivalent

## Deferred Scope

Phase 3 versioned persistence, validation/recovery, warnings, and expanded offline coverage, and Phase 4 Preact redesign, accessibility refinements, and imperative DOM retirement are deferred.
