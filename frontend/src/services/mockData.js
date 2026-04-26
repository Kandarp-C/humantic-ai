export const mockFindings = [
  {
    id: '1',
    category: 'Insights',
    confidence: 'HIGH',
    title: 'Market Shift in Enterprise AI Adoption',
    summary: 'Large-scale enterprises are moving from experimentation to production-ready AI agents, focusing on ROI and security over raw performance.',
    sourceCount: 12,
    timestamp: '2h ago',
    reasoning: 'This finding is surfaced because it aligns with your interest in B2B SaaS trends and matches recent activity in major tech procurement hubs.',
    status: 'pending'
  },
  {
    id: '2',
    category: 'Trends',
    confidence: 'MEDIUM',
    title: 'Decline in Standard SaaS Subscription Models',
    summary: 'Usage-based pricing is becoming the preferred model for infrastructure tools, while application layers are sticking to per-seat pricing with higher churn.',
    sourceCount: 8,
    timestamp: '5h ago',
    reasoning: 'Surfaced due to the high volume of financial reports indicating a shift in revenue recognition patterns among top-tier software firms.',
    status: 'pending'
  },
  {
    id: '3',
    category: 'Opportunities',
    confidence: 'HIGH',
    title: 'Underserved Market: AI Safety for SMBs',
    summary: 'Small and medium businesses are adopting AI but lack the specialized security frameworks that large enterprises use, creating a gap for localized safety tools.',
    sourceCount: 5,
    timestamp: '1d ago',
    reasoning: 'Identified as a high-potential opportunity based on your previous research into cybersecurity gaps in emerging markets.',
    status: 'pending'
  },
  {
    id: '4',
    category: 'Experimental',
    confidence: 'SPECULATIVE',
    title: 'Biological Computing Frameworks',
    summary: 'Early research into DNA-based storage and processing is seeing a slight uptick in seed funding, though commercial viability remains 10+ years away.',
    sourceCount: 3,
    timestamp: '2d ago',
    reasoning: 'Included because it represents a frontier technology that could disrupt the hardware supply chain in the long term.',
    status: 'pending'
  }
];

export const mockTopics = [
  {
    id: 't1',
    title: 'Future of Generative AI in Legal Tech',
    status: 'completed',
    cycles: 12,
    createdAt: '2026-04-20T10:00:00Z'
  },
  {
    id: 't2',
    title: 'Sustainable Energy Solutions in Southeast Asia',
    status: 'researching',
    cycles: 4,
    createdAt: '2026-04-25T22:00:00Z'
  },
  {
    id: 't3',
    title: 'Privacy-Preserving Computation Techniques',
    status: 'pending',
    cycles: 0,
    createdAt: '2026-04-26T15:30:00Z'
  }
];

export const mockPins = [
  {
    id: 'p1',
    description: 'Quantum Computing breakthroughs in material science',
    lastChecked: '3h ago'
  },
  {
    id: 'p2',
    description: 'Regulatory changes for crypto in EU and APAC',
    lastChecked: '1d ago'
  }
];
