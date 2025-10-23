export interface ReferenceSection {
  category: string;
  studies: string[];
}

export const references: ReferenceSection[] = [
  {
    category: "Systematic Reviews and Meta-Analyses",
    studies: [
      "Sheikhhoseini R, et al. (2018). Effectiveness of Therapeutic Exercise on Forward Head Posture: A Systematic Review and Meta-analysis. J Manipulative Physiol Ther. 627 participants, 7 RCTs. Large improvements in craniovertebral angle (OR 6.7, p=0.0005).",
      "Sepehri S, et al. (2024). The effect of various therapeutic exercises on forward head posture, rounded shoulder, and hyperkyphosis among people with upper crossed syndrome: a systematic review and meta-analysis. BMC Musculoskelet Disord. 903 participants, 22 studies. Significant postural improvements (P=0.001).",
      "Konrad A, et al. (2021). The Influence of Stretching the Hip Flexor Muscles on Performance Parameters. A Systematic Review with Meta-Analysis. PMC7922112. Confirms effectiveness of 30-120 second stretches.",
      "Meta-analysis on microbreaks (2022). 22 studies, n=2,335. Significant effects on vigor and fatigue (d=0.35-0.36, p<0.001)."
    ]
  },
  {
    category: "Randomized Controlled Trials (RCTs)",
    studies: [
      "Ehresman C, et al. (2025). Improved Hip Flexibility and Gluteal Function Following a Daily Lunge-and-Reach Stretching Intervention. PMC12129636. 6 weeks: improved hip extension 5.92° (p=0.01) AND power 12.39 cm (p=0.02).",
      "Cho J, et al. (2017). Upper thoracic spine mobilization and mobility exercise versus upper cervical spine mobilization. BMC Musculoskelet Disord. 68.8% improvement with thoracic intervention vs 50% cervical.",
      "Katzman WB, et al. (2017). Targeted spine strengthening exercise and posture training program (SHEAF). PMC5873977. 6 months reduced kyphosis 3.0° (p=0.009)."
    ]
  },
  {
    category: "EMG and Ultrasound Studies",
    studies: [
      "Ultrasound study (2024). A Comparison between Core Stability Exercises. PMC11036226. 44 subjects. Bird dog ranked #1 for transverse abdominis, superior to planks (p=0.006).",
      "Reiman MP, et al. (2012). Electromyographic analysis of gluteus medius and gluteus maximus during rehabilitation exercises. PMC3201064. Identified exercises >70% MVIC for glutes. Clamshell progression 4: 77% MVIC.",
      "Mills K, et al. (2015). Prolonged sitting and physical inactivity are associated with limited hip extension. 144 individuals. 7+ hours sitting → 6.1° less hip extension (p<0.001)."
    ]
  },
  {
    category: "Program Structure Studies",
    studies: [
      "Systematic review (2023). 16 RCTs confirming effectiveness of 20-60 min, 2-3×/week for office workers.",
      "Kim SY, et al. (2015). Effect of duration of smartphone use on muscle fatigue and pain caused by forward head posture in adults. J Phys Ther Sci.",
      "Elpeze G, et al. (2022). The effectiveness of a comprehensive corrective exercises program. n=62, 12 weeks. Improvements in alignment and muscle activation.",
      "BMC review (2020). Office workers' perspectives on physical activity and sedentary behaviour. BMC Public Health."
    ]
  },
  {
    category: "Breathing and Mobility Studies",
    studies: [
      "MDPI (2025). Acute Effects of Diaphragmatic Breathing on Trunk and Shoulder Mobility. 21.7-23.3% improvement in thoracic rotation with breathing protocol.",
      "Frontiers/PMC (2023). Diaphragmatic breathing exercises in recovery from fatigue-induced changes in spinal mobility. PMC10340528."
    ]
  }
];
