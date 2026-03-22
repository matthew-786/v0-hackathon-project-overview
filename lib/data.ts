import { Prospect, User } from './types'

// Sample prospects data based on hackathon dataset structure
export const prospects: Prospect[] = [
  {
    id: '1',
    name: 'Michael Chen',
    current_role: 'Managing Director at Goldman Sachs',
    location: 'New York, NY',
    linkedin_url: 'https://linkedin.com/in/michaelchen',
    icp_match_score: 92,
    urgency_score: 88,
    matched_icp: 'high_income_professional',
    summary: 'Senior finance executive with 15+ years at Goldman Sachs, recently promoted to Managing Director. Likely has significant equity compensation and complex tax situation.',
    match_reasons: [
      'High-income W2 earner with equity compensation',
      'Located in high-tax jurisdiction (NYC)',
      'Senior position indicates significant AUM potential'
    ],
    why_now_reasons: [
      'Recent promotion to Managing Director',
      'End of year bonus season approaching',
      'Likely vesting of significant RSU grants'
    ],
    concerns: [
      'May have existing advisory relationship through Goldman',
      'Compliance considerations for financial services employees'
    ],
    recommended_outreach_angle: 'Focus on tax-advantaged strategies for equity compensation and deferred comp optimization'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    current_role: 'Partner at Kirkland & Ellis LLP',
    location: 'Chicago, IL',
    linkedin_url: 'https://linkedin.com/in/sarahwilliams',
    icp_match_score: 95,
    urgency_score: 91,
    matched_icp: 'high_income_professional',
    summary: 'Recently elevated to Partner at top-tier law firm. Partnership brings significant K-1 income and carried interest considerations.',
    match_reasons: [
      'New partner status indicates income jump to $1M+',
      'K-1 distributions create complex tax planning needs',
      'Law firm partners often underserved by traditional advisors'
    ],
    why_now_reasons: [
      'Just made partner this year',
      'First year dealing with partnership tax complexity',
      'Capital contribution requirements create liquidity planning needs'
    ],
    concerns: [
      'Time-constrained due to partner workload',
      'May be skeptical of outreach'
    ],
    recommended_outreach_angle: 'Address K-1 tax optimization and capital call liquidity strategies for new partners'
  },
  {
    id: '3',
    name: 'David Rodriguez',
    current_role: 'Founder & CEO at TechFlow (Recently Acquired)',
    location: 'San Francisco, CA',
    linkedin_url: 'https://linkedin.com/in/davidrodriguez',
    icp_match_score: 98,
    urgency_score: 95,
    matched_icp: 'business_owners_exits',
    summary: 'Founder of enterprise SaaS company recently acquired for $150M. Facing significant capital gains and wealth transition decisions.',
    match_reasons: [
      'Recent liquidity event of $150M+',
      'First-time exit creates complex planning needs',
      'California residence maximizes tax planning opportunity'
    ],
    why_now_reasons: [
      'Acquisition closed within last 90 days',
      'Earnout period creates ongoing planning needs',
      'Time-sensitive charitable giving opportunities'
    ],
    concerns: [
      'Likely being approached by many advisors',
      'May have existing M&A advisor relationships'
    ],
    recommended_outreach_angle: 'Focus on post-exit tax strategies, QSBS optimization, and charitable giving vehicles'
  },
  {
    id: '4',
    name: 'Jennifer Thompson',
    current_role: 'Chief Medical Officer at Regional Health System',
    location: 'Boston, MA',
    linkedin_url: 'https://linkedin.com/in/jenniferthompson',
    icp_match_score: 85,
    urgency_score: 78,
    matched_icp: 'pre_retiree',
    summary: 'Healthcare executive approaching retirement with substantial deferred compensation and pension benefits.',
    match_reasons: [
      'High-income executive with deferred comp',
      '457(b) and pension optimization opportunities',
      'Healthcare executives often have complex benefits'
    ],
    why_now_reasons: [
      'Announced retirement timeline of 18 months',
      'Deferred comp distribution elections due',
      'Medicare planning considerations'
    ],
    concerns: [
      'May have long-standing advisor relationship',
      'Conservative approach to financial decisions'
    ],
    recommended_outreach_angle: 'Retirement income optimization and tax-efficient deferred comp distribution strategies'
  },
  {
    id: '5',
    name: 'Robert Kim',
    current_role: 'Owner, Kim Manufacturing Group',
    location: 'Detroit, MI',
    linkedin_url: 'https://linkedin.com/in/robertkim',
    icp_match_score: 89,
    urgency_score: 85,
    matched_icp: 'business_owners_succession',
    summary: 'Second-generation manufacturing business owner exploring succession options. Company valued at $40M+.',
    match_reasons: [
      'Significant business equity concentration',
      'Succession planning creates multi-year engagement',
      'Estate planning needs with business assets'
    ],
    why_now_reasons: [
      'Recently began succession planning discussions',
      'Children showing interest in leadership roles',
      'Industry consolidation creating M&A opportunities'
    ],
    concerns: [
      'Family dynamics may complicate planning',
      'Emotional attachment to business legacy'
    ],
    recommended_outreach_angle: 'Business succession strategies including GRAT, IDGT, and installment sale techniques'
  },
  {
    id: '6',
    name: 'Amanda Foster',
    current_role: 'VP of Engineering at Stripe',
    location: 'San Francisco, CA',
    linkedin_url: 'https://linkedin.com/in/amandafoster',
    icp_match_score: 91,
    urgency_score: 82,
    matched_icp: 'high_income_professional',
    summary: 'Senior tech executive with substantial equity compensation. Pre-IPO stock and RSU management needs.',
    match_reasons: [
      'Significant equity compensation at high-growth company',
      'Pre-IPO planning opportunities',
      'High W2 income in high-tax state'
    ],
    why_now_reasons: [
      'IPO rumors creating urgency for planning',
      'Recent equity refresh grants vesting',
      'Tax planning window before potential liquidity'
    ],
    concerns: [
      'Tech employees often DIY investing',
      'May have existing startup advisor'
    ],
    recommended_outreach_angle: 'Pre-IPO planning strategies including 83(b) elections, QSBS, and concentration risk management'
  },
  {
    id: '7',
    name: 'Thomas Wright',
    current_role: 'Retired CEO, Wright Industries',
    location: 'Palm Beach, FL',
    linkedin_url: 'https://linkedin.com/in/thomaswright',
    icp_match_score: 87,
    urgency_score: 75,
    matched_icp: 'pre_retiree',
    summary: 'Recently retired CEO with $25M+ in liquid assets. Focus on wealth preservation and estate planning.',
    match_reasons: [
      'Significant liquid wealth requiring management',
      'Estate planning needs with wealth transfer goals',
      'Florida residence indicates tax-conscious'
    ],
    why_now_reasons: [
      'First year of retirement creating new needs',
      'Estate plan review due after retirement',
      'RMD planning starting next year'
    ],
    concerns: [
      'Likely has established advisory relationships',
      'May be wary of new advisor outreach'
    ],
    recommended_outreach_angle: 'Estate planning optimization and charitable giving strategies for retirees'
  },
  {
    id: '8',
    name: 'Lisa Park',
    current_role: 'Co-Founder at BioGenix (Series C)',
    location: 'Cambridge, MA',
    linkedin_url: 'https://linkedin.com/in/lisapark',
    icp_match_score: 93,
    urgency_score: 89,
    matched_icp: 'business_owners_exits',
    summary: 'Biotech founder with company approaching potential acquisition. Significant paper wealth requiring planning.',
    match_reasons: [
      'Founder equity at acquisition-stage company',
      'QSBS planning opportunities',
      'First-time founder needs guidance'
    ],
    why_now_reasons: [
      'Active acquisition discussions reported',
      'Secondary sale opportunity available',
      'QSBS holding period considerations'
    ],
    concerns: [
      'Deal uncertainty may delay planning',
      'Complex cap table with multiple share classes'
    ],
    recommended_outreach_angle: 'Pre-exit planning for biotech founders including QSBS optimization and secondary transactions'
  }
]

// User credentials
export const users: User[] = [
  {
    id: 'fa1',
    username: 'finadv1',
    password: '1234',
    role: 'financial_advisor',
    name: 'John Mitchell'
  },
  {
    id: 'co1',
    username: 'compoff1',
    password: '4321',
    role: 'compliance_officer',
    name: 'Emily Carter'
  }
]
