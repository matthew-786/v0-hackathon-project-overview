'use client'

import { useState, useEffect } from 'react'
import { Prospect } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

interface EmailDraftModalProps {
  prospect: Prospect | null
  isOpen: boolean
  onClose: () => void
}

export function EmailDraftModal({ prospect, isOpen, onClose }: EmailDraftModalProps) {
  const { user, addEmail } = useAuth()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Generate email template when prospect changes
  useEffect(() => {
    if (prospect && isOpen) {
      generateEmailDraft()
    }
  }, [prospect, isOpen])

  const generateEmailDraft = () => {
    if (!prospect) return
    
    setIsGenerating(true)
    
    // Simulate AI generation delay
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

  const handleSendForReview = async () => {
    if (!prospect || !user) return
    
    setIsSending(true)
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addEmail({
      prospectId: prospect.id,
      prospectName: prospect.name,
      subject,
      body,
      status: 'pending',
      advisorId: user.id,
      advisorName: user.name
    })
    
    setIsSending(false)
    onClose()
    
    // Reset form
    setSubject('')
    setBody('')
  }

  if (!isOpen || !prospect) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
          <div>
            <h2 className="text-xl font-semibold text-white">Draft Email</h2>
            <p className="text-sm text-[#64748b] mt-1">To: {prospect.name}</p>
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
        <div className="p-6 space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#94a3b8]">Generating personalized email...</p>
            </div>
          ) : (
            <>
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
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none font-mono text-sm"
                />
              </div>
              
              {/* Compliance Note */}
              <div className="p-4 bg-[#422006]/30 border border-[#f59e0b]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#f59e0b]">Compliance Review Required</p>
                    <p className="text-xs text-[#fbbf24]/80 mt-1">This email will be reviewed by the compliance team before it can be sent to ensure SEC/FINRA guideline adherence.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b]">
          <button
            onClick={generateEmailDraft}
            disabled={isGenerating}
            className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-50"
          >
            Regenerate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendForReview}
            disabled={isGenerating || isSending || !subject || !body}
            className="px-6 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:from-[#2563eb] hover:to-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              'Send for Review'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
