import { useState } from "react";
import { useListPlans, useGetMe } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Loader2, Sparkles, Zap, Shield, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const [isAnnual, setIsAnnual] = useState(false);

  const renderContent = () => {
    if (plansLoading) {
      return (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      );
    }

    return (
      <div className="container mx-auto py-20 px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Sparkles className="mr-2 h-4 w-4" /> Clear & Predictable
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Pricing for every builder</h1>
          <p className="text-xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
            From side projects to enterprise applications, get the power of WebForge AI at a price that scales with you.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-primary" />
            <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annually 
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Save 20%</Badge>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {plans?.map((plan) => {
            const price = isAnnual ? Math.floor(plan.price * 0.8) : plan.price;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-primary shadow-2xl shadow-primary/20 md:scale-105 z-10 bg-card glow' 
                    : 'bg-card/50 border-border hover:border-primary/30'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold px-4 py-1.5 uppercase tracking-wider text-xs">
                      <Zap className="h-3.5 w-3.5 mr-1.5" /> Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className={`pb-6 ${plan.highlighted ? 'pt-8' : ''}`}>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.projectLimit ? `Perfect for testing out the platform. Up to ${plan.projectLimit} projects.` : "For power users and professionals. Unlimited everything."}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 pb-8">
                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-black">${price}</span>
                    <span className="text-muted-foreground font-medium">/month</span>
                  </div>
                  
                  {isAnnual && price > 0 && (
                    <p className="text-sm text-emerald-400 font-medium mb-6 -mt-4">Billed ${price * 12} yearly</p>
                  )}
                  
                  <div className="space-y-4">
                    <div className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">What's included</div>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  {user ? (
                    <Button 
                      className={`w-full h-12 text-base font-bold ${plan.highlighted ? 'shadow-lg shadow-primary/20' : ''}`}
                      variant={plan.highlighted ? "default" : "secondary"}
                      disabled={user.plan === plan.id}
                    >
                      {user.plan === plan.id ? "Current Plan" : "Upgrade to " + plan.name}
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full h-12 text-base font-bold ${plan.highlighted ? 'shadow-lg shadow-primary/20' : ''}`}
                      variant={plan.highlighted ? "default" : "secondary"}
                      asChild
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-primary" /> Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "Do I need to enter my credit card for the free plan?", a: "No, the free plan is completely free forever. We only ask for payment info when you upgrade to Pro or Business." },
              { q: "What happens if I hit my project limit?", a: "On the free plan, you can only maintain 3 active projects. You can delete old ones to make room, or upgrade to Pro for unlimited projects." },
              { q: "Can I export the code?", a: "Yes! All plans include full code export. The code generated is yours to keep, modify, and deploy anywhere." },
              { q: "Is the generated code production ready?", a: "Yes, we generate standard React applications using Tailwind CSS and shadcn/ui components. It's the same modern stack professional teams use." },
              { q: "Can I cancel my subscription?", a: "Absolutely. You can cancel your subscription at any time from your account settings. You'll keep access to premium features until the end of your billing cycle." }
            ].map((faq, i) => (
              <div key={i} className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-2">
                  <span className="text-primary mt-0.5">Q.</span> {faq.q}
                </h3>
                <p className="text-muted-foreground pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (userLoading) return <div className="min-h-screen bg-background" />;

  if (user) {
    return (
      <AppLayout>
        {renderContent()}
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      {renderContent()}
    </PublicLayout>
  );
}