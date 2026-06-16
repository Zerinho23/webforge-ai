import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ data: { name, email, password } }, {
      onSuccess: (data) => {
        localStorage.setItem("wf_token", data.token);
        queryClient.invalidateQueries();
        toast({ title: "Account created", description: "Welcome to WebForge AI!" });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration failed", 
          description: err.message || "Something went wrong",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden min-h-[calc(100vh-64px)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-xl mb-6">
              <Wand2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
            <p className="text-muted-foreground">Start building applications in seconds</p>
          </div>

          <Card className="border-border/50 glass shadow-2xl">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Jane Doe" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/80 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/80 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create a strong password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/80 h-12"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pb-8">
                <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 glow" disabled={register.isPending}>
                  {register.isPending ? "Creating account..." : "Sign up for free"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
                    Log in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}