'use client'

import { useState } from 'react'
import { EmailRecord } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

interface ComplianceReviewModalProps {
  email: EmailRecord | null
  isOpen: boolean
  onClose: () => void
}

// Common compliance issues to check for
const complianceChecks = [
  { id: 'guarantees', label: 'No performance guarantees', description: 'Email does not promise specific returns or outcomes' },
  { id: 'replace', label: 'Complementary positioning', description: 'Does not suggest replacing existing advisor' },
  { id: 'claims', label: 'No unsubstantiated claims', description: 'All claims are verifiable or appropriately hedged' },
  { id: 'disclosure', label: 'Appropriate disclosure', description: 'Contains necessary disclaimers if applicable' },
  { id: 'professional', label: 'Professional tone', description: 'Language is appropriate for business communication' },
]

export function ComplianceReviewModal({ email, isOpen, onClose }: ComplianceReviewModalProps) {
  const { user, updateEmailStatus } = useAuth()
  const [action, setAction] = useState<'approve' | 'deny' | null>(null)
  const [denialReason, setDenialReason] = useState('')
  const [complianceNotes, setComplianceNotes] = useState('')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = complianceChecks.every(check => checkedItems[check.id])

  const handleSubmit = async () => {
    if (!email || !user || !action) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (action === 'approve') {
      updateEmailStatus(
        email.id, 
        'approved', 
        user.name, 
        undefined,
        complianceNotes || 'Reviewed and approved for SEC/FINRA compliance.'
      )
    } else {
      updateEmailStatus(
        email.id, 
        'denied', 
        user.name, 
        denialReason || 'Does not meet compliance requirements.',
        undefined
      )
    }

    setIsSubmitting(false)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setAction(null)
    setDenialReason('')
    setComplianceNotes('')
    setCheckedItems({})
  }

  if (!isOpen || !email) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#1e293b] bg-[#111827]">
          <div>
            <h2 className="text-xl font-semibold text-white">Compliance Review</h2>
            <p className="text-sm text-[#64748b] mt-1">
              Email to {email.prospectName} from {email.advisorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Subject</label>
              <p className="text-white bg-[#0a0f1c] px-4 py-3 rounded-lg border border-[#1e293b]">{email.subject}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Message Body</label>
              <div className="bg-[#0a0f1c] px-4 py-3 rounded-lg border border-[#1e293b] max-h-64 overflow-y-auto">
                <pre className="text-sm text-[#94a3b8] whitespace-pre-wrap font-mono">{email.body}</pre>
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">SEC/FINRA Compliance Checklist</h3>
            <div className="space-y-3">
              {complianceChecks.map((check) => (
                <label
                  key={check.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    checkedItems[check.id]
                      ? 'bg-[#052e16]/30 border-[#22c55e]/50'
                      : 'bg-[#0a0f1c] border-[#1e293b] hover:border-[#3b82f6]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedItems[check.id] || false}
                    onChange={() => handleCheckItem(check.id)}
                    className="mt-0.5 w-4 h-4 rounded border-[#475569] bg-[#1e293b] text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-0"
                  />
                  <div>
                    <p className={`text-sm font-medium ${checkedItems[check.id] ? 'text-[#22c55e]' : 'text-white'}`}>
                      {check.label}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5">{check.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Review Decision</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAction('approve')}
                disabled={!allChecked}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === 'approve'
                    ? 'border-[#22c55e] bg-[#22c55e]/10'
                    : 'border-[#1e293b] hover:border-[#22c55e]/50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className={`w-6 h-6 ${action === 'approve' ? 'text-[#22c55e]' : 'text-[#64748b]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`font-semibold ${action === 'approve' ? 'text-[#22c55e]' : 'text-white'}`}>Approve</span>
                </div>
                <p className="text-xs text-[#64748b]">Email meets all compliance requirements</p>
              </button>
              
              <button
                onClick={() => setAction('deny')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === 'deny'
                    ? 'border-[#ef4444] bg-[#ef4444]/10'
                    : 'border-[#1e293b] hover:border-[#ef4444]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className={`w-6 h-6 ${action === 'deny' ? 'text-[#ef4444]' : 'text-[#64748b]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className={`font-semibold ${action === 'deny' ? 'text-[#ef4444]' : 'text-white'}`}>Deny</span>
                </div>
                <p className="text-xs text-[#64748b]">Email requires revisions</p>
              </button>
            </div>
          </div>

          {/* Conditional Input Fields */}
          {action === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Compliance Notes (Optional)</label>
              <textarea
                value={complianceNotes}
                onChange={(e) => setComplianceNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about the compliance review..."
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none"
              />
            </div>
          )}

          {action === 'deny' && (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Reason for Denial <span className="text-[#ef4444]">*</span></label>
              <textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                rows={3}
                placeholder="Explain why this email does not meet compliance requirements..."
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] bg-[#111827]">
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!action || (action === 'deny' && !denialReason) || isSubmitting}
            className={`px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'approve' 
                ? 'bg-[#22c55e] hover:bg-[#16a34a]' 
                : action === 'deny'
                  ? 'bg-[#ef4444] hover:bg-[#dc2626]'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : action === 'approve' ? (
              'Approve Email'
            ) : action === 'deny' ? (
              'Deny Email'
            ) : (
              'Select Action'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
