'use client'

import { Prospect } from '@/lib/types'

interface ProspectCardProps {
  prospect: Prospect
  onDraftEmail: (prospect: Prospect) => void
}

export function ProspectCard({ prospect, onDraftEmail }: ProspectCardProps) {
  const getIcpLabel = (icp: string) => {
    const labels: Record<string, string> = {
      'high_income_professional': 'High Income Professional',
      'business_owners_exits': 'Business Owner (Exit)',
      'business_owners_succession': 'Business Owner (Succession)',
      'pre_retiree': 'Pre-Retiree'
    }
    return labels[icp] || icp
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#22c55e] bg-[#22c55e]/10'
    if (score >= 75) return 'text-[#eab308] bg-[#eab308]/10'
    return 'text-[#f97316] bg-[#f97316]/10'
  }

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 hover:border-[#3b82f6]/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{prospect.name}</h3>
          <p className="text-sm text-[#64748b] mt-1">{prospect.current_role}</p>
          <p className="text-xs text-[#475569] mt-1">{prospect.location}</p>
        </div>
        <div className="flex gap-2">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getScoreColor(prospect.icp_match_score)}`}>
            ICP: {prospect.icp_match_score}
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getScoreColor(prospect.urgency_score)}`}>
            Urgency: {prospect.urgency_score}
          </div>
        </div>
      </div>

      {/* ICP Tag */}
      <div className="mb-4">
        <span className="inline-flex px-3 py-1 bg-[#3b82f6]/10 text-[#60a5fa] text-xs font-medium rounded-full">
          {getIcpLabel(prospect.matched_icp)}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-[#94a3b8] mb-4 line-clamp-2">{prospect.summary}</p>

      {/* Why Now Section */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Why Reach Out Now</h4>
        <ul className="space-y-1.5">
          {prospect.why_now_reasons.slice(0, 2).map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[#94a3b8]">
              <svg className="w-4 h-4 text-[#22c55e] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Angle */}
      <div className="mb-6 p-3 bg-[#0a0f1c] rounded-lg">
        <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">Recommended Approach</h4>
        <p className="text-sm text-[#94a3b8]">{prospect.recommended_outreach_angle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onDraftEmail(prospect)}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:from-[#2563eb] hover:to-[#1e40af] transition-all"
        >
          Draft Email
        </button>
        <a
          href={prospect.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b] rounded-lg transition-colors"
          title="View LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
