import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORD = "Demo@2026";
const DEMOS = [
  { email: "superadmin@demo.wavelength.in", role: "super_admin",       name: "Demo Super Admin" },
  { email: "construction@demo.wavelength.in", role: "construction_head", name: "Demo Construction Head" },
  { email: "interior@demo.wavelength.in",   role: "interior_head",     name: "Demo Interior Head" },
  { email: "field@demo.wavelength.in",      role: "field_manager",     name: "Demo Field Manager" },
  { email: "accounts@demo.wavelength.in",   role: "accounts_manager",  name: "Demo Accounts Manager" },
  { email: "material@demo.wavelength.in",   role: "material_manager",  name: "Demo Material Manager" },
  { email: "hr@demo.wavelength.in",         role: "hr_manager",        name: "Demo HR Manager" },
  { email: "site@demo.wavelength.in",       role: "site_supervisor",   name: "Demo Site Supervisor" },
  { email: "viewer@demo.wavelength.in",     role: "viewer",            name: "Demo Viewer" },
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

    // Try to create
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: d.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: d.name },
    });

    if (created?.user) {
      userId = created.user.id;
    } else {
      // Already exists? find them
      status = "exists";
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
      if (found) {
        userId = found.id;
        // Reset password to known value
        await admin.auth.admin.updateUserById(found.id, { password: PASSWORD, email_confirm: true });
      } else {
        results.push({ email: d.email, status: "error", error: createErr?.message });
        continue;
      }
    }

    if (!userId) continue;

    // Ensure profile name
    await admin.from("profiles").upsert({ id: userId, full_name: d.name }, { onConflict: "id" });

    // Force the correct role (single role per demo user)
    await admin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: d.role });
    if (roleErr) {
      results.push({ email: d.email, status: "role_error", error: roleErr.message });
      continue;
    }

    results.push({ email: d.email, role: d.role, status });
  }

  return new Response(
    JSON.stringify({ password: PASSWORD, accounts: results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
