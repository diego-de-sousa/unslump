export interface ExerciseLevels {
  principiante: string;
  intermedio: string;
  avanzado: string;
}

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  reps: string;
  instructions: string;
  levels?: ExerciseLevels;
  videoUrl?: string;
}

export interface Phase {
  name: string;
  time: string;
  color: string;
  description: string;
  exercises: Exercise[];
}

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export const workout: Record<string, Phase> = {
  fase1: {
    name: "FASE 1: INHIBIR",
    time: "3-4 min",
    color: "bg-blue-100 border-blue-300",
    description: "Reducir actividad neural excesiva en músculos tensos mediante liberación miofascial",
    exercises: [
      {
        id: "suboccipital",
        name: "Automasaje suboccipital",
        duration: 120,
        reps: "2 min/lado",
        instructions: "Acostado, dedos en base del cráneo. Presión suave + pequeños asentimientos.",
        videoUrl: "https://www.youtube.com/watch?v=PX5cE7Km6ZQ"
      },
      {
        id: "pectoral",
        name: "Liberación de pectoral",
        duration: 60,
        reps: "30-60 seg/lado",
        instructions: "Contra pared con pelota o presión manual. Movimientos pequeños del brazo.",
        videoUrl: "https://www.youtube.com/watch?v=jdgKQomV8Gs"
      },
      {
        id: "trapecio",
        name: "Masaje trapecio superior",
        duration: 60,
        reps: "30-60 seg/lado",
        instructions: "Con mano opuesta, presión deslizante sobre trapecio superior.",
        videoUrl: "https://www.youtube.com/watch?v=9Aa4H-OyydM"
      }
    ]
  },
  fase2: {
    name: "FASE 2: ALARGAR",
    time: "4-5 min",
    color: "bg-green-100 border-green-300",
    description: "Estirar músculos acortados para restaurar rango de movimiento normal",
    exercises: [
      {
        id: "pectoral-stretch",
        name: "Estiramiento pectoral (3 ángulos)",
        duration: 45,
        reps: "30-45 seg/ángulo",
        instructions: "Marco de puerta: 45° arriba, 90° horizontal, abajo. Paso adelante.",
        levels: {
          principiante: "30 seg, menos profundidad",
          intermedio: "45 seg, profundidad media",
          avanzado: "60 seg, mayor profundidad"
        },
        videoUrl: "https://www.youtube.com/watch?v=-X2OC0WFaAM"
      },
      {
        id: "hip-flexor",
        name: "Lunge-and-reach (flexores cadera)",
        duration: 30,
        reps: "5×30 seg/pierna",
        instructions: "Media rodilla, retroversión pélvica, brazo mismo lado alcanza hacia opuesto.",
        levels: {
          principiante: "Sin alcance brazo",
          intermedio: "Alcance moderado",
          avanzado: "Alcance máximo + inclinación"
        },
        videoUrl: "https://www.youtube.com/watch?v=67rVjQuuLVc"
      },
      {
        id: "trapecio-stretch",
        name: "Estiramiento trapecio/elevador escápula",
        duration: 45,
        reps: "30-60 seg/lado",
        instructions: "Ancla hombro, inclina cuello a lado opuesto, añade rotación (nariz a axila)."
      },
      {
        id: "90-90",
        name: "Estiramiento 90/90 cadera",
        duration: 40,
        reps: "20-60 seg/lado",
        instructions: "Pierna frontal 90° externa, trasera 90° interna. Torso erguido.",
        levels: {
          principiante: "Bloque bajo cadera",
          intermedio: "Posición estándar",
          avanzado: "90/90 dinámico"
        }
      }
    ]
  },
  fase3: {
    name: "FASE 3: ACTIVAR",
    time: "8-10 min",
    color: "bg-orange-100 border-orange-300",
    description: "Fortalecer músculos débiles de forma aislada para corregir desequilibrios",
    exercises: [
      {
        id: "chin-tucks",
        name: "Retracciones cervicales (chin tucks)",
        duration: 10,
        reps: "10×10-20 seg × 2 series",
        instructions: "Doble mentón - retrae cabeza horizontalmente. Evita activar esternocleidomastoideo.",
        levels: {
          principiante: "Acostado con dedos guía",
          intermedio: "Sentado contra pared",
          avanzado: "De pie sin apoyo"
        },
        videoUrl: "https://www.youtube.com/watch?v=FXA1jNr2chw"
      },
      {
        id: "ytw",
        name: "Serie Y-T-W prona",
        duration: 10,
        reps: "10 reps × 3 series",
        instructions: "Boca abajo. Y: brazos 45°, T: brazos 90°, W: codos flexionados. Aprieta omóplatos.",
        levels: {
          principiante: "De pie contra pared",
          intermedio: "Prono, mantención 5 seg",
          avanzado: "Con mancuernas 1-2kg"
        },
        videoUrl: "https://www.youtube.com/watch?v=Bjor8CnEL_w"
      },
      {
        id: "pull-aparts",
        name: "Pull-aparts con banda",
        duration: 0,
        reps: "10-15 reps × 2-3 series",
        instructions: "Banda a altura pecho, separa retrayendo escápulas.",
        levels: {
          principiante: "Toalla enrollada",
          intermedio: "Banda ligera",
          avanzado: "Banda resistente"
        }
      },
      {
        id: "bird-dog",
        name: "Bird dog",
        duration: 10,
        reps: "10-15/lado × 2-3 series",
        instructions: "Cuatro apoyos. Extiende brazo y pierna opuestos. #1 para core profundo.",
        levels: {
          principiante: "Solo brazo",
          intermedio: "Solo pierna",
          avanzado: "Brazo + pierna opuestos"
        },
        videoUrl: "https://www.youtube.com/watch?v=wiFNA3sqjCA"
      },
      {
        id: "dead-bug",
        name: "Dead bug",
        duration: 10,
        reps: "20 reps totales × 2-3 series",
        instructions: "Boca arriba. Baja brazo y pierna opuestos. Lumbar pegada al suelo.",
        levels: {
          principiante: "Solo pierna",
          intermedio: "Brazo + pierna",
          avanzado: "Con banda elástica"
        },
        videoUrl: "https://www.youtube.com/watch?v=LL2iFJhUroQ"
      },
      {
        id: "glute-bridge",
        name: "Puente de glúteos",
        duration: 3,
        reps: "15-25 reps × 3 series",
        instructions: "Retroversión pélvica, eleva caderas apretando glúteos. Mantén 2-3 seg.",
        levels: {
          principiante: "Peso corporal 3×15-25",
          intermedio: "Con banda rodillas",
          avanzado: "Una pierna 2-4×5-10"
        },
        videoUrl: "https://www.youtube.com/watch?v=wNSpjvy4NqA"
      },
      {
        id: "clamshells",
        name: "Clamshells con banda",
        duration: 0,
        reps: "10-15/lado × 2-3 series",
        instructions: "De lado, banda sobre rodillas. Abre rodilla superior, pies juntos.",
        levels: {
          principiante: "Mantención 30-60 seg",
          intermedio: "Con banda ligera",
          avanzado: "Banda resistente"
        }
      }
    ]
  },
  fase4: {
    name: "FASE 4: INTEGRAR",
    time: "8-10 min",
    color: "bg-purple-100 border-purple-300",
    description: "Patrones de movimiento funcional multiarticular para aplicación a la vida diaria",
    exercises: [
      {
        id: "cat-cow",
        name: "Cat-cow con respiración",
        duration: 0,
        reps: "10 reps × 2-3 series",
        instructions: "Cuatro apoyos. VACA: inhala + arquea, GATO: exhala + redondea. Ciclo 10 seg."
      },
      {
        id: "thoracic-rotation",
        name: "Rotaciones torácicas (thread needle)",
        duration: 0,
        reps: "10-12/lado × 2-3 series",
        instructions: "Cuatro apoyos, mano tras cabeza. Rota codo al techo, sigue con ojos."
      },
      {
        id: "thoracic-extension",
        name: "Extensión torácica c/toalla",
        duration: 10,
        reps: "6-10 reps × 1-2 series",
        instructions: "Boca arriba, toalla bajo omóplatos. Extiende lentamente hacia atrás."
      },
      {
        id: "squats",
        name: "Sentadilla corporal",
        duration: 0,
        reps: "10-15 reps × 3 series",
        instructions: "Pies ancho hombros. Desciende con pecho elevado, rodillas alineadas.",
        levels: {
          principiante: "Asistida (agarre mesa)",
          intermedio: "Peso corporal completa",
          avanzado: "Una pierna / búlgara"
        },
        videoUrl: "https://www.youtube.com/watch?v=m9pMtbfYFQU"
      },
      {
        id: "reverse-lunge",
        name: "Reverse lunge (zancada reversa)",
        duration: 0,
        reps: "8-10/pierna × 2-3 series",
        instructions: "Paso atrás, baja rodilla trasera. Empuja con talón delantero.",
        levels: {
          principiante: "Paso corto, apoyo pared",
          intermedio: "Paso completo sin apoyo",
          avanzado: "Con peso (mochila)"
        }
      },
      {
        id: "side-plank",
        name: "Plank lateral",
        duration: 30,
        reps: "15-60 seg/lado × 2-3 series",
        instructions: "De lado, codo bajo hombro. Cuerpo en línea recta.",
        levels: {
          principiante: "Desde rodillas 20 seg",
          intermedio: "Piernas rectas 30-45 seg",
          avanzado: "Eleva pierna superior 60 seg"
        },
        videoUrl: "https://www.youtube.com/watch?v=zFBXownGs6U"
      },
      {
        id: "wall-angels",
        name: "Wall angels",
        duration: 0,
        reps: "10-15 reps × 2-3 series",
        instructions: "Contra pared (cabeza, espalda, glúteos). Brazos W→Y manteniendo contacto."
      }
    ]
  }
};
