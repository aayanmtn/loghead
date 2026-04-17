import { HeroSection } from "@/components/hero-section";
import { LogoCarouselSection } from "@/components/logo-carousel-section";
import { ProblemSection } from "@/components/problem-section";
import { AhaMomentSection } from "@/components/aha-moment-section";
import { MechanismSection } from "@/components/mechanism-section";
import { AllSourcesSection } from "@/components/all-sources-section";
import { FlowStateSection } from "@/components/flow-state-section";
import { AccelerationSection } from "@/components/acceleration-section";
import { HowToUseSection } from "@/components/how-to-use-section";
import { BenefitSection } from "@/components/benefit-section";
import { FeatureSection } from "@/components/feature-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { CommunitySection } from "@/components/community-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does Loghead protect my data privacy?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Loghead is self-hostable and runs entirely on your local machine. Your data never leaves your environment unless you explicitly configure a cloud connector. We have zero access to your logs.'
                }
              },
              {
                '@type': 'Question',
                name: 'What is the benefit of using an MCP server?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Model Context Protocol (MCP) normalizes logs from various sources (Docker, System, Apps) into a single, structured format that LLMs can easily digest, improving context quality and reducing hallucinations.'
                }
              },
              {
                '@type': 'Question',
                name: "Why don't you offer automated fixing/analysis?",
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We believe in doing one thing well: delivering clean context. We provide the high-quality fuel (logs), so your existing AI tools (Cursor, Windsurf, Copilot) can do what they do best—fixing code.'
                }
              },
              {
                '@type': 'Question',
                name: 'Is the Community Edition limited?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. The Community Edition is fully featured for local development. It includes unlimited local logs, all standard connectors, and will always be free and open source.'
                }
              }
            ]
          })
        }}
      />
      <HeroSection />
      <LogoCarouselSection />
      <ProblemSection />
      <HowToUseSection/>
      <AhaMomentSection />
      <MechanismSection />
      <AllSourcesSection />
      <FlowStateSection />
      <AccelerationSection />
      <BenefitSection />
      <FeatureSection />
      <PricingSection />
      <FAQSection />
      <CommunitySection />
      <CTASection />
    </>
  );
}