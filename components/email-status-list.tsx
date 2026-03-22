'use client'

import { useState } from 'react'
import { EmailRecord } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

interface EmailStatusListProps {
  emails: EmailRecord[]
}

export function EmailStatusList({ emails }: EmailStatusListProps) {
  const { updateEmailStatus } = useAuth()
  const [syncingEmail, setSyncingEmail] = useState<string | null>(null)
  const [syncedEmails, setSyncedEmails] = useState<Set<string>>(new Set())

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

  const handleSyncCRM = async (email: EmailRecord) => {
    setSyncingEmail(email.id)
    try {
      const res = await fetch('/api/webhooks/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          status: 'sent',
          prospectName: email.prospectName,
          subject: email.subject
        })
      });

      if (res.ok) {
        updateEmailStatus(email.id, 'sent')
        setSyncedEmails(prev => new Set(prev).add(email.id))
      }
    } catch (err) {
      console.error('Failed CRM webhook', err);
    } finally {
      setSyncingEmail(null)
    }
  }

  const handleSendEmail = (emailId: string) => {
    updateEmailStatus(emailId, 'sent')
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
      <div className="text-center py-12 bg-[#111827] border border-[#1e293b] rounded-xl">
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
              <p className="text-sm text-[#64748b] mt-0.5">{email.subject}</p>
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
                onClick={() => handleSendEmail(email.id)}
                className="px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Send Now
              </button>
            )}

            {email.status === 'sent' && (
              <button
                disabled={syncingEmail === email.id || syncedEmails.has(email.id)}
                onClick={() => handleSyncCRM(email)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm
                  ${(syncingEmail === email.id || syncedEmails.has(email.id))
                    ? 'bg-[#0f172a]/50 text-[#64748b] border-[#1e293b] cursor-not-allowed'
                    : 'bg-[#1e293b] text-white hover:bg-[#334155] border-[#334155]'}`}
              >
                {syncingEmail === email.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#cbd5e1]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Syncing...
                  </>
                ) : syncedEmails.has(email.id) ? (
                  <>
                    <svg className="w-4 h-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Synced to CRM
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync to Salesforce
                  </>
                )}
              </button>
            )}
          </div>

          {/* Denial Reason */}
          {email.status === 'denied' && email.denialReason && (
            <div className="mt-4 p-3 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-lg">
              <p className="text-xs font-medium text-[#ef4444] mb-1">Reason for Denial</p>
              <p className="text-sm text-[#fca5a5]">{email.denialReason}</p>
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
