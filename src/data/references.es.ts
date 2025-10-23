export interface ReferenceSection {
  category: string;
  studies: string[];
}

export const references: ReferenceSection[] = [
  {
    category: "Revisiones Sistemáticas y Metaanálisis",
    studies: [
      "Sheikhhoseini R, et al. (2018). Effectiveness of Therapeutic Exercise on Forward Head Posture: A Systematic Review and Meta-analysis. J Manipulative Physiol Ther. 627 participantes, 7 RCTs. Grandes mejoras en ángulo craneovertebral (OR 6.7, p=0.0005).",
      "Sepehri S, et al. (2024). The effect of various therapeutic exercises on forward head posture, rounded shoulder, and hyperkyphosis among people with upper crossed syndrome: a systematic review and meta-analysis. BMC Musculoskelet Disord. 903 participantes, 22 estudios. Mejoras significativas en postura (P=0.001).",
      "Konrad A, et al. (2021). The Influence of Stretching the Hip Flexor Muscles on Performance Parameters. A Systematic Review with Meta-Analysis. PMC7922112. Confirma efectividad de estiramientos 30-120 segundos.",
      "Metaanálisis sobre micropausas (2022). 22 estudios, n=2,335. Efectos significativos en vigor y fatiga (d=0.35-0.36, p<0.001)."
    ]
  },
  {
    category: "Ensayos Controlados Aleatorizados (RCTs)",
    studies: [
      "Ehresman C, et al. (2025). Improved Hip Flexibility and Gluteal Function Following a Daily Lunge-and-Reach Stretching Intervention. PMC12129636. 6 semanas: mejora extensión cadera 5.92° (p=0.01) Y potencia 12.39 cm (p=0.02).",
      "Cho J, et al. (2017). Upper thoracic spine mobilization and mobility exercise versus upper cervical spine mobilization. BMC Musculoskelet Disord. 68.8% mejora con intervención torácica vs 50% cervical.",
      "Katzman WB, et al. (2017). Targeted spine strengthening exercise and posture training program (SHEAF). PMC5873977. 6 meses redujo cifosis 3.0° (p=0.009)."
    ]
  },
  {
    category: "Estudios EMG y Ultrasonido",
    studies: [
      "Estudio con ultrasonido (2024). A Comparison between Core Stability Exercises. PMC11036226. 44 sujetos. Bird dog clasificado #1 para transverso abdominal, superior a planchas (p=0.006).",
      "Reiman MP, et al. (2012). Electromyographic analysis of gluteus medius and gluteus maximus during rehabilitation exercises. PMC3201064. Identificó ejercicios >70% CVIM para glúteos. Clamshell progresión 4: 77% CVIM.",
      "Mills K, et al. (2015). Prolonged sitting and physical inactivity are associated with limited hip extension. 144 individuos. 7+ horas sentado → 6.1° menos extensión cadera (p<0.001)."
    ]
  },
  {
    category: "Estudios sobre Estructura de Programas",
    studies: [
      "Revisión sistemática (2023). 16 RCTs confirmando efectividad de 20-60 min, 2-3×/semana para trabajadores de oficina.",
      "Kim SY, et al. (2015). Effect of duration of smartphone use on muscle fatigue and pain caused by forward head posture in adults. J Phys Ther Sci.",
      "Elpeze G, et al. (2022). The effectiveness of a comprehensive corrective exercises program. n=62, 12 semanas. Mejoras en alineación y activación muscular.",
      "Revisión BMC (2020). Office workers' perspectives on physical activity and sedentary behaviour. BMC Public Health."
    ]
  },
  {
    category: "Estudios sobre Respiración y Movilidad",
    studies: [
      "MDPI (2025). Acute Effects of Diaphragmatic Breathing on Trunk and Shoulder Mobility. 21.7-23.3% mejora en rotación torácica con protocolo de respiración.",
      "Frontiers/PMC (2023). Diaphragmatic breathing exercises in recovery from fatigue-induced changes in spinal mobility. PMC10340528."
    ]
  }
];
