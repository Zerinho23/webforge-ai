import { Link } from "wouter";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/30 relative">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-transparent">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
            <Wand2 className="h-5 w-5 text-primary" />
            <span>WebForge AI</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Pricing
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Button asChild size="sm" className="rounded-full px-4 h-9">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col pt-16">
        {children}
      </main>
    </div>
  );
}