"use client";

import { Button } from "@/components/ui/button";
import { Check, Shield, Users, UserCheck, Github, Building2 } from "lucide-react";
import { sendGAEvent } from "@/lib/analytics";

const plans = [
  {
    name: "Community Edition",
    price: "Free",
    period: "",
    icon: Github,
    description: "Everything you need to run locally and explore automation.",
    features: [
      "Open Source",
      "Unlimited Local Logs",
      "VS Code & Cursor Connectors",
      "Self-Hostable MCP Server",
      "Community Discord Support",
      "MIT License"
    ],
    cta: "Get Started",
    variant: "primary",
    href: "https://github.com/onvo-ai/loghead",
  },
  {
    name: "Cloud Edition",
    price: "Coming Soon",
    period: "",
    icon: Building2,
    description: "For teams requiring managed infrastructure and control.",
    features: [
      "Managed MCP Infrastructure",
      "Team Access Controls",
      "SAML / SSO",
      "Cloud Connectors",
      "Priority Support"
    ],
    cta: "Join Waitlist",
    variant: "outline",
    href: "/request-new-log-connectors",
  }
];

const benefits = [
  {
    icon: Shield,
    text: "Built-in Guardrails"
  },
  {
    icon: Users,
    text: "Agent Orchestration"
  },
  {
    icon: UserCheck,
    text: "Human-in-the-Loop"
  }
];

export function PricingSection() {
  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900" id="pricing">
      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 items-start lg:grid-cols-2">
          {/* Left Column: Text Content */}
          <div
            className="pt-8 max-w-xl duration-700 animate-in fade-in slide-in-from-left-8"
          >
            <div className="flex items-center mb-4">
              <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
                Built for Scale & Security
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Affordable pricing. <br />
              Easy <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">scaling.</span>
            </h2>
            <p className="mb-12 text-lg leading-relaxed text-zinc-400">
              Start small to explore automation, add agents as you scale, and unlock enterprise-grade guardrails, orchestration, and reporting when you're ready.
            </p>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="p-2 text-white rounded-lg border bg-zinc-900 border-zinc-800">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-200">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing Cards */}
          <div className="space-y-6">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className="p-6 rounded-2xl border transition-colors bg-zinc-900/30 border-zinc-800 sm:p-8 hover:border-zinc-700 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="flex flex-col gap-6 justify-between h-full">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-white">{plan.name}</h3>
                      <div className="flex gap-1 items-baseline mb-2">
                        <span className="text-4xl font-bold text-zinc-200">{plan.price}</span>
                        {plan.period && <span className="text-sm text-zinc-500">/{plan.period}</span>}
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {plan.description}
                      </p>
                    </div>
                    
                    <Button 
                      className={`w-fit ${
                        plan.variant === "primary"
                          ? "bg-white text-black hover:bg-zinc-200" 
                          : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                      asChild
                    >
                      <a 
                        href={plan.href}
                        {...(plan.href.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => {
                          if (plan.variant === "primary") {
                            sendGAEvent('github_visit', { source: 'pricing_section' });
                          } else {
                            sendGAEvent('join_waitlist_click', { source: 'pricing_section' });
                          }
                        }}
                      >
                        {plan.cta}
                      </a>
                    </Button>
                  </div>

                  <div>
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-3 items-start text-sm text-zinc-300">
                          <div className="mt-1 min-w-[16px]">
                            <div className="flex justify-center items-center w-4 h-4 rounded-full bg-zinc-800">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


