import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/components/AppLogo";
import { useAuth, roleHomePath } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    document.title = "Staff Login — Wavelength Infratech";
  }, []);

  useEffect(() => {
    if (!loading && user) navigate(roleHomePath(role), { replace: true });
  }, [user, role, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: { full_name: fullName },
      },
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Check email if confirmation required.");
  };

  const handleReset = async () => {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset link sent to your email");
  };

  return (
    <main className="min-h-screen relative bg-background">
      {/* Logo top-right */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
          <AppLogo />
        </div>
      </header>

      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <div className="container pt-32 pb-20 relative">
        <div className="mx-auto max-w-md">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-2xl">Staff Portal</CardTitle>
              <CardDescription>Sign in to access Wavelength Infratech ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="si-email">Email</Label>
                      <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="si-pass">Password</Label>
                      <Input id="si-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting ? "Signing in…" : "Sign in"}
                    </Button>
                    <button type="button" onClick={handleReset} className="text-xs text-muted-foreground hover:text-primary block w-full text-center">
                      Forgot password?
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="su-name">Full name</Label>
                      <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="su-email">Email</Label>
                      <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="su-pass">Password (min 6 chars)</Label>
                      <Input id="su-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting ? "Creating…" : "Create account"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      First sign-up becomes <span className="text-primary font-medium">Main Admin</span>. Subsequent users default to Labour and Admin promotes from User Management.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Auth;
