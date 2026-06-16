import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, useListProjects } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Wand2, 
  FolderGit2, 
  CreditCard,
  LogOut,
  Menu,
  ChevronRight
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const { data: projects } = useListProjects();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("wf_token");
        setLocation("/login");
      }
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const projectsCount = projects?.length || 0;
  const isFreePlan = user.plan === "free";

  const NavLinks = () => (
    <div className="space-y-1">
      <Link href="/dashboard" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${location === "/dashboard" ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"}`}>
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </Link>
      <Link href="/generate" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${location === "/generate" ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"}`}>
        <Wand2 className="h-4 w-4" /> Generate
      </Link>
      <Link href="/projects" className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${location.startsWith("/projects") ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"}`}>
        <div className="flex items-center gap-3">
          <FolderGit2 className="h-4 w-4" /> Projects
        </div>
        {projectsCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 flex items-center justify-center text-[10px]">
            {projectsCount}
          </Badge>
        )}
      </Link>
      <Link href="/pricing" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${location === "/pricing" ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"}`}>
        <CreditCard className="h-4 w-4" /> Pricing
      </Link>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-border bg-card/30 md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-16 items-center px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>WebForge AI</span>
              <Badge variant="outline" className="text-[10px] uppercase h-5 px-1 bg-muted/50 font-medium">v2.0</Badge>
            </Link>
          </div>
          
          <div className="px-4 py-4">
            <Button className="w-full justify-start gap-2 shadow-sm" onClick={() => setLocation("/generate")}>
              <Wand2 className="h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</div>
              <NavLinks />
            </nav>
          </div>
          
          <div className="mt-auto p-4 border-t border-border flex flex-col gap-4">
            {isFreePlan && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Projects Limit</span>
                  <span className="text-xs text-muted-foreground">{Math.min(projectsCount, 3)}/3</span>
                </div>
                <Progress value={(Math.min(projectsCount, 3) / 3) * 100} className="h-1.5 mb-3" />
                <Link href="/pricing" className="text-xs text-primary font-medium flex items-center hover:underline">
                  Upgrade to Pro <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarFallback className="bg-primary/20 text-primary font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground leading-none">{user.name}</span>
                  <span className="text-xs text-muted-foreground mt-1 capitalize flex items-center gap-1">
                    {user.plan} Plan
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card/30 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-6">
                  <Wand2 className="h-6 w-6 text-primary" />
                  <span className="sr-only">WebForge AI</span>
                </Link>
                <NavLinks />
              </nav>
              <div className="mt-auto">
                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1"></div>
          <Button size="sm" className="md:hidden gap-1" onClick={() => setLocation("/generate")}>
            <Wand2 className="h-3 w-3" /> New
          </Button>
          <Avatar className="h-8 w-8 md:hidden">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 lg:p-10 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}