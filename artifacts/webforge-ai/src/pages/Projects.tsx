import { useState } from "react";
import { Link } from "wouter";
import { useListProjects, useDeleteProject } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Calendar, Loader2, Wand2, Trash2, Globe, ShoppingBag, BookOpen, User, BarChart3, Layers, Code2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getListProjectsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const typeConfig: Record<string, { label: string, icon: any, color: string }> = {
  landing_page: { label: "Landing Page", icon: Globe, color: "from-violet-600 to-violet-400" },
  ecommerce: { label: "E-commerce", icon: ShoppingBag, color: "from-emerald-600 to-emerald-400" },
  blog: { label: "Blog", icon: BookOpen, color: "from-amber-600 to-amber-400" },
  portfolio: { label: "Portfolio", icon: User, color: "from-sky-600 to-sky-400" },
  dashboard: { label: "Dashboard", icon: BarChart3, color: "from-rose-600 to-rose-400" },
  saas: { label: "SaaS App", icon: Layers, color: "from-indigo-600 to-indigo-400" },
  web_app: { label: "Web App", icon: Code2, color: "from-orange-600 to-orange-400" }
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  generating: "bg-primary/20 text-primary border-primary/30 animate-pulse",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  error: "bg-destructive/20 text-destructive border-destructive/30"
};

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this project permanently?")) {
      deleteProject.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: "Project deleted" });
        }
      });
    }
  };

  const filteredProjects = projects?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.prompt && p.prompt.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortOrder === "name") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // latest default
  }) || [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
              {!isLoading && projects && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{projects.length}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Manage, edit, and export your generated applications.</p>
          </div>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/generate"><Wand2 className="mr-2 h-4 w-4" /> New Project</Link>
          </Button>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search projects by name or prompt..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border shadow-inner"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-12 bg-background/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-12 bg-background/50">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[150px] h-12 bg-background/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 text-muted-foreground">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p>Loading your workspace...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => {
              const config = typeConfig[project.type] || typeConfig.web_app;
              const TypeIcon = config.icon;
              const isGenerating = project.status === "generating";

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden bg-card/60 group hover:-translate-y-1">
                    <div className={`h-[120px] relative overflow-hidden bg-gradient-to-br ${config.color} ${isGenerating ? 'animate-pulse' : ''}`}>
                      <div className="absolute inset-0 bg-black/20" />
                      {project.thumbnail && !isGenerating && (
                        <img src={project.thumbnail} alt={project.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <TypeIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3 pt-5">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <CardTitle className="line-clamp-1 text-xl">{project.name}</CardTitle>
                        <Badge variant="outline" className={`${statusColors[project.status]} capitalize shrink-0`}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.prompt}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="pt-0 flex justify-between items-center border-t border-border/50 p-4 bg-muted/10 mt-auto">
                      <Badge variant="secondary" className="bg-background border-border shadow-sm font-medium">
                        {config.label}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(e, project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                          View <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 border border-border border-dashed rounded-3xl bg-card/30">
            <div className="relative w-40 h-40 mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px]" />
              <div className="relative w-full h-full border border-border bg-background rounded-2xl shadow-xl flex items-center justify-center">
                <Wand2 className="h-12 w-12 text-primary opacity-50" />
                <div className="absolute -top-3 -right-3 h-8 w-8 bg-background border border-border rounded-lg flex items-center justify-center shadow-lg rotate-12">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No projects found</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              {search || typeFilter !== 'all' || statusFilter !== 'all' 
                ? "Try adjusting your filters to find what you're looking for."
                : "You haven't generated any applications yet. Let's change that."}
            </p>
            {(search || typeFilter !== 'all' || statusFilter !== 'all') ? (
              <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}>
                Clear Filters
              </Button>
            ) : (
              <Button asChild size="lg" className="shadow-lg shadow-primary/20 glow">
                <Link href="/generate">Generate your first project</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}