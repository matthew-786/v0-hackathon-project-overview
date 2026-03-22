// Prospect/Client types based on the hackathon dataset
export interface Prospect {
  id: string
  name: string
  current_role: string
  location: string
  linkedin_url: string
  icp_match_score: number
  urgency_score: number
  matched_icp: string
  summary: string
  match_reasons: string[]
  why_now_reasons: string[]
  concerns: string[]
  recommended_outreach_angle: string
  email: string
}

// Email status types
export type EmailStatus = 'draft' | 'pending' | 'approved' | 'denied' | 'sent'

// Email record for tracking
export interface EmailRecord {
  id: string
  prospectId: string
  prospectName: string
  subject: string
  body: string
  status: EmailStatus
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  denialReason?: string
  complianceNotes?: string
  advisorId: string
  advisorName: string
  recipientEmail: string
}

// User types
export type UserRole = 'financial_advisor' | 'compliance_officer'

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
}
