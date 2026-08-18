"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RequireRole } from "@/components/ProfileProvider";
import { Card, Input, Select, Button, Spinner, Badge } from "@/components/ui";
import {
  ROLES,
  BILLING_PERIODS,
  type Athlete,
  type BillingPeriod,
  type CoachAthlete,
  type CoachSubscription,
  type Profile,
  type Role,
  type SubscriptionPlan,
} from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function AdminPage() {
  return (
    <RequireRole roles={["admin"]}>
      <AdminPanel />
    </RequireRole>
  );
}

function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [coachAthletes, setCoachAthletes] = useState<CoachAthlete[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<CoachSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAthleteName, setNewAthleteName] = useState("");
  const [newAssignCoach, setNewAssignCoach] = useState("");
  const [newAssignAthlete, setNewAssignAthlete] = useState("");
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanMax, setNewPlanMax] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanPeriod, setNewPlanPeriod] = useState<BillingPeriod>("mensual");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: p }, { data: a }, { data: ca }, { data: sp }, { data: cs }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("athletes").select("*").order("name"),
      supabase.from("coach_athletes").select("*"),
      supabase.from("subscription_plans").select("*").order("created_at"),
      supabase.from("coach_subscriptions").select("*").eq("status", "active"),
    ]);
    setProfiles((p as Profile[]) ?? []);
    setAthletes((a as Athlete[]) ?? []);
    setCoachAthletes((ca as CoachAthlete[]) ?? []);
    setPlans((sp as SubscriptionPlan[]) ?? []);
    setSubscriptions((cs as CoachSubscription[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load();
  }, []);

  async function updateProfile(id: string, patch: Partial<Profile>) {
    const supabase = createClient();
    await supabase.from("profiles").update(patch).eq("id", id);
    load();
  }

  async function createAthlete() {
    if (!newAthleteName.trim()) return;
    const supabase = createClient();
    await supabase.from("athletes").insert({ name: newAthleteName.trim() });
    setNewAthleteName("");
    load();
  }

  async function addAssignment() {
    if (!newAssignCoach || !newAssignAthlete) return;
    const supabase = createClient();
    await supabase.from("coach_athletes").insert({ coach_id: newAssignCoach, athlete_id: newAssignAthlete });
    setNewAssignCoach("");
    setNewAssignAthlete("");
    load();
  }

  async function removeAssignment(id: string) {
    const supabase = createClient();
    await supabase.from("coach_athletes").delete().eq("id", id);
    load();
  }

  // Planes y cupos (Fase 6): sin pasarela de pago real, el admin asigna a
  // mano. Como mucho una suscripción activa por entrenador (coach_subscriptions_one_active_idx),
  // así que cambiar de plan es actualizar plan_id en la misma fila.
  async function createPlan() {
    if (!newPlanName.trim()) return;
    const supabase = createClient();
    await supabase.from("subscription_plans").insert({
      name: newPlanName.trim(),
      max_athletes: newPlanMax ? Number(newPlanMax) : null,
      price: newPlanPrice ? Number(newPlanPrice) : null,
      billing_period: newPlanPeriod,
    });
    setNewPlanName("");
    setNewPlanMax("");
    setNewPlanPrice("");
    load();
  }

  async function deletePlan(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
    if (error) {
      alert("No se pudo borrar el plan (probablemente algún entrenador todavía lo tiene asignado): " + error.message);
      return;
    }
    load();
  }

  async function assignPlan(coachId: string, planId: string) {
    const supabase = createClient();
    const existing = subscriptions.find((s) => s.coach_id === coachId);
    if (!planId) {
      if (existing) await supabase.from("coach_subscriptions").update({ status: "canceled" }).eq("id", existing.id);
    } else if (existing) {
      await supabase.from("coach_subscriptions").update({ plan_id: planId }).eq("id", existing.id);
    } else {
      await supabase.from("coach_subscriptions").insert({ coach_id: coachId, plan_id: planId });
    }
    load();
  }

  if (loading) return <Spinner />;

  const athleteName = (id: string | null) => athletes.find((a) => a.id === id)?.name ?? "-";
  const profileLabel = (id: string) => {
    const p = profiles.find((pr) => pr.id === id);
    return p?.full_name || p?.email || id;
  };
  const coaches = profiles.filter((p) => p.role === "entrenador" || p.role === "admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administración</h1>

      <Card>
        <h2 className="font-medium mb-4">Usuarios y roles</h2>
        <div className="space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 border border-[var(--color-divider)] rounded-lg p-3">
              <div className="min-w-[180px]">
                <p className="text-sm font-medium">{p.full_name || p.email || p.id}</p>
                <p className="text-xs text-[var(--color-text)]/40">{p.email}</p>
              </div>
              <Select
                value={p.role ?? ""}
                onChange={(e) => updateProfile(p.id, { role: (e.target.value || null) as Role | null })}
                className="w-auto"
              >
                <option value="">Sin rol (pendiente)</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {p.role === "escalador" && (
                <Select
                  value={p.athlete_id ?? ""}
                  onChange={(e) => updateProfile(p.id, { athlete_id: e.target.value || null })}
                  className="w-auto"
                >
                  <option value="">Sin atleta vinculado</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              )}
              {p.role === "escalador" && p.athlete_id && <Badge tone="green">{athleteName(p.athlete_id)}</Badge>}
              {p.role === "escalador" && (
                <label className="flex items-center gap-1 text-sm text-[var(--color-text)]/55">
                  <input
                    type="checkbox"
                    checked={p.restricted}
                    onChange={(e) => updateProfile(p.id, { restricted: e.target.checked })}
                  />
                  Restringido (solo ve contenido de su entrenador, no toca ejercicios)
                </label>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Atletas</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {athletes.map((a) => (
            <Badge key={a.id}>{a.name}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del nuevo atleta..."
            value={newAthleteName}
            onChange={(e) => setNewAthleteName(e.target.value)}
          />
          <Button onClick={createAthlete}>Crear atleta</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Asignaciones entrenador &rarr; escalador</h2>
        <div className="space-y-2 mb-4">
          {coachAthletes.length === 0 && <p className="text-sm text-[var(--color-text)]/40">Sin asignaciones todavía.</p>}
          {coachAthletes.map((ca) => (
            <div key={ca.id} className="flex items-center justify-between border border-[var(--color-divider)] rounded-lg p-3 text-sm">
              <span>
                {profileLabel(ca.coach_id)} &rarr; {athleteName(ca.athlete_id)}
              </span>
              <Button variant="danger" onClick={() => removeAssignment(ca.id)}>
                Quitar
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={newAssignCoach} onChange={(e) => setNewAssignCoach(e.target.value)} className="w-auto">
            <option value="">Entrenador...</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name || c.email}
              </option>
            ))}
          </Select>
          <Select value={newAssignAthlete} onChange={(e) => setNewAssignAthlete(e.target.value)} className="w-auto">
            <option value="">Atleta...</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Button onClick={addAssignment}>Agregar asignación</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Planes de suscripción</h2>
        <p className="text-sm text-[var(--color-text)]/55 mb-4">
          Sin pasarela de pago real: el cobro se maneja fuera de la app y estos planes solo fijan el cupo de atletas.
        </p>
        <div className="space-y-2 mb-4">
          {plans.length === 0 && <p className="text-sm text-[var(--color-text)]/40">Sin planes todavía.</p>}
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between border border-[var(--color-divider)] rounded-lg p-3 text-sm">
              <span>
                <span className="font-medium">{plan.name}</span> &middot;{" "}
                {plan.max_athletes !== null ? `${plan.max_athletes} atletas` : "sin tope de atletas"}
                {plan.price !== null && (
                  <>
                    {" "}
                    &middot; ${plan.price}
                    {plan.billing_period ? `/${plan.billing_period}` : ""}
                  </>
                )}
              </span>
              <button onClick={() => deletePlan(plan.id)} className="text-[var(--color-text)]/30 hover:text-red-500 shrink-0" aria-label="Borrar plan">
                <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Nombre del plan..." value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="w-auto" />
          <Input
            type="number"
            min={1}
            placeholder="Cupo (vacío = sin tope)"
            value={newPlanMax}
            onChange={(e) => setNewPlanMax(e.target.value)}
            className="w-auto"
          />
          <Input
            type="number"
            min={0}
            placeholder="Precio"
            value={newPlanPrice}
            onChange={(e) => setNewPlanPrice(e.target.value)}
            className="w-auto"
          />
          <Select value={newPlanPeriod} onChange={(e) => setNewPlanPeriod(e.target.value as BillingPeriod)} className="w-auto">
            {BILLING_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Button onClick={createPlan}>Crear plan</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium mb-4">Suscripciones de entrenadores</h2>
        <div className="space-y-2">
          {coaches.length === 0 && <p className="text-sm text-[var(--color-text)]/40">Sin entrenadores todavía.</p>}
          {coaches.map((c) => {
            const count = coachAthletes.filter((ca) => ca.coach_id === c.id).length;
            const activePlanId = subscriptions.find((s) => s.coach_id === c.id)?.plan_id ?? "";
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 border border-[var(--color-divider)] rounded-lg p-3 text-sm">
                <span className="min-w-[160px]">
                  {c.full_name || c.email} <span className="text-[var(--color-text)]/40">({count} atletas)</span>
                </span>
                <Select value={activePlanId} onChange={(e) => assignPlan(c.id, e.target.value)} className="w-auto">
                  <option value="">Sin plan (sin tope)</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                      {plan.max_athletes !== null ? ` (${plan.max_athletes})` : ""}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
