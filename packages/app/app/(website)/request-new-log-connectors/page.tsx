import { RequestConnectorForm } from "@/components/request-connector-form";
import { Check } from "lucide-react";
import { CTASection } from "@/components/cta-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Request Log Connectors & Join Cloud Waitlist',
  description: 'Request custom log connectors for your stack (Java, Ruby, PHP, etc.) and join the waitlist for Loghead Cloud. Managed MCP infrastructure for teams.',
  keywords: ['log connectors', 'cloud logging', 'managed log viewer', 'mcp infrastructure', 'team logging', 'logging integrations', 'waitlist'],
};

export default function RequestConnectorsPage() {
  const features = [
    "Managed MCP Infrastructure",
    "Team Access Controls",
    "SAML / SSO",
    "Cloud Connectors",
    "Priority Support"
  ];

  return (
    <div className="flex relative flex-col min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-[0.05] pointer-events-none" />
      
      <div className="container flex relative z-10 flex-col flex-1 justify-center items-center px-4 pt-32 pb-16 mx-auto">
        <div className="mb-12 w-full max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Join the <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Waitlist</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-zinc-400">
            Submit your email to join the waitlist for the Cloud Plan release. 
            You can also use this form to request specific connectors and help us prioritize our development cycle.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mx-auto mt-8 max-w-4xl md:gap-4">
            {features.map((item) => (
              <div key={item} className="flex items-center px-4 py-2 text-sm rounded-full border backdrop-blur-sm text-zinc-300 bg-zinc-900/50 border-zinc-800/50">
                <Check className="h-3.5 w-3.5 text-[#00FF94] mr-2 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <RequestConnectorForm />
      </div>
      
      <CTASection />
    </div>
  );
}
