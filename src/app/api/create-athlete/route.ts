import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!callerProfile || (callerProfile.role !== "admin" && callerProfile.role !== "entrenador")) {
    return NextResponse.json({ error: "Solo un administrador o entrenador puede crear cuentas de escalador." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const athleteName = typeof body?.athleteName === "string" ? body.athleteName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!athleteName || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Nombre, email y una contraseña de al menos 6 caracteres son obligatorios." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: athlete, error: athleteError } = await admin
    .from("athletes")
    .insert({ name: athleteName })
    .select("id")
    .single();
  if (athleteError || !athlete) {
    return NextResponse.json({ error: athleteError?.message ?? "No se pudo crear el atleta." }, { status: 500 });
  }

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createUserError || !created?.user) {
    await admin.from("athletes").delete().eq("id", athlete.id);
    return NextResponse.json({ error: createUserError?.message ?? "No se pudo crear la cuenta." }, { status: 500 });
  }

  const newUserId = created.user.id;

  // El trigger on_auth_user_created ya insertó un profile con role null;
  // lo completamos con los datos del escalador libre.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "escalador", athlete_id: athlete.id, restricted: true })
    .eq("id", newUserId);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: coachError } = await admin
    .from("coach_athletes")
    .insert({ coach_id: user.id, athlete_id: athlete.id });
  if (coachError) {
    return NextResponse.json({ error: coachError.message }, { status: 500 });
  }

  return NextResponse.json({ athleteId: athlete.id, userId: newUserId, email, password });
}
