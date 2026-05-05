import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Demo accounts (legacy, password Demo@2026)
const DEMO_PASSWORD = "Demo@2026";
const DEMOS = [
  { email: "superadmin@demo.wavelength.in", role: "super_admin",       name: "Demo Super Admin",        password: DEMO_PASSWORD },
  { email: "construction@demo.wavelength.in", role: "construction_head", name: "Demo Construction Head", password: DEMO_PASSWORD },
  { email: "interior@demo.wavelength.in",   role: "interior_head",     name: "Demo Interior Head",       password: DEMO_PASSWORD },
  { email: "field@demo.wavelength.in",      role: "field_manager",     name: "Demo Field Manager",       password: DEMO_PASSWORD },
  { email: "accounts@demo.wavelength.in",   role: "accounts_manager",  name: "Demo Accounts Manager",    password: DEMO_PASSWORD },
  { email: "material@demo.wavelength.in",   role: "material_manager",  name: "Demo Material Manager",    password: DEMO_PASSWORD },
  { email: "hr@demo.wavelength.in",         role: "hr_manager",        name: "Demo HR Manager",          password: DEMO_PASSWORD },
  { email: "site@demo.wavelength.in",       role: "site_supervisor",   name: "Demo Site Supervisor",     password: DEMO_PASSWORD },
  { email: "viewer@demo.wavelength.in",     role: "viewer",            name: "Demo Viewer",              password: DEMO_PASSWORD },
  // 9 production wavelength admins
  { email: "admin@wavelength.in",        role: "super_admin",        name: "Super Admin",        password: "Admin@123" },
  { email: "construction@wavelength.in", role: "construction_head",  name: "Construction Head",  password: "Const@123" },
  { email: "interior@wavelength.in",     role: "interior_head",      name: "Interior Head",      password: "Inter@123" },
  { email: "field@wavelength.in",        role: "field_manager",      name: "Field Manager",      password: "Field@123" },
  { email: "tele.manager@wavelength.in", role: "telecaller_manager", name: "Telecaller Manager", password: "TeleMgr@123" },
  { email: "tele1@wavelength.in",        role: "telecaller",         name: "Telecaller 1",       password: "Tele1@123" },
  { email: "tele2@wavelength.in",        role: "telecaller",         name: "Telecaller 2",       password: "Tele2@123" },
  { email: "material@wavelength.in",     role: "material_manager",   name: "Material Manager",   password: "Matrl@123" },
  { email: "viewer@wavelength.in",       role: "viewer",             name: "Viewer",             password: "View@123" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const results: any[] = [];

  for (const d of DEMOS) {
    let userId: string | null = null;
    let status = "created";

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { full_name: d.name },
    });

    if (created?.user) {
      userId = created.user.id;
    } else {
      status = "exists";
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
      if (found) {
        userId = found.id;
        await admin.auth.admin.updateUserById(found.id, { password: d.password, email_confirm: true });
      } else {
        results.push({ email: d.email, status: "error", error: createErr?.message });
        continue;
      }
    }

    if (!userId) continue;

    await admin.from("profiles").upsert({ id: userId, full_name: d.name }, { onConflict: "id" });
    await admin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: d.role });
    if (roleErr) {
      results.push({ email: d.email, status: "role_error", error: roleErr.message });
      continue;
    }

    results.push({ email: d.email, role: d.role, password: d.password, status });
  }

  return new Response(
    JSON.stringify({ accounts: results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
