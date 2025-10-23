import type { ExerciseDetails } from './types';

export const exerciseDetails: ExerciseDetails = {
  suboccipital: {
    muscles: "Músculos suboccipitales (recto posterior mayor/menor, oblicuos superior/inferior)",
    why: "Estos músculos se vuelven hiperactivos por mantener la cabeza hacia adelante durante horas. Su tensión excesiva contribuye a dolores de cabeza tensionales y rigidez cervical superior.",
    evidence: "La liberación miofascial previa al estiramiento produce mejoras superiores en rango de movimiento según estudios de 2015-2021.",
    tips: "Usa presión suave - estos músculos son pequeños. Si sientes mareo, reduce la presión."
  },
  pectoral: {
    muscles: "Pectoral mayor (fibras claviculares, esternales e inferiores), pectoral menor",
    why: "Estar encorvado frente al ordenador acorta crónicamente estos músculos, rotando los hombros hacia adelante y cerrando el pecho. Esto limita la respiración y contribuye al síndrome cruzado superior.",
    evidence: "Estudios EMG muestran hiperactividad del pectoral en trabajadores de oficina. Kim et al. 2015 demostró efectividad de liberación para corrección postural.",
    tips: "Enfoca diferentes ángulos - cada uno trabaja diferentes fibras del músculo."
  },
  trapecio: {
    muscles: "Trapecio superior, elevador de la escápula",
    why: "Estos músculos elevan los hombros en respuesta al estrés postural y emocional. Su hiperactividad crea el característico 'hombro elevado' de trabajadores de oficina.",
    evidence: "Parte del protocolo de inhibición validado en revisiones sistemáticas 2018-2024 sobre síndrome cruzado superior.",
    tips: "Si encuentras un punto especialmente doloroso (punto gatillo), mantén presión suave 30-60 segundos."
  },
  "pectoral-stretch": {
    muscles: "Pectoral mayor (todas las fibras), pectoral menor",
    why: "El estiramiento multiángulo es crítico porque diferentes porciones del pectoral requieren diferentes ángulos para estirarse efectivamente.",
    evidence: "Metaanálisis Konrad et al. 2021 confirma que estiramientos de 30-120 segundos mejoran rendimiento sin efectos negativos. Estudios muestran que el acortamiento pectoral está directamente correlacionado con postura anterior de cabeza.",
    tips: "No fuerces - debe sentirse tensión, no dolor. Respira profundamente durante el estiramiento."
  },
  "hip-flexor": {
    muscles: "Psoas mayor, ilíaco, recto femoral",
    why: "Estar sentado 7+ horas diarias acorta estos músculos en 6.1° de extensión de cadera (p<0.001). Flexores acortados crean inclinación pélvica anterior, inhiben glúteos y causan dolor lumbar.",
    evidence: "RCT Ehresman et al. 2025 mostró que 30 seg × 5 reps diarias durante 6 semanas mejoró extensión de cadera 5.92° (p=0.01) Y potencia muscular 12.39 cm (p=0.02). Único estiramiento que mejora flexibilidad Y rendimiento simultáneamente.",
    tips: "La retroversión pélvica (meter glúteos) es CRÍTICA - sin ella solo estiras recto femoral, no psoas."
  },
  "trapecio-stretch": {
    muscles: "Trapecio superior, elevador de la escápula, escalenos",
    why: "El trapecio superior se vuelve hiperactivo compensando debilidad de estabilizadores profundos del cuello. El elevador de la escápula conecta cuello y omóplato, siendo común punto de tensión.",
    evidence: "Parte de protocolos validados en metaanálisis Sepehri et al. 2024 (n=903) que mostró mejoras significativas en postura (P=0.001).",
    tips: "Añade rotación (nariz hacia axila) para enfatizar elevador de escápula. Ancla el hombro para mejor estiramiento."
  },
  "90-90": {
    muscles: "Rotadores externos (piriforme, géminos, obturadores) y rotadores internos de cadera (glúteo medio/mínimo anterior, TFL)",
    why: "Trabajadores sedentarios pierden movilidad rotacional de cadera. Esto fuerza compensación en columna lumbar durante movimientos diarios, contribuyendo a dolor lumbar.",
    evidence: "Estudios recientes 2020-2025 muestran que el 90/90 mejora tanto movilidad como reduce dolor lumbar en 1-2 meses. Aborda limitaciones rotacionales que otros estiramientos no alcanzan.",
    tips: "Mantén torso erguido - si te inclinas hacia adelante pierdes el enfoque rotacional. Usa bloque si no tocas suelo."
  },
  "chin-tucks": {
    muscles: "Flexores profundos del cuello (longus colli, longus capitis)",
    why: "Estos músculos estabilizadores profundos se debilitan mientras los superficiales (esternocleidomastoideo) se vuelven hiperactivos. Esto perpetúa la postura de cabeza anterior.",
    evidence: "Revisión sistemática Sheikhhoseini et al. 2018 (n=627, 7 RCTs) mostró mejoras GRANDES en ángulo craneovertebral (odds ratio 6.7, p=0.0005). Gold standard para corrección de postura anterior de cabeza.",
    tips: "Palpa tu esternocleidomastoideo - debe permanecer relajado. Si está tenso, estás haciendo el movimiento incorrectamente."
  },
  ytw: {
    muscles: "Trapecio medio/inferior, romboides, infraespinoso, redondo menor",
    why: "Estos músculos retractores/depresores de la escápula se debilitan mientras trabajas encorvado. Son esenciales para contrarrestar hombros encorvados.",
    evidence: "Estudios EMG demuestran 50-60% CVIM del trapecio inferior con ratio favorable vs trapecio superior. Seidi et al. 2020 mostró tamaños de efecto GRANDES en programas correctivos.",
    tips: "Aprieta omóplatos juntos Y hacia abajo antes de elevar brazos. La calidad de retracción es más importante que la altura."
  },
  "pull-aparts": {
    muscles: "Trapecio medio, romboides, deltoides posterior",
    why: "Ejercicio funcional que imita el patrón opuesto a estar encorvado frente al ordenador.",
    evidence: "Kim et al. 2015 demostró efectividad específica en trabajadores de oficina. Hinge Health lo incluye en protocolos basados en evidencia para corrección postural.",
    tips: "Mantén codos ligeramente flexionados. Enfoca el movimiento en apretar omóplatos, no en brazos."
  },
  "bird-dog": {
    muscles: "Transverso abdominal, multífidos lumbares, glúteo mayor, erectores espinales",
    why: "El core débil no puede estabilizar columna durante movimientos. Bird dog entrena estabilización antirotación y antiextensión simultáneamente.",
    evidence: "Estudio con ultrasonido 2024 (n=44) lo clasificó #1 para activación de transverso abdominal, estadísticamente SUPERIOR a planchas (p=0.006). El ejercicio más efectivo para core profundo.",
    tips: "CRÍTICO: Detén si tu lumbar se arquea. La columna debe permanecer completamente neutra - usa espejo si es necesario."
  },
  "dead-bug": {
    muscles: "Transverso abdominal, oblicuos internos, recto abdominal (porción inferior)",
    why: "Entrena anti-extensión lumbar - la capacidad de resistir que la columna se arquee. Esencial para prevenir dolor lumbar.",
    evidence: "Estudio 2024 lo clasificó 4º para transverso abdominal. McGill lo incluye en su batería de tests de resistencia del core.",
    tips: "Exhala completamente cuando bajes brazo/pierna - ayuda a mantener activación del core y lumbar plana."
  },
  "glute-bridge": {
    muscles: "Glúteo mayor, glúteo medio (porción posterior), isquiotibiales",
    why: "Estar sentado inhibe el glúteo mayor. Mills et al. 2015 mostró con EMG que individuos con flexores restringidos tienen MENOR activación de glúteo.",
    evidence: "Múltiples estudios EMG muestran 60-70% CVIM del glúteo. Rodillas a 135° es óptimo para glúteo vs isquiotibiales según Contreras et al.",
    tips: "Usa banda alrededor de rodillas para activar glúteo medio simultáneamente. Aprieta glúteos en la cima 2-3 segundos."
  },
  clamshells: {
    muscles: "Glúteo medio (todas las porciones), glúteo mínimo",
    why: "El glúteo medio estabiliza la pelvis durante la marcha. Su debilidad causa compensaciones que contribuyen a dolor lumbar y rodilla.",
    evidence: "Reiman et al. 2012 mostró que clamshell progresión 4 alcanza 77% CVIM de glúteo medio con mínima compensación de TFL (tensor de la fascia lata).",
    tips: "Evita rotar pelvis hacia atrás - mantén caderas apiladas. Tempo: 2 seg subir, 1 seg mantener, 2 seg bajar."
  },
  "cat-cow": {
    muscles: "Erectores espinales, multífidos, intercostales, diafragma",
    why: "Restaura movilidad segmental de columna torácica, que se vuelve rígida por postura estática prolongada.",
    evidence: "Componente de programas exitosos (Elpeze et al. 2022, n=62, 12 semanas). El descenso diafragmático durante inhalación → expansión caja torácica → extensión torácica pasiva.",
    tips: "Respira LENTAMENTE - 5 segundos inhalar, 5 segundos exhalar. La respiración impulsa el movimiento."
  },
  "thoracic-rotation": {
    muscles: "Rotadores torácicos, oblicuos, erectores espinales torácicos",
    why: "La rotación torácica es uno de los primeros movimientos que se pierde con sedentarismo. Limita capacidad de girar, forzando compensación en columna lumbar.",
    evidence: "Revisión sistemática BMC 2020 destaca efectividad para ROM rotacional. MDPI 2025 mostró 21.7-23.3% mejora con respiración.",
    tips: "Sigue el movimiento con los ojos - tu cabeza guía la rotación. Mantén cadera completamente estable."
  },
  "thoracic-extension": {
    muscles: "Erectores espinales torácicos, extensores profundos de columna",
    why: "Contrarresta la flexión torácica (cifosis) crónica de estar encorvado. Restaura la curva torácica normal.",
    evidence: "Ensayo SHEAF (Katzman et al. 2017, n=99, 6 meses) redujo cifosis 3.0° (95% CI -5.2, -0.8, p=0.009). Múltiples estudios muestran 20% mejora postural en 1 mes.",
    tips: "Coloca toalla bajo omóplatos (no lumbar). Apoya cabeza en manos - evita tensión cervical."
  },
  squats: {
    muscles: "Cuádriceps, glúteos, isquiotibiales, erectores espinales, core",
    why: "Movimiento funcional multiarticular que integra todos los patrones anteriores. Esencial para actividades diarias.",
    evidence: "Reiman et al. 2012: sentadilla a una pierna produce 71-82% CVIM para glúteos. Patrón fundamental de movimiento humano.",
    tips: "Rodillas siguen dirección de dedos de pies. Pecho elevado, peso en talones. Inhala al bajar, exhala al subir."
  },
  "reverse-lunge": {
    muscles: "Cuádriceps, glúteo mayor, glúteo medio, isquiotibiales",
    why: "Trabaja dorsiflexión de tobillo bajo carga (funcional) y activa glúteos excéntricamente. Mejora equilibrio unilateral.",
    evidence: "Revisión sistemática 2024 mostró que ejercicios de tobillo 3×/semana mejoran equilibrio y fuerza. Menor carga en rodilla que zancada frontal.",
    tips: "El paso ATRÁS es más seguro para rodillas que paso adelante. Torso permanece erguido durante todo el movimiento."
  },
  "side-plank": {
    muscles: "Oblicuos (interno/externo), cuadrado lumbar, glúteo medio, transverso abdominal",
    why: "Entrena estabilización lateral/antiflexión lateral. Previene compensaciones laterales durante movimientos funcionales.",
    evidence: "Estudio ultrasonido 2024 lo clasificó 2º para core profundo. McGill establece normas: 55-103 seg según población.",
    tips: "Cuerpo en línea recta desde cabeza a pies - evita que cadera se hunda. Codo directamente bajo hombro."
  },
  "wall-angels": {
    muscles: "Serratos anteriores, trapecio medio/inferior, romboides, manguito rotador",
    why: "Integra retracción escapular con movilidad de hombro. Reeducación neuromuscular del patrón de movimiento del brazo.",
    evidence: "Nitayarak & Charntaraviroj 2021 mostraron mejora en alineación postural y balance muscular escapular.",
    tips: "Es normal no poder mantener contacto completo al inicio. Progresa gradualmente - la movilidad mejorará."
  }
};
