'use client'

import { EmailRecord } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { sendGmailEmail } from '@/lib/gmail-api'
import { toast } from 'sonner'
import { useState } from 'react'

interface EmailStatusListProps {
  emails: EmailRecord[]
  onRedraft?: (email: EmailRecord) => void
  onDelete?: (emailId: string) => void
}

export function EmailStatusList({ emails, onRedraft, onDelete }: EmailStatusListProps) {
  const { updateEmailStatus } = useAuth()
  const [sendingId, setSendingId] = useState<string | null>(null)

  const getStatusBadge = (status: EmailRecord['status']) => {
    const styles: Record<string, string> = {
      draft: 'bg-[#475569]/20 text-[#94a3b8]',
      pending: 'bg-[#f59e0b]/10 text-[#f59e0b]',
      approved: 'bg-[#22c55e]/10 text-[#22c55e]',
      denied: 'bg-[#ef4444]/10 text-[#ef4444]',
      sent: 'bg-[#3b82f6]/10 text-[#3b82f6]'
    }
    
    const labels: Record<string, string> = {
      draft: 'Draft',
      pending: 'Pending Review',
      approved: 'Approved',
      denied: 'Denied',
      sent: 'Sent'
    }
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const handleSendEmail = async (email: EmailRecord) => {
    setSendingId(email.id)
    try {
      const result = await sendGmailEmail({
        to: email.recipientEmail,
        subject: email.subject,
        body: email.body
      })

      if (result.success) {
        updateEmailStatus(email.id, 'sent')
        toast.success(`Email sent successfully to ${email.prospectName}`)
      } else {
        toast.error(`Failed to send email: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'An unexpected error occurred'}`)
    } finally {
      setSendingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1e293b] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No emails yet</h3>
        <p className="text-sm text-[#64748b]">Draft an email to a prospect to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div 
          key={email.id}
          className="bg-[#111827] border border-[#1e293b] rounded-xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-white font-medium">{email.prospectName}</h4>
              <p className="text-xs text-[#94a3b8] mt-0.5">{email.recipientEmail}</p>
              <p className="text-sm text-[#64748b] mt-1">{email.subject}</p>
            </div>
            {getStatusBadge(email.status)}
          </div>
          
          <p className="text-sm text-[#94a3b8] line-clamp-2 mb-3">{email.body}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#475569]">
              Created {formatDate(email.createdAt)}
              {email.reviewedAt && ` • Reviewed ${formatDate(email.reviewedAt)}`}
            </span>
            
            {email.status === 'approved' && (
              <button
                onClick={() => handleSendEmail(email)}
                disabled={sendingId === email.id}
                className="px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingId === email.id ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Now'
                )}
              </button>
            )}
          </div>
          
          {/* Denial Reason */}
          {email.status === 'denied' && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-lg">
                <p className="text-xs font-medium text-[#ef4444] mb-1">Reason for Denial</p>
                <p className="text-sm text-[#fca5a5]">{email.denialReason || 'No reason provided'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onRedraft?.(email)}
                  className="flex-1 px-4 py-2 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-[#334155] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Draft Again
                </button>
                <button
                  onClick={() => onDelete?.(email.id)}
                  className="px-4 py-2 bg-transparent text-[#ef4444] hover:bg-[#ef4444]/10 text-sm font-medium rounded-lg border border-[#ef4444]/30 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
          
          {/* Compliance Notes */}
          {email.complianceNotes && email.status === 'approved' && (
            <div className="mt-4 p-3 bg-[#052e16]/30 border border-[#22c55e]/30 rounded-lg">
              <p className="text-xs font-medium text-[#22c55e] mb-1">Compliance Notes</p>
              <p className="text-sm text-[#86efac]">{email.complianceNotes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
