// Tests de línea base para la semana 1 (regla del sistema de Diego: "la
// Semana 1 del mesociclo 1 se usa para tomar la línea base — se agenda el
// test de Critical Force y un test ARC como sesiones programadas").
// Los tests con dinamómetro (Tindeq) no son sesiones de la app Lattice, por
// lo que van fuera de catálogo con non_catalog_reason — es la única
// excepción que permite la validación existente.
import type { BaselineNeed } from "../types";

export type BaselineTestSpec = {
  need: BaselineNeed;
  /** Codigo estable del ejercicio en el catálogo (si el test existe como sesión). No usar el nombre: puede cambiar. */
  catalogCode?: string;
  /** Equipamiento normalizado requerido para la variante de catálogo. */
  catalogRequires?: string[];
  /** Variante fuera de catálogo (con Tindeq). */
  nonCatalog?: { name: string; reason: string; requires: string[] };
  sets: string;
  repsOrTime: string;
  rest: string;
  note: string;
};

export const BASELINE_TESTS: readonly BaselineTestSpec[] = [
  {
    need: "finger_max",
    nonCatalog: {
      name: "Test Tindeq: fuerza máxima de dedos (MVC + RFD)",
      reason: "Protocolo de dinamómetro Tindeq, no es una sesión del catálogo Lattice.",
      requires: ["tindeq progressor"],
    },
    catalogCode: "FB0010", // Half Crimp 4 - Levantamiento - Test Máximo
    catalogRequires: ["fingerboard"],
    sets: "3",
    repsOrTime: "5 s por mano",
    rest: "3 min",
    note: "Línea base de fuerza de dedos: registrar el máximo de cada mano.",
  },
  {
    need: "critical_force",
    nonCatalog: {
      name: "Test Tindeq: Critical Force",
      reason: "Protocolo de dinamómetro Tindeq, no es una sesión del catálogo Lattice.",
      requires: ["tindeq progressor"],
    },
    catalogCode: "PE0014", // Test de Repeticiones al 60%
    catalogRequires: ["fingerboard"],
    sets: "1",
    repsOrTime: "Hasta el fallo",
    rest: "-",
    note: "Línea base de resistencia de dedos: registrar reps y caída de fuerza.",
  },
  {
    need: "arc",
    catalogCode: "AB0010", // ARC medio
    catalogRequires: [],
    sets: "1",
    repsOrTime: "20 min continuos",
    rest: "-",
    note: "Test de línea base ARC: registrar duración, RPE y si se completó sin caer.",
  },
  {
    need: "pullup_max",
    catalogCode: "CD0032", // Dominadas - Test de Fuerza
    catalogRequires: [],
    sets: "8",
    repsOrTime: "2 reps",
    rest: "3 min",
    note: "Línea base de tracción: registrar el lastre máximo con técnica limpia.",
  },
] as const;
