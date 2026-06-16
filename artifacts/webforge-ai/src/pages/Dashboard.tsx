import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetDashboardStats, useGetRecentActivity, useGetMe } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Activity, Box, Zap, BarChart, Clock, Folder, Globe, Crown, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const { data: user } = useGetMe();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const placeholders = [
    "A modern SaaS landing page with dark mode...",
    "An e-commerce store for sneakers...",
    "A personal portfolio with a blog...",
    "An internal analytics dashboard..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setLocation(`/generate?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const typeColors: Record<string, string> = {
    landing_page: "bg-violet-500",
    ecommerce: "bg-emerald-500",
    dashboard: "bg-rose-500",
    portfolio: "bg-sky-500",
    blog: "bg-amber-500",
    saas: "bg-indigo-500",
    web_app: "bg-orange-500"
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        
        {/* Quick Generate Bar */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
          <CardContent className="p-6 md:p-8 lg:p-10 relative z-10">
            <div className="max-w-4xl flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                What do you want to build today? <Sparkles className="h-6 w-6 text-primary" />
              </h2>
              <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholders[placeholderIndex]}
                  className="bg-background/80 h-14 text-lg border-border focus-visible:ring-primary shadow-inner transition-all"
                />
                <Button type="submit" size="lg" className="h-14 px-8 text-base font-bold shadow-md shrink-0">
                  Generate
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                {["Landing Page", "Dashboard", "E-commerce", "Portfolio"].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setPrompt(`Build a ${type.toLowerCase()}...`)}
                    className="text-xs bg-muted/50 hover:bg-muted border border-border rounded-full px-3 py-1.5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <Folder className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalProjects || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Globe className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.publishedProjects || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.generationsThisMonth || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    / {stats?.planLimit ? stats.planLimit : "∞"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold capitalize leading-none mb-1">{statsLoading ? "-" : stats?.planName || "Free"}</p>
                {(stats?.planName === 'free' || !stats?.planName) && (
                  <Link href="/pricing" className="text-xs text-primary hover:underline font-medium">Upgrade</Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          
          {/* Recent Projects (Left Col - 60%) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Recent Projects</h3>
              <Link href="/projects" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Fallback mock cards if no data, or render real ones if available via useListProjects (we'd need it) 
                  For now we rely on activity or stats, but to make it look right, we'll fake some project cards
                  if we don't have a separate recent projects fetch. Let's use the activity data to deduce recent projects. */}
              {activityLoading ? (
                 <div className="col-span-2 text-center py-10 text-muted-foreground border rounded-xl border-dashed">Loading projects...</div>
              ) : activity && activity.length > 0 ? (
                // Group activity by project to get unique recent projects
                Array.from(new Map(activity.map(item => [item.projectId, item])).values()).slice(0,4).map(item => (
                  <Link key={item.projectId} href={`/projects/${item.projectId}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 overflow-hidden">
                      <div className="h-2 flex w-full">
                        <div className={`h-full w-full ${typeColors[item.action.includes('landing') ? 'landing_page' : 'dashboard'] || 'bg-primary'}`} />
                      </div>
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.projectName}</h4>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md text-muted-foreground capitalize">Project</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{format(new Date(item.timestamp), 'MMM d, yyyy')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-muted-foreground border rounded-xl border-dashed bg-card/30">
                  <Folder className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p>No projects yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Col - 40% */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Activity Feed */}
            <Card className="bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Activity <span className="relative flex h-2 w-2 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-sm text-muted-foreground py-4">Loading activity...</div>
                ) : activity && activity.length > 0 ? (
                  <div className="space-y-6">
                    {activity.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="mt-1.5 relative">
                          <div className={`h-2.5 w-2.5 rounded-full ${item.action.includes('error') ? 'bg-destructive' : 'bg-primary'}`} />
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-border last:hidden" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">{item.action} </span>
                            <Link href={`/projects/${item.projectId}`} className="font-medium hover:text-primary transition-colors">{item.projectName}</Link>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No recent activity.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects by Type */}
            <Card className="bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Projects by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-sm text-muted-foreground py-4">Loading data...</div>
                ) : stats?.projectsByType && stats.projectsByType.length > 0 ? (
                  <div className="space-y-4">
                    {stats.projectsByType.map((type) => {
                      const maxCount = Math.max(...stats.projectsByType.map(t => t.count));
                      const percentage = (type.count / maxCount) * 100;
                      const bgColor = typeColors[type.type] || "bg-primary";
                      
                      return (
                        <div key={type.type} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium capitalize text-muted-foreground">{type.type.replace('_', ' ')}</span>
                            <span className="font-bold">{type.count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${bgColor} rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <BarChart className="h-6 w-6 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}