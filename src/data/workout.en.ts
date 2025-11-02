import type { Workout } from './types';

export const workout: Workout = {
  fase1: {
    name: "PHASE 1: INHIBIT",
    time: "≈ 4 min",
    color: "bg-indigo-50 border-indigo-200",
    colorPrimary: "indigo-600",
    colorLight: "indigo-50",
    colorBorder: "indigo-200",
    colorPrimaryHex: "#4f46e5",
    colorLightHex: "#eef2ff",
    colorBorderHex: "#c7d2fe",
    description: "Reduce excessive neural activity in tight muscles through myofascial release",
    exercises: [
      {
        id: "suboccipital",
        name: "Suboccipital self-massage",
        duration: 120,
        reps: "2 min/side",
        instructions: "Lying down, fingers at base of skull. Gentle pressure + small nods.",
        videoUrl: "https://www.youtube.com/watch?v=PX5cE7Km6ZQ",
        videoEmbedUrl: "https://www.youtube.com/shorts/Yu89AAIRoFY"
      },
      {
        id: "pectoral",
        name: "Pectoral release",
        duration: 60,
        reps: "30-60 sec/side",
        instructions: "Against wall with ball or manual pressure. Small arm movements.",
        videoUrl: "https://www.youtube.com/watch?v=jdgKQomV8Gs",
        videoEmbedUrl: "https://www.youtube.com/shorts/j8HNP7cVY2o"
      },
      {
        id: "trapezio",
        name: "Upper trapezius massage",
        duration: 60,
        reps: "30-60 sec/side",
        instructions: "With opposite hand, sliding pressure over upper trapezius.",
        videoUrl: "https://www.youtube.com/watch?v=9Aa4H-OyydM",
        videoEmbedUrl: "https://www.youtube.com/shorts/GJHtgMLqIaE"
      }
    ]
  },
  fase2: {
    name: "PHASE 2: LENGTHEN",
    time: "≈ 5 min",
    color: "bg-teal-50 border-teal-200",
    colorPrimary: "teal-500",
    colorLight: "teal-50",
    colorBorder: "teal-200",
    colorPrimaryHex: "#14b8a6",
    colorLightHex: "#f0fdfa",
    colorBorderHex: "#99f6e4",
    description: "Stretch shortened muscles to restore normal range of motion",
    exercises: [
      {
        id: "pectoral-stretch",
        name: "Pectoral stretch (3 angles)",
        duration: 45,
        reps: "30-45 sec/angle",
        instructions: "Door frame: 45° up, 90° horizontal, down. Step forward.",
        levels: {
          principiante: "30 sec, less depth",
          intermedio: "45 sec, medium depth",
          avanzado: "60 sec, greater depth"
        },
        videoUrl: "https://www.youtube.com/watch?v=-X2OC0WFaAM",
        videoEmbedUrl: "https://www.youtube.com/shorts/MCRnJkb48JU"
      },
      {
        id: "hip-flexor",
        name: "Lunge-and-reach (hip flexors)",
        duration: 30,
        reps: "5×30 sec/leg",
        instructions: "Half-kneeling, posterior pelvic tilt, same-side arm reaches across.",
        levels: {
          principiante: "Without arm reach",
          intermedio: "Moderate reach",
          avanzado: "Maximum reach + lean"
        },
        videoUrl: "https://www.youtube.com/watch?v=67rVjQuuLVc",
        videoEmbedUrl: "https://www.youtube.com/shorts/Ucluf0PLjcc"
      },
      {
        id: "trapecio-stretch",
        name: "Trapezius/levator scapulae stretch",
        duration: 45,
        reps: "30-60 sec/side",
        instructions: "Anchor shoulder, tilt neck to opposite side, add rotation (nose to armpit).",
        videoEmbedUrl: "https://www.youtube.com/shorts/I5v-YzmP9ww"
      },
      {
        id: "90-90",
        name: "90/90 hip stretch",
        duration: 40,
        reps: "20-60 sec/side",
        instructions: "Front leg 90° external, back leg 90° internal. Upright torso.",
        levels: {
          principiante: "Block under hip",
          intermedio: "Standard position",
          avanzado: "Dynamic 90/90"
        },
        videoEmbedUrl: "https://www.youtube.com/shorts/X5jLF8JHCm8"
      }
    ]
  },
  fase3: {
    name: "PHASE 3: ACTIVATE",
    time: "≈ 9 min",
    color: "bg-orange-50 border-orange-200",
    colorPrimary: "orange-500",
    colorLight: "orange-50",
    colorBorder: "orange-200",
    colorPrimaryHex: "#f97316",
    colorLightHex: "#fff7ed",
    colorBorderHex: "#fed7aa",
    description: "Strengthen weak muscles in isolation to correct imbalances",
    exercises: [
      {
        id: "chin-tucks",
        name: "Cervical retractions (chin tucks)",
        duration: 0,
        reps: "10×10-20 sec × 2 sets",
        instructions: "Double chin - retract head horizontally. Avoid activating SCM.",
        sets: 2,
        levels: {
          principiante: "Lying down with finger guide",
          intermedio: "Sitting against wall",
          avanzado: "Standing unsupported"
        },
        videoUrl: "https://www.youtube.com/watch?v=FXA1jNr2chw",
        videoEmbedUrl: "https://www.youtube.com/shorts/pAps-PUqwv0"
      },
      {
        id: "ytw",
        name: "Prone Y-T-W series",
        duration: 0,
        reps: "10 reps × 3 sets",
        instructions: "Face down. Y: arms 45°, T: arms 90°, W: elbows bent. Squeeze shoulder blades.",
        sets: 3,
        levels: {
          principiante: "Standing against wall",
          intermedio: "Prone, 5 sec hold",
          avanzado: "With 1-2kg dumbbells"
        },
        videoUrl: "https://www.youtube.com/watch?v=Bjor8CnEL_w",
        videoEmbedUrl: "https://www.youtube.com/shorts/8RJLYUH0akM"
      },
      {
        id: "pull-aparts",
        name: "Band pull-aparts",
        duration: 0,
        reps: "10-15 reps × 2-3 sets",
        instructions: "Band at chest height, separate while retracting shoulder blades.",
        sets: 3,
        levels: {
          principiante: "Rolled towel",
          intermedio: "Light band",
          avanzado: "Resistance band"
        },
        videoEmbedUrl: "https://www.youtube.com/shorts/Jcn93rBhUps"
      },
      {
        id: "bird-dog",
        name: "Bird dog",
        duration: 0,
        reps: "10-15/side × 2-3 sets",
        instructions: "Quadruped. Extend opposite arm and leg. #1 for deep core.",
        sets: 3,
        levels: {
          principiante: "Arm only",
          intermedio: "Leg only",
          avanzado: "Opposite arm + leg"
        },
        videoUrl: "https://www.youtube.com/watch?v=wiFNA3sqjCA",
        videoEmbedUrl: "https://www.youtube.com/shorts/Tjo5oYHoS8M"
        // imageUrl: "/exercise-images/bird-dog.jpg",
        // gifUrl: "/exercise-images/bird-dog.gif"
      },
      {
        id: "dead-bug",
        name: "Dead bug",
        duration: 0,
        reps: "20 total reps × 2-3 sets",
        instructions: "On back. Lower opposite arm and leg. Lower back glued to floor.",
        sets: 3,
        levels: {
          principiante: "Leg only",
          intermedio: "Arm + leg",
          avanzado: "With resistance band"
        },
        videoUrl: "https://www.youtube.com/watch?v=LL2iFJhUroQ",
        videoEmbedUrl: "https://www.youtube.com/shorts/DqLL45uk2Tk"
      },
      {
        id: "glute-bridge",
        name: "Glute bridge",
        duration: 0,
        reps: "15-25 reps × 3 sets",
        instructions: "Posterior pelvic tilt, raise hips squeezing glutes. Hold 2-3 sec.",
        sets: 3,
        levels: {
          principiante: "Bodyweight 3×15-25",
          intermedio: "With knee band",
          avanzado: "Single leg 2-4×5-10"
        },
        videoUrl: "https://www.youtube.com/watch?v=wNSpjvy4NqA",
        videoEmbedUrl: "https://www.youtube.com/shorts/X_IGw8U_e38"
      },
      {
        id: "clamshells",
        name: "Band clamshells",
        duration: 0,
        reps: "10-15/side × 2-3 sets",
        instructions: "On side, band over knees. Open top knee, feet together.",
        sets: 3,
        levels: {
          principiante: "30-60 sec hold",
          intermedio: "With light band",
          avanzado: "Resistance band"
        },
        videoEmbedUrl: "https://www.youtube.com/shorts/Hj-2r7OlXuE"
      }
    ]
  },
  fase4: {
    name: "PHASE 4: INTEGRATE",
    time: "≈ 9 min",
    color: "bg-pink-50 border-pink-200",
    colorPrimary: "pink-500",
    colorLight: "pink-50",
    colorBorder: "pink-200",
    colorPrimaryHex: "#ec4899",
    colorLightHex: "#fdf2f8",
    colorBorderHex: "#fbcfe8",
    description: "Multi-joint functional movement patterns for daily life application",
    exercises: [
      {
        id: "cat-cow",
        name: "Cat-cow with breathing",
        duration: 0,
        reps: "10 reps × 2-3 sets",
        instructions: "Quadruped. COW: inhale + arch, CAT: exhale + round. 10 sec cycle.",
        sets: 3,
        videoEmbedUrl: "https://www.youtube.com/shorts/2of247Kt0tU"
      },
      {
        id: "thoracic-rotation",
        name: "Thoracic rotations (thread needle)",
        duration: 0,
        reps: "10-12/side × 2-3 sets",
        instructions: "Quadruped, hand behind head. Rotate elbow to ceiling, follow with eyes.",
        sets: 3,
        videoEmbedUrl: "https://www.youtube.com/shorts/xXRe0JjjM7Q"
      },
      {
        id: "thoracic-extension",
        name: "Thoracic extension w/towel",
        duration: 10,
        reps: "6-10 reps × 1-2 sets",
        instructions: "On back, towel under shoulder blades. Slowly extend backward.",
        sets: 2,
        videoEmbedUrl: "https://www.youtube.com/watch?v=Jx6z6OWbD9Y"
      },
      {
        id: "squats",
        name: "Bodyweight squat",
        duration: 0,
        reps: "10-15 reps × 3 sets",
        instructions: "Feet shoulder-width. Descend with chest up, knees aligned.",
        sets: 3,
        levels: {
          principiante: "Assisted (hold table)",
          intermedio: "Full bodyweight",
          avanzado: "Single leg / Bulgarian"
        },
        videoUrl: "https://www.youtube.com/watch?v=m9pMtbfYFQU",
        videoEmbedUrl: "https://www.youtube.com/shorts/eFEVKmp3M4g"
      },
      {
        id: "reverse-lunge",
        name: "Reverse lunge",
        duration: 0,
        reps: "8-10/leg × 2-3 sets",
        instructions: "Step back, lower back knee. Push with front heel.",
        sets: 3,
        levels: {
          principiante: "Short step, wall support",
          intermedio: "Full step unsupported",
          avanzado: "With weight (backpack)"
        },
        videoEmbedUrl: "https://www.youtube.com/shorts/b_2qgdXT_QQ"
      },
      {
        id: "side-plank",
        name: "Side plank",
        duration: 30,
        reps: "15-60 sec/side × 2-3 sets",
        instructions: "On side, elbow under shoulder. Body in straight line.",
        sets: 3,
        levels: {
          principiante: "From knees 20 sec",
          intermedio: "Straight legs 30-45 sec",
          avanzado: "Raise top leg 60 sec"
        },
        videoUrl: "https://www.youtube.com/watch?v=zFBXownGs6U",
        videoEmbedUrl: "https://www.youtube.com/shorts/BFOyHDlY2UE"
      },
      {
        id: "wall-angels",
        name: "Wall angels",
        duration: 0,
        reps: "10-15 reps × 2-3 sets",
        instructions: "Against wall (head, back, glutes). Arms W→Y maintaining contact.",
        sets: 3,
        videoEmbedUrl: "https://www.youtube.com/shorts/bEiiaBfY1hk"
      }
    ]
  }
};
