export interface ExerciseDetail {
  muscles: string;
  why: string;
  evidence: string;
  tips: string;
}

export const exerciseDetails: Record<string, ExerciseDetail> = {
  suboccipital: {
    muscles: "Suboccipital muscles (rectus capitis posterior major/minor, superior/inferior obliques)",
    why: "These muscles become hyperactive from maintaining forward head posture for hours. Their excessive tension contributes to tension headaches and upper cervical stiffness.",
    evidence: "Myofascial release prior to stretching produces superior improvements in range of motion according to 2015-2021 studies.",
    tips: "Use gentle pressure - these are small muscles. If you feel dizzy, reduce pressure."
  },
  pectoral: {
    muscles: "Pectoralis major (clavicular, sternal and lower fibers), pectoralis minor",
    why: "Being hunched in front of a computer chronically shortens these muscles, rotating shoulders forward and closing the chest. This limits breathing and contributes to upper crossed syndrome.",
    evidence: "EMG studies show pectoral hyperactivity in office workers. Kim et al. 2015 demonstrated release effectiveness for postural correction.",
    tips: "Focus on different angles - each works different muscle fibers."
  },
  trapecio: {
    muscles: "Upper trapezius, levator scapulae",
    why: "These muscles elevate shoulders in response to postural and emotional stress. Their hyperactivity creates the characteristic 'raised shoulder' of office workers.",
    evidence: "Part of inhibition protocol validated in 2018-2024 systematic reviews on upper crossed syndrome.",
    tips: "If you find an especially painful point (trigger point), maintain gentle pressure for 30-60 seconds."
  },
  "pectoral-stretch": {
    muscles: "Pectoralis major (all fibers), pectoralis minor",
    why: "Multi-angle stretching is critical because different portions of the pectoral require different angles to stretch effectively.",
    evidence: "Meta-analysis Konrad et al. 2021 confirms that 30-120 second stretches improve performance without negative effects. Studies show pectoral shortening is directly correlated with forward head posture.",
    tips: "Don't force it - you should feel tension, not pain. Breathe deeply during the stretch."
  },
  "hip-flexor": {
    muscles: "Psoas major, iliacus, rectus femoris",
    why: "Sitting 7+ hours daily shortens these muscles by 6.1° of hip extension (p<0.001). Shortened flexors create anterior pelvic tilt, inhibit glutes and cause low back pain.",
    evidence: "RCT Ehresman et al. 2025 showed that 30 sec × 5 reps daily for 6 weeks improved hip extension 5.92° (p=0.01) AND muscle power 12.39 cm (p=0.02). Only stretch that improves flexibility AND performance simultaneously.",
    tips: "Posterior pelvic tilt (tucking glutes) is CRITICAL - without it you only stretch rectus femoris, not psoas."
  },
  "trapecio-stretch": {
    muscles: "Upper trapezius, levator scapulae, scalenes",
    why: "Upper trapezius becomes hyperactive compensating for weakness in deep neck stabilizers. Levator scapulae connects neck and shoulder blade, being a common tension point.",
    evidence: "Part of protocols validated in Sepehri et al. 2024 meta-analysis (n=903) which showed significant postural improvements (P=0.001).",
    tips: "Add rotation (nose to armpit) to emphasize levator scapulae. Anchor shoulder for better stretch."
  },
  "90-90": {
    muscles: "External rotators (piriformis, gemelli, obturators) and internal hip rotators (gluteus medius/minimus anterior, TFL)",
    why: "Sedentary workers lose hip rotational mobility. This forces compensation in lumbar spine during daily movements, contributing to low back pain.",
    evidence: "Recent 2020-2025 studies show that 90/90 improves both mobility and reduces low back pain in 1-2 months. Addresses rotational limitations that other stretches don't reach.",
    tips: "Keep torso upright - if you lean forward you lose the rotational focus. Use block if you can't touch floor."
  },
  "chin-tucks": {
    muscles: "Deep neck flexors (longus colli, longus capitis)",
    why: "These deep stabilizer muscles weaken while superficial ones (sternocleidomastoid) become hyperactive. This perpetuates forward head posture.",
    evidence: "Systematic review Sheikhhoseini et al. 2018 (n=627, 7 RCTs) showed LARGE improvements in craniovertebral angle (odds ratio 6.7, p=0.0005). Gold standard for forward head posture correction.",
    tips: "Palpate your sternocleidomastoid - it should remain relaxed. If tense, you're doing the movement incorrectly."
  },
  ytw: {
    muscles: "Mid/lower trapezius, rhomboids, infraspinatus, teres minor",
    why: "These scapular retractor/depressor muscles weaken while working hunched. They're essential for counteracting rounded shoulders.",
    evidence: "EMG studies demonstrate 50-60% MVIC of lower trapezius with favorable ratio vs upper trapezius. Seidi et al. 2020 showed LARGE effect sizes in corrective programs.",
    tips: "Squeeze shoulder blades together AND down before raising arms. Quality of retraction is more important than height."
  },
  "pull-aparts": {
    muscles: "Mid trapezius, rhomboids, posterior deltoid",
    why: "Functional exercise that mimics the opposite pattern of being hunched in front of computer.",
    evidence: "Kim et al. 2015 demonstrated specific effectiveness in office workers. Hinge Health includes it in evidence-based protocols for postural correction.",
    tips: "Keep elbows slightly bent. Focus movement on squeezing shoulder blades, not arms."
  },
  "bird-dog": {
    muscles: "Transverse abdominis, lumbar multifidus, gluteus maximus, spinal erectors",
    why: "Weak core cannot stabilize spine during movements. Bird dog trains anti-rotation and anti-extension stabilization simultaneously.",
    evidence: "2024 ultrasound study (n=44) ranked it #1 for transverse abdominis activation, statistically SUPERIOR to planks (p=0.006). Most effective exercise for deep core.",
    tips: "CRITICAL: Stop if your lower back arches. Spine must remain completely neutral - use mirror if necessary."
  },
  "dead-bug": {
    muscles: "Transverse abdominis, internal obliques, rectus abdominis (lower portion)",
    why: "Trains lumbar anti-extension - the ability to resist spine arching. Essential for preventing low back pain.",
    evidence: "2024 study ranked it 4th for transverse abdominis. McGill includes it in his core endurance test battery.",
    tips: "Exhale completely when lowering arm/leg - helps maintain core activation and flat lower back."
  },
  "glute-bridge": {
    muscles: "Gluteus maximus, gluteus medius (posterior portion), hamstrings",
    why: "Sitting inhibits gluteus maximus. Mills et al. 2015 showed with EMG that individuals with restricted flexors have LOWER glute activation.",
    evidence: "Multiple EMG studies show 60-70% MVIC of glute. Knees at 135° is optimal for glute vs hamstrings according to Contreras et al.",
    tips: "Use band around knees to activate gluteus medius simultaneously. Squeeze glutes at top for 2-3 seconds."
  },
  clamshells: {
    muscles: "Gluteus medius (all portions), gluteus minimus",
    why: "Gluteus medius stabilizes pelvis during walking. Its weakness causes compensations that contribute to low back and knee pain.",
    evidence: "Reiman et al. 2012 showed that clamshell progression 4 reaches 77% MVIC of gluteus medius with minimal TFL (tensor fasciae latae) compensation.",
    tips: "Avoid rotating pelvis backward - keep hips stacked. Tempo: 2 sec up, 1 sec hold, 2 sec down."
  },
  "cat-cow": {
    muscles: "Spinal erectors, multifidus, intercostals, diaphragm",
    why: "Restores segmental mobility of thoracic spine, which becomes stiff from prolonged static posture.",
    evidence: "Component of successful programs (Elpeze et al. 2022, n=62, 12 weeks). Diaphragmatic descent during inhalation → rib cage expansion → passive thoracic extension.",
    tips: "Breathe SLOWLY - 5 seconds inhale, 5 seconds exhale. Breathing drives the movement."
  },
  "thoracic-rotation": {
    muscles: "Thoracic rotators, obliques, thoracic spinal erectors",
    why: "Thoracic rotation is one of the first movements lost with sedentarism. Limits turning ability, forcing compensation in lumbar spine.",
    evidence: "BMC 2020 systematic review highlights effectiveness for rotational ROM. MDPI 2025 showed 21.7-23.3% improvement with breathing.",
    tips: "Follow the movement with your eyes - your head guides rotation. Keep hip completely stable."
  },
  "thoracic-extension": {
    muscles: "Thoracic spinal erectors, deep spinal extensors",
    why: "Counteracts chronic thoracic flexion (kyphosis) from being hunched. Restores normal thoracic curve.",
    evidence: "SHEAF trial (Katzman et al. 2017, n=99, 6 months) reduced kyphosis 3.0° (95% CI -5.2, -0.8, p=0.009). Multiple studies show 20% postural improvement in 1 month.",
    tips: "Place towel under shoulder blades (not lumbar). Support head in hands - avoid neck strain."
  },
  squats: {
    muscles: "Quadriceps, glutes, hamstrings, spinal erectors, core",
    why: "Multi-joint functional movement that integrates all previous patterns. Essential for daily activities.",
    evidence: "Reiman et al. 2012: single-leg squat produces 71-82% MVIC for glutes. Fundamental human movement pattern.",
    tips: "Knees follow direction of toes. Chest up, weight in heels. Inhale down, exhale up."
  },
  "reverse-lunge": {
    muscles: "Quadriceps, gluteus maximus, gluteus medius, hamstrings",
    why: "Works ankle dorsiflexion under load (functional) and activates glutes eccentrically. Improves unilateral balance.",
    evidence: "2024 systematic review showed ankle exercises 3×/week improve balance and strength. Lower knee load than forward lunge.",
    tips: "BACKWARD step is safer for knees than forward step. Torso remains upright throughout movement."
  },
  "side-plank": {
    muscles: "Obliques (internal/external), quadratus lumborum, gluteus medius, transverse abdominis",
    why: "Trains lateral/anti-lateral flexion stabilization. Prevents lateral compensations during functional movements.",
    evidence: "2024 ultrasound study ranked it 2nd for deep core. McGill establishes norms: 55-103 sec depending on population.",
    tips: "Body in straight line from head to feet - avoid hip sagging. Elbow directly under shoulder."
  },
  "wall-angels": {
    muscles: "Serratus anterior, mid/lower trapezius, rhomboids, rotator cuff",
    why: "Integrates scapular retraction with shoulder mobility. Neuromuscular reeducation of arm movement pattern.",
    evidence: "Nitayarak & Charntaraviroj 2021 showed improvement in postural alignment and scapular muscle balance.",
    tips: "It's normal not to maintain full contact initially. Progress gradually - mobility will improve."
  }
};
