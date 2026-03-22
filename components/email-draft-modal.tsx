'use client'

import { useState, useEffect, useMemo } from 'react'
import { Prospect } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { z } from 'zod'
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

const complianceSchema = z.object({
  is_compliant: z.boolean(),
  flagged_text: z.array(z.string()),
  rule_cited: z.string(),
  suggested_fix: z.string(),
  explanation: z.string()
})

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

  const { object, submit, isLoading, error } = useObject({
    api: '/api/compliance',
    schema: complianceSchema,
    onFinish: ({ object }: { object?: z.infer<typeof complianceSchema> }) => {
      if (!prospect || !user) return;

      const isCompliant = object?.is_compliant ?? false;
      const status = isCompliant ? 'approved' : 'pending';
      const notes = object?.explanation || '';

      // Save the email with the outcome of the compliance check
      addEmail({
        prospectId: prospect.id,
        prospectName: prospect.name,
        recipientEmail,
        subject,
        body,
        status,
        advisorId: user.id,
        advisorName: user.name,
        complianceNotes: notes,
      });

      // Notify and close
      onSuccess?.()
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  });

  const handleClose = () => {
    setSubject('')
    setBody('')
    setRecipientEmail('')
    onClose()
  }

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
  }, [prospect, isOpen, initialSubject, initialBody])

  // Run compliance analysis — informational only, does NOT gate sending
  const auditResult = useMemo(() => {
    if (!body) return null
    return runComplianceAudit(body)
  }, [body])

  const generateEmailDraft = () => {
    if (!prospect) return

    setIsGenerating(true)

    setTimeout(() => {
      const firstName = prospect.name.split(' ')[0]
      const company = prospect.current_role.split(' at ').pop() || ''

      setSubject(`Innovative Tax Strategy for ${company} Executives`)

      setBody(`Hi ${firstName},

Given your role at ${company}, I wanted to share an innovative tax-advantaged strategy we're seeing work well for professionals in your position.

${prospect.recommended_outreach_angle}

This is designed as an ancillary opportunity to optimize your overall tax efficiency without replacing your current advisory team. Our focus is specifically on ${getSpecificFocus(prospect.matched_icp)} that often fall outside traditional advisory scope.

Would you be interested in a brief conversation to see if this approach might benefit your situation?

Best regards,
${user?.name || 'Your Financial Advisor'}`)

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

  const handleSendForReview = () => {
    if (!prospect || !user) return

    submit({
      emailBody: body,
      subject: subject
    });
  }

  if (!isOpen || !prospect) return null

  const canSubmit = !!subject && !!body && !isGenerating && !isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isLoading ? undefined : handleClose} />

      <div className="relative w-full max-w-4xl mx-4 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Main drafting area */}
        <div className="flex-1 p-6 flex flex-col h-[80vh]">
          <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#1e293b]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Draft Email</h2>
              {!isLoading && (
                <button
                  onClick={handleClose}
                  className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1.5">Recipient Name</label>
                <div className="px-4 py-2.5 bg-[#1e293b]/50 border border-[#1e293b] rounded-lg text-[#94a3b8] text-sm flex items-center h-[46px]">
                  {prospect.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-sm transition-all h-[46px]"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {isLoading || object?.explanation ? (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-4">
                  {isLoading && (
                    <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {isLoading ? 'Running Compliance Check...' : 'Compliance Check Complete'}
                    </h3>
                    <p className="text-sm text-[#94a3b8]">AI is reviewing this draft against FINRA 2210</p>
                  </div>
                </div>

                {object?.explanation && (
                  <div className="bg-[#0a0f1c] p-4 rounded-lg border border-[#1e293b]">
                    <p className="text-sm font-medium text-[#22c55e] mb-2 uppercase tracking-wider">AI Analysis</p>
                    <p className="text-[#e2e8f0] opacity-90 leading-relaxed min-h-[60px]">
                      {object.explanation}
                      {isLoading && <span className="animate-pulse">_</span>}
                    </p>
                  </div>
                )}

                {object?.is_compliant !== undefined && (
                  <div className={`p-4 rounded-lg border ${object.is_compliant ? 'bg-[#052e16]/30 border-[#22c55e]/30' : 'bg-[#422006]/30 border-[#f59e0b]/30'}`}>
                    <div className="flex items-start gap-3">
                      {object.is_compliant ? (
                        <svg className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      <div>
                        <p className={`text-sm font-medium ${object.is_compliant ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
                          {object.is_compliant ? 'Approved: Safe to Send' : 'Flagged: Routing to Human Review'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#94a3b8]">Generating personalized email...</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Message</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none font-mono text-sm leading-relaxed h-[300px]"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#1e293b]">
            {!isLoading && !object?.explanation && (
              <>
                <button
                  onClick={generateEmailDraft}
                  disabled={isGenerating}
                  className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendForReview}
                  disabled={!canSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:from-[#2563eb] hover:to-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Check AI Compliance & Send
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[320px] bg-[#0a0f1c] border-l border-[#1e293b]">
          <ComplianceAuditSidebar
            auditResult={auditResult}
            canOverride={false}
          />
        </div>
      </div>
    </div>
  )
}
