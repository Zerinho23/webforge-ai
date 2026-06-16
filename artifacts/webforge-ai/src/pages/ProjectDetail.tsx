import { useLocation, useParams } from "wouter";
import { useGetProject, useUpdateProject, useDeleteProject, useGenerateProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, RefreshCw, Trash2, Code2, Globe, ArrowLeft, Loader2, Server, Database, Sparkles, Copy, FileCode, CheckCircle2, Layout, Share2, Wand2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  generating: "bg-primary/20 text-primary border-primary/30 animate-pulse",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  error: "bg-destructive/20 text-destructive border-destructive/30"
};

export default function ProjectDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useGetProject(id, { 
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } 
  });
  
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const generateProject = useGenerateProject();

  const handlePublish = () => {
    updateProject.mutate({ id, data: { status: "published" } }, {
      onSuccess: () => {
        toast({ title: "Project published successfully" });
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
      }
    });
  };

  const handleRegenerate = () => {
    generateProject.mutate({ id, data: { prompt: project?.prompt || "", regenerate: true } }, {
      onSuccess: () => {
        toast({ title: "Regeneration started" });
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Project deleted" });
          setLocation("/projects");
        }
      });
    }
  };

  const handleCopyCode = () => {
    if (project?.generatedCode) {
      navigator.clipboard.writeText(project.generatedCode);
      toast({ title: "Code copied to clipboard" });
    }
  };

  const handleDownload = () => {
    if (project?.generatedCode) {
      const blob = new Blob([project.generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading project details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-32 border border-border border-dashed rounded-3xl bg-card/30">
          <FileCode className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or was deleted.</p>
          <Button asChild><Link href="/projects">Back to Projects</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const isGenerating = project.status === "generating";
  const hasCode = !!project.generatedCode;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-2">
          <Link href="/projects" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to projects
          </Link>
          <span>/</span>
          <span className="text-foreground">{project.name}</span>
        </div>

        <div className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{project.name}</h1>
              <Badge variant="outline" className={`${statusColors[project.status]} capitalize px-3 py-1 font-semibold text-sm`}>
                {isGenerating && <Loader2 className="h-3 w-3 mr-2 animate-spin inline" />}
                {project.status}
              </Badge>
              <Badge variant="secondary" className="capitalize px-3 py-1 font-semibold text-sm">
                {project.type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">{project.description || "No description provided"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {project.status === "ready" && (
              <Button onClick={handlePublish} className="gap-2 shadow-lg shadow-primary/20 glow">
                <Globe className="h-4 w-4" /> Publish Live
              </Button>
            )}
            {project.status === "published" && project.previewUrl && (
              <Button asChild className="gap-2 shadow-lg shadow-primary/20 glow">
                <a href={project.previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> View Live Site
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={handleRegenerate} disabled={isGenerating} className="gap-2 bg-background/50">
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} /> 
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
            <Button variant="outline" className="gap-2 bg-background/50">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} className="ml-auto md:ml-0 shadow-sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-[65%_35%] xl:grid-cols-[70%_30%] gap-6 items-start">
          
          {/* Left Column: Preview */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden border-border/50 shadow-xl bg-card">
              <div className="h-12 bg-muted/80 border-b flex items-center px-4 gap-4">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-sm"></div>
                </div>
                <div className="flex-1 bg-background/60 rounded-md px-3 py-1.5 text-xs text-muted-foreground font-mono text-center border border-border/50 shadow-inner truncate mx-auto max-w-md">
                  {project.previewUrl || `localhost:3000/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
                </div>
              </div>
              
              <div className="bg-white min-h-[600px] h-[calc(100vh-300px)] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center p-8">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse-slow" />
                      <div className="h-24 w-24 bg-card border-2 border-primary/30 rounded-full flex items-center justify-center relative z-10 shadow-xl">
                        <Wand2 className="h-10 w-10 text-primary animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Generating your UI</h3>
                    <p className="text-muted-foreground">The AI is currently building your application components...</p>
                  </div>
                ) : hasCode ? (
                  <iframe 
                    srcDoc={project.generatedCode} 
                    className="w-full h-full border-0" 
                    sandbox="allow-scripts allow-same-origin" 
                    title="Preview" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center p-8">
                    <Layout className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No code generated yet</h3>
                    <p className="text-muted-foreground mb-6">Click regenerate to build this project.</p>
                    <Button onClick={handleRegenerate}>Generate Now</Button>
                  </div>
                )}
              </div>
            </Card>

            {hasCode && (
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleDownload} className="gap-2">
                  <Database className="h-4 w-4" /> Download HTML
                </Button>
                <Button variant="secondary" asChild className="gap-2">
                  <a href={'data:text/html,' + encodeURIComponent(project.generatedCode!)} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open in New Tab
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Details Tabs */}
          <div className="flex flex-col h-full">
            <Tabs defaultValue="info" className="w-full h-full flex flex-col">
              <TabsList className="w-full bg-card border border-border p-1 mb-4 h-12">
                <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-sm font-medium">Info</TabsTrigger>
                <TabsTrigger value="code" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-sm font-medium">Code</TabsTrigger>
                {project.status === 'ready' && (
                  <TabsTrigger value="structure" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-sm font-medium">Structure</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="info" className="mt-0 flex-1">
                <Card className="h-full bg-card/50 border-border">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Generation Prompt
                      </h3>
                      <div className="bg-background border border-border p-4 rounded-xl text-sm leading-relaxed shadow-inner">
                        "{project.prompt}"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background border border-border p-4 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">Project Type</div>
                        <div className="font-semibold capitalize">{project.type.replace('_', ' ')}</div>
                      </div>
                      <div className="bg-background border border-border p-4 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">Status</div>
                        <div className="font-semibold capitalize flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${project.status === 'ready' ? 'bg-green-500' : 'bg-primary'}`} />
                          {project.status}
                        </div>
                      </div>
                      <div className="bg-background border border-border p-4 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">Created</div>
                        <div className="font-semibold text-sm">{format(new Date(project.createdAt), 'MMM d, yyyy')}</div>
                      </div>
                      <div className="bg-background border border-border p-4 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">Versions</div>
                        <div className="font-semibold text-sm">1 version</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="code" className="mt-0 flex-1">
                <Card className="h-full bg-card/50 border-border flex flex-col">
                  <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Source Code</CardTitle>
                    {hasCode && (
                      <Button variant="ghost" size="sm" onClick={handleCopyCode} className="gap-2 h-8 text-xs font-medium">
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col min-h-[400px]">
                    <div className="bg-[#0d1117] flex-1 overflow-auto p-4 text-xs font-mono text-[#a5d6ff] leading-relaxed">
                      <pre>
                        <code>{project.generatedCode || "// No code generated yet.\n// Click Regenerate to build the project source."}</code>
                      </pre>
                    </div>
                    {hasCode && (
                      <div className="p-3 bg-card border-t text-xs text-muted-foreground text-right font-medium">
                        {project.generatedCode?.split('\n').length} lines
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {project.status === 'ready' && (
                <TabsContent value="structure" className="mt-0 flex-1">
                  <Card className="h-full bg-card/50 border-border">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Architecture Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <Layout className="h-4 w-4" /> Detected Pages
                        </h4>
                        <div className="flex flex-col gap-2">
                          {['/', '/dashboard', '/settings'].map(route => (
                            <div key={route} className="flex items-center justify-between bg-background border border-border p-2.5 rounded-lg text-sm">
                              <span className="font-mono text-muted-foreground">{route}</span>
                              <Badge variant="outline" className="bg-primary/5 text-primary">React Component</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <Code2 className="h-4 w-4" /> Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'Tailwind CSS', 'shadcn/ui', 'Lucide Icons'].map(tech => (
                            <Badge key={tech} variant="secondary" className="px-3 py-1 font-medium">{tech}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Core Features
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground bg-background border border-border p-4 rounded-xl">
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Responsive Layout</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Dark Mode Support</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Interactive Components</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}