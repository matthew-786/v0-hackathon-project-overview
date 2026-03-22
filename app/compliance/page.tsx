'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { EmailRecord } from '@/lib/types'
import { ComplianceReviewModal } from '@/components/compliance-review-modal'

type FilterOption = 'all' | 'pending' | 'approved' | 'denied'

export default function ComplianceDashboard() {
  const { emails } = useAuth()
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<FilterOption>('pending')

  const pendingEmails = emails.filter(e => e.status === 'pending')
  const approvedEmails = emails.filter(e => e.status === 'approved' || e.status === 'sent')
  const deniedEmails = emails.filter(e => e.status === 'denied')

  const filteredEmails = (() => {
    switch (filter) {
      case 'pending':
        return pendingEmails
      case 'approved':
        return approvedEmails
      case 'denied':
        return deniedEmails
      default:
        return emails
    }
  })()

  const handleReview = (email: EmailRecord) => {
    setSelectedEmail(email)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: EmailRecord['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-[#f59e0b]/10 text-[#f59e0b]',
      approved: 'bg-[#22c55e]/10 text-[#22c55e]',
      denied: 'bg-[#ef4444]/10 text-[#ef4444]',
      sent: 'bg-[#3b82f6]/10 text-[#3b82f6]'
    }
    
    const labels: Record<string, string> = {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Total Emails</p>
          <p className="text-2xl font-semibold text-white mt-1">{emails.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#f59e0b]/30 rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Pending Review</p>
          <p className="text-2xl font-semibold text-[#f59e0b] mt-1">{pendingEmails.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Approved</p>
          <p className="text-2xl font-semibold text-[#22c55e] mt-1">{approvedEmails.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Denied</p>
          <p className="text-2xl font-semibold text-[#ef4444] mt-1">{deniedEmails.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-[#111827] rounded-lg w-fit">
        {(['pending', 'approved', 'denied', 'all'] as FilterOption[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize flex items-center gap-2 ${
              filter === f
                ? 'bg-[#22c55e] text-white'
                : 'text-[#64748b] hover:text-white'
            }`}
          >
            {f}
            {f === 'pending' && pendingEmails.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === f ? 'bg-white/20' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}>
                {pendingEmails.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Email Queue */}
      {filteredEmails.length === 0 ? (
        <div className="text-center py-16 bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1e293b] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">
            {filter === 'pending' ? 'No pending reviews' : `No ${filter} emails`}
          </h3>
          <p className="text-sm text-[#64748b]">
            {filter === 'pending' 
              ? 'All caught up! Check back later for new submissions.' 
              : 'No emails match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmails.map((email) => (
            <div 
              key={email.id}
              className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 hover:border-[#22c55e]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{email.prospectName}</h4>
                    {getStatusBadge(email.status)}
                  </div>
                  <p className="text-sm text-[#94a3b8]">{email.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#64748b]">Submitted by</p>
                  <p className="text-sm font-medium text-white">{email.advisorName}</p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-[#0a0f1c] rounded-lg p-4 mb-4">
                <pre className="text-sm text-[#94a3b8] whitespace-pre-wrap font-mono line-clamp-4">{email.body}</pre>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569]">
                  Submitted {formatDate(email.createdAt)}
                  {email.reviewedAt && ` • Reviewed ${formatDate(email.reviewedAt)} by ${email.reviewedBy}`}
                </span>
                
                {email.status === 'pending' && (
                  <button
                    onClick={() => handleReview(email)}
                    className="px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
                  >
                    Review Email
                  </button>
                )}

                {email.status !== 'pending' && (
                  <button
                    onClick={() => handleReview(email)}
                    className="px-4 py-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] text-sm font-medium rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>

              {/* Show denial reason if denied */}
              {email.status === 'denied' && email.denialReason && (
                <div className="mt-4 p-3 bg-[#7f1d1d]/20 border border-[#ef4444]/30 rounded-lg">
                  <p className="text-xs font-medium text-[#ef4444] mb-1">Denial Reason</p>
                  <p className="text-sm text-[#fca5a5]">{email.denialReason}</p>
                </div>
              )}

              {/* Show compliance notes if approved */}
              {(email.status === 'approved' || email.status === 'sent') && email.complianceNotes && (
                <div className="mt-4 p-3 bg-[#052e16]/30 border border-[#22c55e]/30 rounded-lg">
                  <p className="text-xs font-medium text-[#22c55e] mb-1">Compliance Notes</p>
                  <p className="text-sm text-[#86efac]">{email.complianceNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ComplianceReviewModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEmail(null)
        }}
      />
    </div>
  )
}
