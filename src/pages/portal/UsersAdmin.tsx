import { PortalShell } from "@/components/portal/PortalShell";
import { RoleGate } from "@/components/portal/RoleGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { AppRole } from "@/hooks/useAuth";

const ROLES: AppRole[] = ["main_admin", "contractor", "subcontractor", "mistri", "labour"];

const UsersAdmin = () => {
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);
      return (profiles ?? []).map((p) => ({
        ...p,
        role: (roles ?? []).find((r) => r.user_id === p.id)?.role as AppRole | undefined,
        roleId: (roles ?? []).find((r) => r.user_id === p.id)?.id,
      }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing then insert (single role per user for simplicity)
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <RoleGate allow={["main_admin"]}>
      <PortalShell>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Users &amp; Roles</h1>
          <p className="text-muted-foreground">Promote, demote, or assign workers a role.</p>
        </div>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Team ({users.length})</CardTitle>
            <CardDescription>First sign-up auto becomes Main Admin. Subsequent users default to Labour.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-mono uppercase text-muted-foreground">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Site</th>
                    <th className="py-2 pr-4 w-48">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 font-medium">{u.full_name ?? "Unnamed"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.phone ?? "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.assigned_site ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <Select value={u.role ?? "labour"} onValueChange={(v) => setRole.mutate({ userId: u.id, role: v as AppRole })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No users yet.</p>}
            </div>
          </CardContent>
        </Card>
      </PortalShell>
    </RoleGate>
  );
};

export default UsersAdmin;
