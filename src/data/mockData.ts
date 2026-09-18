export interface SlideInsight {
  id: number;
  title: string;
  type: string;
  scores: {
    content: number;
    design: number;
    impact: number;
  };
  issues: string[];
  suggestions: string[];
  rewrite: {
    original: string;
    improved: string;
  };
}

export const mockInsights: SlideInsight[] = [
  {
    id: 1,
    title: "Problem Statement",
    type: "Problem",
    scores: { content: 65, design: 50, impact: 80 },
    issues: [
      "Too much text on the slide.",
      "The core problem is hidden in the second paragraph.",
      "Lack of quantitative data to support the magnitude of the problem."
    ],
    suggestions: [
      "Use bullet points or a 3-column layout.",
      "Highlight the '$50B wasted annually' metric.",
      "Reduce word count by 40%."
    ],
    rewrite: {
      original: "Many companies struggle with managing their internal resources efficiently. Often, this leads to employees wasting hours every week looking for documents, which costs the industry an estimated $50 billion every year.",
      improved: "The Problem: Resource Fragmentation\n\n• Employees waste 5+ hours/week finding documents\n• Costs the industry $50B annually\n• Current solutions dictate workflows rather than adapting to them"
    }
  },
  {
    id: 2,
    title: "Solution & Product",
    type: "Solution",
    scores: { content: 85, design: 90, impact: 85 },
    issues: [
      "Missing visual of the actual product interface.",
    ],
    suggestions: [
      "Add a high-fidelity mockup showing the unified search bar.",
      "Make the 'How it works' steps more prominent."
    ],
    rewrite: {
      original: "Our solution is a unified platform that connects to all your tools and allows you to search everything at once.",
      improved: "The Solution: A Centralized Intelligence Hub\n\n[Insert Hero Product UI]\n\n1. Connect integrations in 1-click\n2. AI indexes your company knowledge\n3. Instant answers, everywhere"
    }
  },
  {
    id: 3,
    title: "Market Size",
    type: "Market",
    scores: { content: 50, design: 60, impact: 55 },
    issues: [
      "TAM/SAM/SOM calculation is not credible.",
      "Using 'top-down' $1 Trillion market calculation without bottoms-up validation."
    ],
    suggestions: [
      "Replace generic TAM with a bottoms-up calculation (Seats × ACV).",
      "Focus on the initial beachhead market (SAM)."
    ],
    rewrite: {
      original: "The global software market is $1 Trillion. If we capture just 1% of this, we will be a $10 Billion company.",
      improved: "Bottoms-Up Market Validation\n\n• SOM (Initial Target): 50k agencies × $1,200 ACV = $60M\n• SAM (Mid-Market B2B): 1.2M companies = $1.4B\n• TAM (Global Knowledge Workers): $24B"
    }
  },
  {
    id: 4,
    title: "Business Model",
    type: "Solution",
    scores: { content: 70, design: 80, impact: 75 },
    issues: [
      "Pricing tiers are not clear enough for enterprise customers.",
      "LTV to CAC ratios are omitted."
    ],
    suggestions: [
      "Provide clear standard vs enterprise volume calculations.",
      "State average contract values (ACV)."
    ],
    rewrite: {
      original: "We charge $10/user for standard and talk to us for enterprise plans.",
      improved: "SaaS Monetization Structure:\n\n• Pro: $12/seat/mo (SMB Beachhead)\n• Enterprise: $45/seat/mo (Volume discounts available)\n• Expected ACV: $14,400"
    }
  },
  {
    id: 5,
    title: "Competitive Landscape",
    type: "Problem",
    scores: { content: 80, design: 70, impact: 60 },
    issues: [
      "The standard 2x2 grid makes you look identical to competitors.",
      "Unclear competitive moat."
    ],
    suggestions: [
      "Focus on proprietary technical moats.",
      "Emphasize enterprise integration agility."
    ],
    rewrite: {
      original: "We are better than Salesforce and Microsoft because our UI is cleaner.",
      improved: "Strategic Advantages:\n\n• API-First Data Sync (0.2s latency vs 4s legacy)\n• SOC2 compliant day 1\n• 35% higher conversion rates mapped in beta."
    }
  },
  {
    id: 6,
    title: "The Ask",
    type: "Market",
    scores: { content: 60, design: 85, impact: 50 },
    issues: [
      "Missing specific breakdown of use-of-funds.",
      "Fundraising timeline lacks clarity."
    ],
    suggestions: [
      "Include clear percentage breakdowns for Product, Sales, Ops.",
      "Specify an 18-month development runway."
    ],
    rewrite: {
      original: "We are raising $2,000,000 to scale operations.",
      improved: "$2M Seed Round Allocation:\n\n• 50% Engineering (Ship core v2.0)\n• 30% Growth & GTM scaling\n• 20% Operations & runway safety"
    }
  }
];

export const mockDashboardData = {
  overallScore: 72,
  summary: "Overall, the deck has a strong product vision and founder-market fit, but lacks rigorous financial execution and a bottoms-up market validation. Structural edits are needed before institutional fundraising.",
  successProbability: 60,
  sections: {
    market: 55,
    financials: 65,
    product: 88,
    clarity: 70,
    storytelling: 82
  },
  strengths: [
    "Compelling product vision and clean UI mockups.",
    "Strong founder-market fit.",
    "Clear understanding of the immediate competitor landscape."
  ],
  weaknesses: [
    "Market sizing methodology throws up red flags for institutional investors.",
    "Financial projections lack cost-of-acquisition (CAC) assumptions.",
    "The 'Ask' slide is missing use-of-funds breakdown."
  ],
  advancedMetrics: {
    idea: 88,
    product: 80,
    gtm: 79,
    revenue: 70,
    ip: 42,
    scalability: 77,
    network: 75,
    exit: 38
  },
  dealMemo: {
    marketNotes: [
      "Enterprise automation remains a large and active market, but buyer budgets are increasingly concentrating around solutions with measurable ROI.",
      "More selective purchasing behavior benefits products with deep workflow integration while putting pressure on feature-level vendors."
    ],
    diligenceGaps: [
      "No clear cohort retention view or sufficient evidence of expansion revenue quality.",
      "Limited proof that the claimed product moat is defensible against broader platform competitors."
    ],
    financialFlags: [
      "Revenue concentration risk: top 3 customers represent approximately 60% of current revenue.",
      "Unit economics cannot yet be underwritten with confidence because CAC payback and expansion efficiency are not disclosed."
    ],
    increaseConviction: [
      "Disclosure of strong gross and net revenue retention by cohort or segment.",
      "Evidence that revenue concentration will reduce as new customers are added over the next 2-3 quarters."
    ],
    recommendedDiligence: [
      "How much of current growth comes from expansion versus new logos?",
      "What percentage of revenue would be at risk if the largest customer did not renew?"
    ],
    assumptions: [
      "Current customer usage reflects real workflow value rather than one-off innovation budget spending.",
      "The company can diversify revenue beyond its largest customers without materially weakening pricing or margin quality."
    ],
    finalVerdict: "TechFlow AI is a credible first-pass opportunity with real signs of traction, but current evidence is not yet sufficient for high conviction. The next step should be targeted diligence on revenue quality, customer concentration, moat durability, and sales repeatability."
  }
};
