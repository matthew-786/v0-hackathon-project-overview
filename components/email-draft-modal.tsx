
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Prospect } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { runComplianceAudit } from '@/lib/compliance-engine'
import { ComplianceAuditSidebar } from './compliance-audit-sidebar'

interface EmailDraftModalProps {
  prospect: Prospect | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialSubject?: string
  initialBody?: string
}

export function EmailDraftModal({
  prospect,
  isOpen,
  onClose,
  onSuccess,
  initialSubject,
  initialBody
}: EmailDraftModalProps) {
  const { user, addEmail } = useAuth()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate email template when prospect changes
  useEffect(() => {
    if (prospect && isOpen) {
      setRecipientEmail(prospect.email || '')
      if (initialSubject || initialBody) {
        setSubject(initialSubject || '')
        setBody(initialBody || '')
      } else {
        generateEmailDraft()
      }
    }
  }, [prospect, isOpen])

  // Run compliance analysis — informational only, does NOT gate sending
  const auditResult = useMemo(() => {
    if (!body) return null
    return runComplianceAudit(body)
  }, [body])

  const REGULATORY_FOOTER = `

──────────────────────────────────────────────────

For informational purposes only. Not investment advice. Past performance is not indicative of future results. Consult your tax and legal advisors before making financial decisions. Securities offered through Pulse Wealth Advisors LLC, Member FINRA/SIPC.`

  const generateEmailDraft = () => {
    if (!prospect) return
    setIsGenerating(true)
    setTimeout(() => {
      const firstName = prospect.name.split(' ')[0]
      const company = prospect.current_role.split(' at ').pop() || ''

      setSubject(`Connecting on Financial Planning for ${company} Professionals`)

      const draftBody = `Hi ${firstName},

Given your role at ${company}, I wanted to reach out about some planning considerations that often become relevant for professionals at your level.

${prospect.recommended_outreach_angle}

Our focus is specifically on ${getSpecificFocus(prospect.matched_icp)} — areas that can complement your existing advisory relationships rather than replace them.

Would you be open to a brief conversation to explore whether this might be relevant to your situation?

Best regards,
${user?.name || 'Your Financial Advisor'}${REGULATORY_FOOTER}`

      setBody(draftBody)
      setIsGenerating(false)
    }, 1000)
  }

  const getSpecificFocus = (icp: string) => {
    const focuses: Record<string, string> = {
      'high_income_professional': 'equity compensation optimization and deferred comp strategies',
      'business_owners_exits': 'post-liquidity event tax planning and wealth structuring',
      'business_owners_succession': 'business succession and estate planning strategies',
      'pre_retiree': 'retirement income optimization and tax-efficient distribution planning'
    }
    return focuses[icp] || 'specialized tax strategies'
  }

  // Only path available to advisor: submit for compliance review (status = 'pending')
  const handleSubmitForReview = async () => {
    if (!prospect || !user || !subject || !body) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    addEmail({
      prospectId: prospect.id,
      prospectName: prospect.name,
      recipientEmail,
      subject,
      body,
      status: 'pending',
      advisorId: user.id,
      advisorName: user.name
    })

    setIsSubmitting(false)
    onSuccess?.()
    onClose()
    setSubject('')
    setBody('')
    setRecipientEmail('')
  }

  if (!isOpen || !prospect) return null

  const hasIssues = auditResult && !auditResult.isVerified
  const canSubmit = !!subject && !!body && !isGenerating && !isSubmitting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">

        {/* ── Left Column: Email Form ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto w-full lg:w-2/3">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1e293b] shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-white">Draft Email</h2>
              <p className="text-sm text-[#64748b] mt-0.5">
                To: <span className="text-[#94a3b8]">{prospect.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 flex-1">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 h-full">
                <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#94a3b8]">Generating personalized email...</p>
              </div>
            ) : (
              <>
                {/* To */}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">To</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-[#1e293b]/50 border border-[#1e293b] rounded-lg text-[#94a3b8] text-sm flex items-center">
                      {prospect.name}
                    </div>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Recipient Email"
                      className="flex-[2] px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                  />
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Message</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={16}
                    className="w-full flex-1 px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* Compliance flow info banner */}
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                  hasIssues
                    ? 'bg-[#422006]/30 border-[#f59e0b]/30'
                    : 'bg-[#0f2b1f]/40 border-[#22c55e]/20'
                }`}>
                  {hasIssues ? (
                    <svg className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${hasIssues ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>
                      {hasIssues ? 'Potential issues detected — review sidebar' : 'Draft looks clean'}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">
                      Submitting sends this draft to your compliance officer for review.
                      You will be able to send it to the client only after it is approved.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#1e293b] shrink-0 bg-[#111827] rounded-bl-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={generateEmailDraft}
                disabled={isGenerating}
                className="px-4 py-2.5 text-sm text-[#94a3b8] border border-[#1e293b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>

              {/* ONLY send path: submit for compliance review */}
              <button
                onClick={handleSubmitForReview}
                disabled={!canSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:from-[#2563eb] hover:to-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Submit for Compliance Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Compliance Sidebar (read-only) ─────────────────── */}
        <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-[#1e293b] bg-[#0a0f1c] rounded-r-2xl overflow-hidden shrink-0 flex flex-col">
          <div className="flex lg:hidden items-center justify-between p-4 border-b border-[#1e293b]">
            <h2 className="text-sm font-semibold text-white">Compliance Audit</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Sidebar is read-only — no override prop passed */}
            <ComplianceAuditSidebar
              auditResult={auditResult}
              canOverride={false}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

