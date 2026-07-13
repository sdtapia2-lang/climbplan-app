"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "@/components/AthleteProvider";
import { Card, Input, Button, Badge, Spinner, EmptyState } from "@/components/ui";
import { DAYS_OF_WEEK, type Block, type Day, type Mesocycle, type Week } from "@/lib/types";

type DayWithBlocks = Day & { blocks: Block[] };

export default function TrainingPage() {
  const { athleteId } = useAthlete();
  const [loading, setLoading] = useState(true);
  const [mesocycle, setMesocycle] = useState<Mesocycle | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [days, setDays] = useState<DayWithBlocks[]>([]);
  const todayName = DAYS_OF_WEEK[(new Date().getDay() + 6) % 7];

  async function load() {
    if (!athleteId) return;
    setLoading(true);
    const supabase = createClient();

    const { data: mesos } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("athlete_id", athleteId)
      .neq("status", "Completado")
      .order("created_at", { ascending: false })
      .limit(1);
    const meso = (mesos?.[0] as Mesocycle) ?? null;
    setMesocycle(meso);

    if (!meso) {
      setWeek(null);
      setDays([]);
      setLoading(false);
      return;
    }

    const { data: weeksData } = await supabase
      .from("weeks")
      .select("*")
      .eq("mesocycle_id", meso.id)
      .order("week_number");
    const weeksList = (weeksData as Week[]) ?? [];
    const currentWeek = computeCurrentWeek(meso, weeksList);
    setWeek(currentWeek);

    if (!currentWeek) {
      setDays([]);
      setLoading(false);
      return;
    }

    const { data: dayRows } = await supabase
      .from("days")
      .select("*")
      .eq("week_id", currentWeek.id)
      .order("position");
    const daysWithBlocks: DayWithBlocks[] = [];
    for (const d of dayRows ?? []) {
      const { data: blockRows } = await supabase
        .from("blocks")
        .select("*")
        .eq("day_id", d.id)
        .order("position");
      daysWithBlocks.push({ ...(d as Day), blocks: (blockRows as Block[]) ?? [] });
    }
    setDays(daysWithBlocks);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al cambiar de atleta
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId]);

  async function updateBlockField(blockId: string, patch: Partial<Block>) {
    setDays((ds) =>
      ds.map((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)) })),
    );
    const supabase = createClient();
    await supabase.from("blocks").update(patch).eq("id", blockId);
  }

  async function toggleCompleted(block: Block) {
    const completed = !block.completed;
    await updateBlockField(block.id, {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  }

  if (loading) return <Spinner />;

  if (!mesocycle) {
    return (
      <EmptyState
        text="Sin semanas de entrenamiento"
        action={
          <Link href="/mesociclo/new" className="text-orange-600 hover:underline">
            Crear mesociclo &rarr;
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold">
          {mesocycle.name} &mdash; Semana {week?.week_number}
        </h1>
        {week?.load_type && <Badge tone="orange">{week.load_type}</Badge>}
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day.id} className={day.day_of_week === todayName ? "border-orange-400" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{day.day_of_week}</span>
                {day.day_of_week === todayName && <Badge tone="orange">Hoy</Badge>}
                {day.day_focus && <span className="text-sm text-neutral-500">&mdash; {day.day_focus}</span>}
              </div>
              {day.is_rest && <Badge>Descanso</Badge>}
            </div>

            {!day.is_rest && day.blocks.length > 0 && (
              <div className="space-y-3">
                {day.blocks.map((block) => (
                  <div key={block.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{block.exercise_name_freetext}</p>
                        <p className="text-xs text-neutral-500">
                          {[block.sets && `${block.sets} series`, block.reps_or_time, block.time, block.load && `${block.load}`, block.rpe_target && `RPE ${block.rpe_target}`, block.rest && `descanso ${block.rest}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {block.kinesio_notes && (
                          <p className="text-xs text-orange-600 mt-1">&#9888; {block.kinesio_notes}</p>
                        )}
                      </div>
                      <Button
                        variant={block.completed ? "primary" : "secondary"}
                        onClick={() => toggleCompleted(block)}
                      >
                        {block.completed ? "&#10003; Hecho" : "Marcar hecho"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                      <Input
                        placeholder="Series real"
                        defaultValue={block.actual_sets ?? ""}
                        onBlur={(e) => updateBlockField(block.id, { actual_sets: e.target.value })}
                      />
                      <Input
                        placeholder="Reps/tiempo real"
                        defaultValue={block.actual_reps_or_time ?? ""}
                        onBlur={(e) => updateBlockField(block.id, { actual_reps_or_time: e.target.value })}
                      />
                      <Input
                        placeholder="Carga real"
                        defaultValue={block.actual_load ?? ""}
                        onBlur={(e) => updateBlockField(block.id, { actual_load: e.target.value })}
                      />
                      <Input
                        placeholder="RPE real"
                        defaultValue={block.actual_rpe ?? ""}
                        onBlur={(e) => updateBlockField(block.id, { actual_rpe: e.target.value })}
                      />
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        placeholder="Dolor 0-10"
                        defaultValue={block.pain_during ?? ""}
                        onBlur={(e) =>
                          updateBlockField(block.id, {
                            pain_during: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    {Number(block.pain_during) >= 5 && (
                      <p className="text-xs text-red-600 mt-2">
                        &#9888; Dolor reportado &ge; 5. Considera detener y consultar a un profesional de salud.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!day.is_rest && day.blocks.length === 0 && (
              <p className="text-sm text-neutral-400">Sin bloques cargados para este dia.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function computeCurrentWeek(mesocycle: Mesocycle, weeks: Week[]): Week | null {
  if (weeks.length === 0) return null;
  if (!mesocycle.start_date) return weeks[0];
  const start = new Date(mesocycle.start_date);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const idx = Math.min(Math.max(Math.floor(diffDays / 7), 0), weeks.length - 1);
  return weeks[idx] ?? weeks[0];
}
