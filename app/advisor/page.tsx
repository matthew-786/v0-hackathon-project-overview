'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { prospects } from '@/lib/data'
import { Prospect } from '@/lib/types'
import { ProspectCard } from '@/components/prospect-card'
import { EmailDraftModal } from '@/components/email-draft-modal'
import { EmailStatusList } from '@/components/email-status-list'

type SortOption = 'urgency' | 'icp' | 'name'
type ViewTab = 'prospects' | 'emails'

export default function AdvisorDashboard() {
  const { user, getEmailsByAdvisor } = useAuth()
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('urgency')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ViewTab>('prospects')

  const myEmails = user ? getEmailsByAdvisor(user.id) : []

  const sortedProspects = useMemo(() => {
    let filtered = prospects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.current_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.matched_icp.toLowerCase().includes(searchQuery.toLowerCase())
    )

    switch (sortBy) {
      case 'urgency':
        return [...filtered].sort((a, b) => b.urgency_score - a.urgency_score)
      case 'icp':
        return [...filtered].sort((a, b) => b.icp_match_score - a.icp_match_score)
      case 'name':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return filtered
    }
  }, [sortBy, searchQuery])

  const handleDraftEmail = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setIsModalOpen(true)
  }

  const pendingCount = myEmails.filter(e => e.status === 'pending').length
  const approvedCount = myEmails.filter(e => e.status === 'approved').length

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Total Prospects</p>
          <p className="text-2xl font-semibold text-white mt-1">{prospects.length}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">High Priority</p>
          <p className="text-2xl font-semibold text-[#22c55e] mt-1">
            {prospects.filter(p => p.urgency_score >= 85).length}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Pending Review</p>
          <p className="text-2xl font-semibold text-[#f59e0b] mt-1">{pendingCount}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <p className="text-sm text-[#64748b]">Ready to Send</p>
          <p className="text-2xl font-semibold text-[#3b82f6] mt-1">{approvedCount}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-[#111827] rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('prospects')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'prospects'
              ? 'bg-[#3b82f6] text-white'
              : 'text-[#64748b] hover:text-white'
          }`}
        >
          Prospects
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'bg-[#3b82f6] text-white'
              : 'text-[#64748b] hover:text-white'
          }`}
        >
          My Emails
          {myEmails.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'emails' ? 'bg-white/20' : 'bg-[#1e293b]'
            }`}>
              {myEmails.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'prospects' ? (
        <>
          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#64748b]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 bg-[#111827] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              >
                <option value="urgency">Urgency Score</option>
                <option value="icp">ICP Match Score</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Prospect Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedProspects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onDraftEmail={handleDraftEmail}
              />
            ))}
          </div>

          {sortedProspects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#64748b]">No prospects match your search</p>
            </div>
          )}
        </>
      ) : (
        <EmailStatusList emails={myEmails} />
      )}

      {/* Email Draft Modal */}
      <EmailDraftModal
        prospect={selectedProspect}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProspect(null)
        }}
      />
    </div>
  )
}
