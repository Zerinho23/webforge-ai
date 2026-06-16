import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuickGenerate, useListProjects, GenerationResult } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Code2, Copy, Download, ExternalLink, Globe, ShoppingBag, BookOpen, User, BarChart3, Layers, Layout, Palette, Zap, Sparkles } from "lucide-react";
import { QuickGenerateInputType } from "@workspace/api-zod/src/generated/types/quickGenerateInputType";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const projectTypes = [
  { id: "landing_page", name: "Landing", icon: Globe },
  { id: "web_app", name: "Web App", icon: Code2 },
  { id: "dashboard", name: "Dashboard", icon: BarChart3 },
  { id: "ecommerce", name: "Shop", icon: ShoppingBag },
  { id: "portfolio", name: "Portfolio", icon: User },
  { id: "blog", name: "Blog", icon: BookOpen },
  { id: "saas", name: "SaaS", icon: Layers }
];

const examplePrompts: Record<string, string[]> = {
  landing_page: [
    "A modern dark-mode landing page for an AI copywriting tool.",
    "A vibrant marketing page for a new fitness app with a waitlist form.",
    "A clean, minimal landing page for a boutique coffee roaster."
  ],
  dashboard: [
    "An analytics dashboard for a SaaS product showing MRR, churn, and user growth.",
    "A habit tracker dashboard with a calendar heatmap and progress charts.",
    "An admin panel for an e-commerce store to manage inventory and orders."
  ],
  ecommerce: [
    "A streetwear sneaker store with product grid, filters, and a shopping cart.",
    "A minimal jewelry shop highlighting product photography.",
    "A digital products store selling UI kits and templates."
  ],
  portfolio: [
    "A developer portfolio with a dark theme, project gallery, and contact form.",
    "A creative director portfolio focusing on full-screen imagery and bold typography.",
    "A simple resume site for a freelance writer."
  ]
};

export default function Generate() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialPrompt = searchParams.get("prompt") || "";
  const initialType = (searchParams.get("type") as QuickGenerateInputType) || "landing_page";
  
  const [prompt, setPrompt] = useState(initialPrompt);
  const [projectType, setProjectType] = useState<QuickGenerateInputType>(initialType);
  const [generationLines, setGenerationLines] = useState<string[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const { toast } = useToast();
  const generate = useQuickGenerate();
  const { data: recentProjects } = useListProjects();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generate.isPending) {
      setGenerationLines(["[ SYS ] Initializing WebForge AI engine..."]);
      const lines = [
        "[ AI ] Analyzing prompt semantics and requirements...",
        `[ AI ] Detecting project context: ${projectType}`,
        "[ AI ] Planning component architecture...",
        "[ SYS ] Bootstrapping React environment...",
        "[ CSS ] Injecting Tailwind utility classes...",
        "[ UI ] Building shadcn/ui components...",
        "[ JS ] Wiring interactive state...",
        "[ SYS ] Finalizing bundle...",
        "[ OK ] Generation complete!"
      ];
      let i = 0;
      interval = setInterval(() => {
        if (i < lines.length) {
          setGenerationLines(prev => [...prev, lines[i]]);
          i++;
        }
      }, 500);
    } else {
      setGenerationLines([]);
    }
    return () => clearInterval(interval);
  }, [generate.isPending, projectType]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setResult(null);
    generate.mutate({ data: { prompt, type: projectType } }, {
      onSuccess: (data) => {
        setResult(data);
        toast({ title: "Project generated successfully!" });
      },
      onError: () => {
        toast({ title: "Generation failed", description: "Please try again.", variant: "destructive" });
      }
    });
  };

  const handleCopyCode = () => {
    if (result?.generatedCode) {
      navigator.clipboard.writeText(result.generatedCode);
      toast({ title: "Code copied to clipboard" });
    }
  };

  const handleExportZip = () => {
    if (result?.generatedCode) {
      const blob = new Blob([result.generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${result.projectId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenNewTab = () => {
    if (result?.generatedCode) {
      const blob = new Blob([result.generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  // State 3: Result
  if (result) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                Project Generated <Sparkles className="h-6 w-6 text-primary" />
              </h1>
              <p className="text-muted-foreground">Your app is ready. Preview it below or export the code.</p>
            </div>
            <Button variant="outline" onClick={() => setLocation(`/projects/${result.projectId}`)}>
              Go to Project Settings
            </Button>
          </div>

          <Card className="overflow-hidden border-border shadow-xl">
            <div className="h-12 bg-muted/80 border-b border-border flex items-center px-4 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 bg-background/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground font-mono text-center border border-border/50 max-w-md mx-auto truncate">
                localhost:3000/preview
              </div>
            </div>
            <iframe 
              srcDoc={result.generatedCode} 
              className="w-full h-[700px] bg-white border-0" 
              sandbox="allow-scripts allow-same-origin" 
              title="Preview" 
            />
            <div className="bg-card border-t border-border p-4 flex flex-wrap items-center gap-3 justify-center md:justify-end">
              <Button variant="secondary" onClick={handleOpenNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" /> Open in New Tab
              </Button>
              <Button variant="secondary" onClick={handleCopyCode} className="gap-2">
                <Copy className="h-4 w-4" /> Copy HTML
              </Button>
              <Button variant="secondary" onClick={handleExportZip} className="gap-2">
                <Download className="h-4 w-4" /> Export File
              </Button>
              <Button onClick={() => setLocation(`/projects/${result.projectId}`)}>
                Save & Continue
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // State 2: Generating
  if (generate.isPending) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-3xl mx-auto w-full">
          <Card className="w-full bg-card shadow-2xl border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
              <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
            </div>
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-[30px] animate-pulse-slow" />
                  <div className="h-24 w-24 bg-background border-2 border-primary/50 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                    <Wand2 className="h-10 w-10 text-primary animate-bounce" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Forging your application...</h2>
                <p className="text-muted-foreground">This usually takes about 20-30 seconds.</p>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 md:p-6 font-mono text-sm shadow-inner border border-zinc-800 h-[240px] overflow-y-auto flex flex-col justify-end">
                <div className="space-y-2">
                  {generationLines.map((line, i) => (
                    <div key={i} className="text-green-400 opacity-90">
                      {line}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <span className="w-2 h-4 bg-primary animate-pulse inline-block" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // State 1: Input Form
  return (
    <AppLayout>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">New Project</h1>
            <p className="text-lg text-muted-foreground">Describe your idea, and WebForge AI will build it instantly.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Project Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {projectTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProjectType(type.id as QuickGenerateInputType)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      projectType === type.id 
                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(124,58,237,0.15)]' 
                        : 'border-border bg-card/50 hover:bg-muted hover:border-primary/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <type.icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-base font-semibold">Prompt</Label>
                <span className="text-xs text-muted-foreground">{prompt.length} chars</span>
              </div>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe your ${projectTypes.find(t => t.id === projectType)?.name.toLowerCase()} in detail. Include specific sections, color preferences, and functional requirements...`}
                className="min-h-[200px] text-base md:text-lg resize-y bg-card/50 border-border p-5 focus-visible:ring-primary shadow-inner placeholder:text-muted-foreground/40"
                required
              />
            </div>

            <Accordion type="single" collapsible className="w-full border rounded-xl px-4 bg-card/30">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    Advanced Options
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm">Style Preference</Label>
                    <div className="flex gap-2">
                      {['Modern', 'Minimal', 'Bold', 'Playful'].map(style => (
                        <Badge key={style} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted font-normal text-sm">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Color Theme</Label>
                    <div className="flex gap-2">
                      {['Dark', 'Light', 'Vibrant', 'Monochrome'].map(theme => (
                        <Badge key={theme} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted font-normal text-sm">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button type="submit" size="lg" className="w-full h-16 text-lg font-bold shadow-lg shadow-primary/20 glow transition-all hover:scale-[1.01]" disabled={!prompt.trim() || generate.isPending}>
              <Wand2 className="mr-2 h-6 w-6" />
              Generate Magic <span className="ml-2 text-sm font-normal opacity-70">(~20-30s)</span>
            </Button>
          </form>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 font-semibold mb-4 text-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                Example Prompts
              </div>
              <div className="space-y-2">
                {(examplePrompts[projectType] || examplePrompts.landing_page).map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-3 text-sm rounded-lg border border-border bg-background/50 hover:bg-muted hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 font-semibold mb-3 text-primary">
                <Layout className="h-4 w-4" />
                Prompting Tips
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span> Be specific about sections (e.g., "hero, features, pricing, footer").
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span> Mention the mood or vibe you want ("dark and techy", "clean and trustworthy").
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span> Specify exact copy if you have it, otherwise the AI will generate placeholders.
                </li>
              </ul>
            </CardContent>
          </Card>

          {recentProjects && recentProjects.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Recent Drafts</h3>
              <div className="space-y-2">
                {recentProjects.slice(0, 3).map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block p-3 rounded-lg border border-border bg-card/30 hover:bg-muted transition-colors flex items-center justify-between group">
                    <span className="text-sm font-medium line-clamp-1">{project.name}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}