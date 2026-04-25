import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EdcLogo } from "@/components/marketing/EdcLogo";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — EasyDrive Canada" },
      { name: "description", content: "Sign in to your EasyDrive Canada account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <EdcLogo />
          <h1 className="mt-10 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account.</p>
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/dealer" });
            }}
          >
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue="you@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" defaultValue="••••••••" className="mt-1" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              Sign in <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo only — any credentials work.{" "}
            <Link to="/" className="underline">Back to site</Link>
          </p>
        </div>
      </div>
      <div
        className="hidden bg-primary lg:block"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, oklch(0.21 0.04 260 / 0.85), oklch(0.17 0.04 260 / 0.95)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex h-full flex-col justify-end p-12 text-primary-foreground">
          <div className="max-w-md">
            <div className="text-xs font-bold uppercase tracking-widest text-brand">Dealer Portal</div>
            <h2 className="mt-2 text-3xl font-bold leading-tight">
              Manage your inventory, leads, and sales — all in one place.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
