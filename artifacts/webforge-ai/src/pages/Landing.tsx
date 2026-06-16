import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wand2, Zap, LayoutTemplate, Server, ArrowRight, 
  Sparkles, Globe, ShoppingBag, BookOpen, User, 
  BarChart3, Layers, Code2 
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setLocation(`/generate?prompt=${encodeURIComponent(prompt)}`);
    } else {
      setLocation("/generate");
    }
  };

  const projectTypes = [
    { id: "landing_page", name: "Landing Page", icon: Globe, color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingBag, color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
    { id: "blog", name: "Blog", icon: BookOpen, color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", iconColor: "text-amber-400" },
    { id: "portfolio", name: "Portfolio", icon: User, color: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/20", iconColor: "text-sky-400" },
    { id: "dashboard", name: "Dashboard", icon: BarChart3, color: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/20", iconColor: "text-rose-400" },
    { id: "saas", name: "SaaS App", icon: Layers, color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20", iconColor: "text-indigo-400" },
    { id: "web_app", name: "Web App", icon: Code2, color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", iconColor: "text-orange-400" },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-10 pb-20">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />

        <div className="z-10 flex flex-col items-center text-center max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Powered by GPT-4o
          </div>
          
          <h1 className="gradient-text text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight pb-2">
            Build the web.<br />In seconds.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl font-light">
            Describe what you want to build in plain English, and watch WebForge AI generate a working, deployable React application.
          </p>

          <div className="w-full max-w-3xl glass rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 mb-6 focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-xl">
            <form onSubmit={handleGenerate} className="flex-1 flex flex-col md:flex-row items-center gap-2 w-full">
              <div className="flex items-center flex-1 w-full px-2">
                <Wand2 className="h-5 w-5 text-muted-foreground mx-2" />
                <Input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Build a habit tracker dashboard with charts..." 
                  className="border-0 focus-visible:ring-0 text-base md:text-lg h-14 shadow-none bg-transparent flex-1 placeholder:text-muted-foreground/50"
                />
              </div>
              <Button type="submit" size="lg" className="w-full md:w-auto rounded-xl px-8 h-14 font-semibold text-base shrink-0">
                Generate <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-3xl">
            {["Online sneaker store with cart", "SaaS landing page for AI tools", "Analytics dashboard for a startup", "Personal portfolio for a developer"].map((example, i) => (
              <button 
                key={i}
                onClick={() => setPrompt(example)}
                className="text-xs md:text-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-1.5 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium">
            <span>3 free projects</span>
            <span>·</span>
            <span>No credit card</span>
            <span>·</span>
            <span>Instant results</span>
          </div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="w-full overflow-hidden border-y border-border bg-muted/20 py-4 flex whitespace-nowrap">
        <div className="animate-marquee inline-flex gap-8 items-center text-sm font-bold tracking-widest uppercase text-muted-foreground/50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center">
              <span>Landing Page</span><span>·</span>
              <span>E-commerce</span><span>·</span>
              <span>Dashboard</span><span>·</span>
              <span>Portfolio</span><span>·</span>
              <span>Blog</span><span>·</span>
              <span>SaaS</span><span>·</span>
              <span>Web App</span><span>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="py-24 md:py-32 px-4 container mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">From idea to website in 3 steps</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Skip the boilerplate, the configuration, and the scaffolding. Go straight to shipping.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { num: "01", title: "Describe", desc: "Tell the AI what you want to build in plain language. The more detail, the better.", icon: Wand2 },
            { num: "02", title: "Generate", desc: "GPT-4o analyzes your request, designs a layout, and generates production-ready React code.", icon: Zap },
            { num: "03", title: "Export & Deploy", desc: "Preview your app instantly. Download the code or publish it live with one click.", icon: Server }
          ].map((step, i) => (
            <div key={i} className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute -right-4 -bottom-10 text-8xl font-black text-muted/30 select-none pointer-events-none group-hover:text-primary/5 transition-colors">
                {step.num}
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Type Showcase */}
      <section className="py-24 px-4 bg-muted/10 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Every project type.<br/>One platform.</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Whether you're building a quick marketing page or a complex internal tool, WebForge has the right architectural patterns built-in.</p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => setLocation("/generate")}>
              View all capabilities
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectTypes.map((type, i) => (
              <button
                key={type.id}
                onClick={() => setLocation(`/generate?type=${type.id}`)}
                className={`relative flex flex-col items-start p-6 rounded-2xl border ${type.border} bg-gradient-to-br ${type.color} text-left transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] group ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''} ${i === projectTypes.length - 1 ? 'lg:col-span-2' : ''}`}
              >
                <div className="h-10 w-10 rounded-xl bg-background/50 backdrop-blur-sm border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <type.icon className={`h-5 w-5 ${type.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                <p className="text-sm text-muted-foreground font-medium">Build a {type.name.toLowerCase()} →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { value: "10,000+", label: "Active Builders" },
            { value: "50,000+", label: "Sites Generated" },
            { value: "< 30s", label: "Average Build Time" },
            { value: "4.9/5", label: "Average Rating" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-muted/10 border-t border-border overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Loved by developers and founders</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "I needed a landing page for my new startup fast. WebForge gave me a gorgeous, responsive site in 20 seconds. It actually felt like magic.", name: "Sarah Chen", role: "Founder, DataFlow" },
              { quote: "As a backend dev, I hate writing CSS. This tool lets me describe the UI I want and gives me clean, standard Tailwind components I can actually read.", name: "Marcus Johnson", role: "Backend Engineer" },
              { quote: "We use WebForge to prototype internal dashboards. What used to take a week of React boilerplate now takes an afternoon of tweaking.", name: "Elena Rodriguez", role: "Product Manager" }
            ].map((t, i) => (
              <div key={i} className="glass p-8 rounded-3xl flex flex-col h-full">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Sparkles key={star} className="h-4 w-4 text-yellow-500" />)}
                </div>
                <p className="text-lg leading-relaxed mb-8 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Start building for free</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of creators building the next generation of web applications.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold glow" onClick={() => setLocation("/register")}>
              Create your account
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required. 3 free projects per month.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}