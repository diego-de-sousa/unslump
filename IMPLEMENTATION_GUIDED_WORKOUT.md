# Guided Workout Mode - Implementation Status

> Historical implementation record. The guided workout is shipped; current runtime, dependency, test, and CI requirements are documented in `README.md` and `AGENTS.md`.

## Overview
This document tracks the implementation of the new guided automatic workout mode for unslump!

## Architecture Decision
✅ **Dual-mode approach**: Keeping both the existing overview mode and the new guided mode
- Overview mode: `/[lang]/` (existing, unchanged)
- Guided mode: `/[lang]/workout` (new)

## Completed ✅

### 1. Core Infrastructure
- ✅ **WorkoutController Store** (`src/stores/workoutController.ts`)
  - Complete state machine implementation
  - States: IDLE → PHASE_INTRO → EXERCISE_PREP → EXERCISE_ACTIVE → REST_PERIOD → PHASE_COMPLETE → WORKOUT_COMPLETE
  - Navigation methods: startWorkout(), pauseWorkout(), skipExercise(), previousExercise(), etc.
  - Centralized timer management
  - Session persistence hooks (localStorage)
  - Settings management (rest durations, sound, voice, vibration)

### 2. Audio & Haptics
- ✅ **SoundController** (`src/utils/soundController.ts`)
  - Web Audio API integration for beeps
  - Audio file playback system
  - Web Speech API for voice announcements (bilingual: EN/ES)
  - Voice methods: announcePhase(), announceExercise(), announceCountdown(), etc.
  - Mute/unmute controls
  - Volume control

- ✅ **Haptics Controller** (`src/utils/haptics.ts`)
  - Vibration API integration
  - Predefined patterns (light, medium, heavy, success, warning, countdown)
  - Context-specific methods: onRepComplete(), onSetComplete(), onExerciseComplete(), etc.
  - Enable/disable toggle

### 3. Visual Components
- ✅ **PhaseTransition** (`src/components/workout/PhaseTransition.astro`)
  - Full-screen phase introduction
  - Phase number, name, description
  - Exercise count and preview list
  - Continue button with auto-start countdown option

- ✅ **ExercisePrep** (`src/components/workout/ExercisePrep.astro`)
  - "Get ready" countdown screen (5 seconds)
  - Exercise name and preview image
  - Large countdown circle with animation
  - Skip countdown button

- ✅ **FullscreenExercise** (`src/components/workout/FullscreenExercise.astro`)
  - Main exercise view
  - Video/GIF display
  - Exercise instructions with level variations
  - Timer display for timed exercises
  - Rep counter container for rep-based exercises

- ✅ **RestPeriod** (`src/components/workout/RestPeriod.astro`)
  - Rest screen between exercises (5-10 seconds configurable)
  - Countdown timer with progress ring
  - Next exercise preview
  - Skip rest button

- ✅ **WorkoutRepCounter** (`src/components/islands/WorkoutRepCounter.tsx`)
  - Interactive rep counter for guided mode
  - Tap button for each rep
  - Progress circle visualization
  - Set tracking with rest periods between sets
  - Automatic progression when sets complete
  - Haptic feedback integration

### 4. Main Workout Page
- ✅ **Workout Route** (`src/pages/[lang]/workout.astro`)
  - Full-screen layout structure
  - Navigation header with progress indicator
  - Pause/Play controls
  - Settings button
  - Bottom navigation (Back/Skip buttons)
  - Screen Wake Lock API integration
  - Resume session modal
  - Settings modal structure
  - Exit confirmation

### 5. UI Integration
- ✅ **Start Button** (Main page)
  - Prominent CTA button on main page
  - Gradient design matching app branding
  - Links to `/[lang]/workout`

### 6. Internationalization
- ✅ **i18n Strings** (EN + ES)
  - All UI text for guided workout
  - Navigation labels
  - Voice announcement templates
  - Settings labels
  - Modal text

## Historical Implementation Checklist (Completed)

The following sections preserve the original implementation plan. They are not current pending work: the orchestration, settings, persistence, service-worker routes, and automated coverage now exist. See `src/pages/[lang]/workout.astro`, `src/scripts/workoutOrchestrator.ts`, `src/stores/workoutController.ts`, and the Playwright suites for the current implementation.

### 1. Main Orchestration Script ⚠️ **CRITICAL**
**Location**: `src/pages/[lang]/workout.astro` (script section)

**What's needed:**
```typescript
// Connect WorkoutController store to UI
- Subscribe to workoutSession store changes
- Render correct component based on workoutState:
  * PHASE_INTRO → PhaseTransition component
  * EXERCISE_PREP → ExercisePrep component
  * EXERCISE_ACTIVE → FullscreenExercise component
  * REST_PERIOD → RestPeriod component
  * PHASE_COMPLETE → PhaseTransition (next phase)
  * WORKOUT_COMPLETE → Completion screen

// Timer integration
- Update UI countdown displays from workoutSession.timeLeft
- Trigger sound/haptic feedback at appropriate times:
  * Beeps at 3-2-1 countdown
  * Completion sounds
  * Voice announcements

// Exercise type handling
- Timed exercises: auto-complete when timer hits 0
- Rep exercises: render WorkoutRepCounter island
- Manual exercises: show completion button

// Event handlers
- pauseWorkout() / resumeFromPause()
- skipExercise()
- previousExercise()
- exitWorkout()
- continueFromPhaseIntro()

// Progress updates
- Update progress bar percentage
- Update exercise counter (X of 21)
- Enable/disable navigation buttons based on state
```

### 2. Swipe Gestures
**Location**: New file or within workout page script

**What's needed:**
- Touch event listeners for swipe detection
- Swipe left → Next exercise (skipExercise)
- Swipe right → Previous exercise (previousExercise)
- Threshold detection to prevent accidental swipes
- Visual feedback during swipe

### 3. Settings Modal Functionality
**Location**: `src/pages/[lang]/workout.astro`

**What's needed:**
```html
<!-- Settings Modal Content -->
<div id="settingsModal">
  - Rest duration slider (5-30 seconds)
  - Phase rest duration slider (10-60 seconds)
  - Prep countdown slider (3-10 seconds)
  - Sound toggle
  - Voice toggle (with test button)
  - Vibration toggle (with test button)
  - Auto-advance toggle
  - Save settings → updateSettings()
</div>
```

### 4. Complete Session Persistence
**Location**: `src/stores/workoutController.ts` + workout page

**What's needed:**
- Load saved session on page mount
- Show resume modal if session exists
- Resume from exact state (phase, exercise, time left)
- Clear session on workout complete or exit
- Handle edge cases (expired sessions, corrupted data)

### 5. Audio Files
**Location**: `public/sounds/`

**Files needed:**
- `beep.mp3` - Countdown beep (3-2-1)
- `complete.mp3` - Exercise complete chime
- `phase-complete.mp3` - Phase complete celebration
- `workout-complete.mp3` - Workout complete celebration
- `rest.mp3` - Rest period start

**Alternative**: Use synthesized beeps from Web Audio API (already implemented as fallback)

### 6. Service Worker Update
**Location**: `public/sw.js`

**What's needed:**
```javascript
// Update CACHE_NAME (increment version)
const CACHE_NAME = 'unslump-v18';

// Add new files to cache
const urlsToCache = [
  '/en/',
  '/es/',
  '/en/workout',  // NEW
  '/es/workout',  // NEW
  '/sounds/beep.mp3',  // NEW
  '/sounds/complete.mp3',  // NEW
  // ... other audio files
];
```

### 7. Testing & Polish
- [ ] Test all 21 exercises in sequence
- [ ] Test pause/resume functionality
- [ ] Test skip/back navigation
- [ ] Test timer accuracy across all exercises
- [ ] Test rep counter for exercises with sets
- [ ] Test voice announcements (EN + ES)
- [ ] Test haptic feedback on mobile
- [ ] Test screen wake lock
- [ ] Test session persistence (close/reopen browser)
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test landscape orientation
- [ ] Performance optimization (animations, transitions)

## Historical Delivery Priorities

These priorities record the sequence used to deliver the guided workout; they are not current instructions.

### Priority 1: Core Workout Flow 🔴
1. Implement main orchestration script in `workout.astro`
2. Connect state machine to component rendering
3. Integrate timers with UI updates
4. Wire up navigation buttons (pause, skip, back)
5. Test basic flow: Phase → Prep → Exercise → Rest → Next Exercise

### Priority 2: Enhanced UX 🟡
6. Implement settings modal with working controls
7. Complete session persistence and resume
8. Add swipe gestures
9. Add audio files (or rely on synthesized sounds)

### Priority 3: Polish & Deploy 🟢
10. Update service worker
11. Comprehensive testing
12. Deploy to production

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Known Issues / Considerations

1. **Script tag in Astro**: The workout page uses `<script define:vars>` which has limitations. May need to extract complex logic to a separate client-side module.

2. **Preact islands**: RepCounter uses Preact. Ensure all imports are compatible with Preact (not React).

3. **Voice synthesis**: Browser support varies. Test across browsers. Some browsers require user interaction before allowing speech.

4. **Vibration API**: Only works on mobile devices. Desktop browsers will silently ignore.

5. **Wake Lock**: Requires HTTPS. Only works on supported browsers (mainly Chrome/Edge).

6. **Performance**: Animations and timers running simultaneously. Monitor performance on lower-end devices.

## File Structure

```
src/
├── stores/
│   └── workoutController.ts       ✅ Complete
├── utils/
│   ├── soundController.ts         ✅ Complete
│   └── haptics.ts                 ✅ Complete
├── components/
│   ├── workout/
│   │   ├── PhaseTransition.astro      ✅ Complete
│   │   ├── ExercisePrep.astro         ✅ Complete
│   │   ├── FullscreenExercise.astro   ✅ Complete
│   │   └── RestPeriod.astro           ✅ Complete
│   └── islands/
│       └── WorkoutRepCounter.tsx      ✅ Complete
├── pages/
│   └── [lang]/
│       ├── index.astro            ✅ Updated (added CTA button)
│       └── workout.astro          ⏳ Structure complete, logic pending
└── i18n/
    └── locales/
        ├── en.json                ✅ Updated
        └── es.json                ✅ Updated

public/
└── sounds/                        ⏳ Empty (needs audio files)
```

## Historical Success Criteria

The original completion checklist is retained below as a historical record. Current behavior is verified by the store tests and Playwright coverage.
1. ✅ User can start a guided workout from main page
2. ⏳ User can complete entire 21-exercise routine automatically
3. ⏳ Timers advance automatically through exercises
4. ⏳ Voice announcements work (EN/ES)
5. ⏳ Haptic feedback works on mobile
6. ⏳ User can pause/resume at any point
7. ⏳ User can navigate back/forward between exercises
8. ⏳ Session persists across page reloads
9. ⏳ Settings are configurable and persist
10. ⏳ Works offline (PWA)

## Next Steps

The guided workout is shipped. Use `README.md` for product usage, `AGENTS.md` for current architecture and verification commands, and the implementation files linked above for maintenance.

---

Last updated: 2025-01-02
