'use client'

import { useState, useMemo } from 'react'
import { EmailRecord } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

// ─── FINRA / SEC COMPLIANCE RULES ────────────────────────────────────────────
// Based on: FINRA Rule 2210, Regulation Best Interest, SEC Advertising Rule 206(4)-1

type Severity = 'MUST_FIX' | 'SHOULD_FIX' | 'ADVISORY'

interface ComplianceRule {
  id: string
  severity: Severity
  label: string
  rule: string
  patterns: string[]
  explanation: string
  suggestedFix: string
}

const COMPLIANCE_RULES: ComplianceRule[] = [
  // ── MUST FIX ────────────────────────────────────────────────────────────────
  {
    id: 'perf_guarantee',
    severity: 'MUST_FIX',
    label: 'Performance Guarantee',
    rule: 'FINRA Rule 2210(d)(1)',
    patterns: [
      'guaranteed', 'guarantee', 'risk-free', 'risk free', 'no risk',
      '100% safe', 'certain return', 'will earn', 'will make you',
      'will grow your', 'definite return', 'assured return', 'cannot lose',
      "can't lose", 'zero risk',
    ],
    explanation:
      "Promising specific returns or safety violates FINRA's prohibition on unwarranted claims. Even indirect guarantees create regulatory exposure.",
    suggestedFix:
      'Replace with qualified language: "may offer", "has historically", "seeks to", "designed to", or "potential for".',
  },
  {
    id: 'tax_guarantee',
    severity: 'MUST_FIX',
    label: 'Tax Outcome Guarantee',
    rule: 'FINRA Rule 2210(d)(1) / SEC Rule 206(4)-1',
    patterns: [
      'pay no taxes', 'pay zero taxes', 'owe no taxes', 'no taxes',
      'zero taxes', 'eliminate your taxes', 'avoid all taxes',
      'help you pay no', 'help pay no taxes', 'never pay taxes',
      'tax-free income', 'tax free income', 'legally avoid taxes',
      'save you taxes', 'eliminate taxes', 'zero tax liability',
      'no tax bill', 'wipe out your taxes',
    ],
    explanation:
      "Promising a specific tax outcome ('pay no taxes', 'zero taxes') is an unwarranted guarantee under FINRA 2210. Tax strategies reduce exposure — they cannot eliminate all taxes, and claiming otherwise is misleading and potentially fraudulent.",
    suggestedFix:
      'Replace with: "may help reduce your tax liability", "designed to optimize tax efficiency", or "strategies that may lower your effective tax rate — results vary by situation."',
  },
  {
    id: 'directive_language',
    severity: 'MUST_FIX',
    label: 'High-Pressure Directive Language',
    rule: 'FINRA Rule 2210(d)(2) / Reg BI Rule 15l-1',
    patterns: [
      'you must sell', 'must sell your', 'you have to sell',
      'you need to sell', 'you must act', 'you must decide',
      'you need to act now', 'sell your company', 'sell now',
      'sell immediately', 'you should sell', 'have to act',
    ],
    explanation:
      "Telling a prospect they 'must sell' or directing a specific major financial decision violates both FINRA's prohibition on coercive language and Reg BI's requirement that any recommendation be in the client's best interest with documented suitability basis.",
    suggestedFix:
      'Replace with an invitation: "If a liquidity event is on your horizon, it may be worth exploring..." or "Some professionals in your position have found it valuable to think through..."',
  },
  {
    id: 'time_pressure',
    severity: 'MUST_FIX',
    label: 'Time-Pressure Language',
    rule: 'FINRA Rule 2210(d)(2)',
    patterns: [
      'act now', 'limited time', "don't miss", 'do not miss',
      "before it's too late", 'before its too late', 'expires soon',
      'last chance', 'act immediately', 'exclusive offer',
      'only available until', 'time-sensitive opportunity', 'urgent opportunity',
    ],
    explanation:
      "Creating artificial urgency pressures investors into hasty decisions. FINRA 2210 prohibits language that implies a communication is more time-critical than warranted.",
    suggestedFix:
      'Remove entirely or rephrase: "When you have a moment..." or "I\'d welcome a conversation at your convenience."',
  },
  {
    id: 'unsub_claims',
    severity: 'MUST_FIX',
    label: 'Unsubstantiated Performance Claim',
    rule: 'FINRA Rule 2210(d)(1)(A)',
    patterns: [
      'best performing', 'top performing', 'beat the market',
      'outperform the market', '#1 advisor', 'number one advisor',
      'highest returns', 'market-beating', 'unbeatable performance',
      'best in class', 'top-ranked',
    ],
    explanation:
      'Comparative superlatives require documented, current, third-party substantiation. Without it, they constitute misleading statements under FINRA standards.',
    suggestedFix:
      'Remove or add specific documented basis with full context, benchmark comparison, and defined time period.',
  },
  // ── SHOULD FIX ──────────────────────────────────────────────────────────────
  {
    id: 'past_perf',
    severity: 'SHOULD_FIX',
    label: 'Past Performance — Missing Disclaimer',
    rule: 'FINRA Rule 2210(d)(1)(F)',
    patterns: [
      'past performance', 'historical returns', 'historical performance',
      'track record', 'historically returned', 'has returned',
      'previously earned', 'prior returns', 'prior performance',
    ],
    explanation:
      "Any reference to past performance must include the required disclaimer. Without it, investors may assume historical results predict future ones — a common exam finding.",
    suggestedFix:
      'Add: "Past performance is not indicative of future results." as a footnote or inline immediately after the reference.',
  },
  {
    id: 'exaggerated',
    severity: 'SHOULD_FIX',
    label: 'Exaggerated / Absolute Language',
    rule: 'FINRA Rule 2210(d)(1)(B)',
    patterns: [
      'always outperform', 'never loses', 'perfect strategy',
      'unprecedented returns', 'proven strategy', 'foolproof',
      'fail-safe', 'never failed', 'always wins', 'always delivers',
      'consistently beats', 'revolutionary approach',
    ],
    explanation:
      'Absolute language creates unrealistic expectations. FINRA considers this exaggerated and potentially misleading even when the advisor believes it to be true.',
    suggestedFix:
      'Replace with qualified language: "typically", "designed to", "seeks to", "has historically", "may".',
  },
  {
    id: 'reg_bi',
    severity: 'SHOULD_FIX',
    label: 'Direct Investment Instruction (Reg BI)',
    rule: 'FINRA Reg BI — Rule 15l-1',
    patterns: [
      'you should invest', 'you must invest', 'you need to invest',
      'you should buy', 'you should move', 'you should transfer',
      'put all your', 'move everything to', 'you need to act',
      'you ought to invest', 'you need to move', 'you have to invest',
      'you must move', 'you must buy', 'you must transfer',
    ],
    explanation:
      "Directing a client toward a specific action without documented suitability basis may violate Regulation Best Interest, which requires recommendations to be in the client's best interest.",
    suggestedFix:
      'Rephrase as an invitation: "This may be worth exploring together..." or "I\'d like to walk you through an option that might fit your situation."',
  },
  {
    id: 'testimonial',
    severity: 'SHOULD_FIX',
    label: 'Testimonial-Style Language',
    rule: 'SEC Advertising Rule 206(4)-1',
    patterns: [
      'clients love', 'clients say', 'investors love', 'everyone agrees',
      'clients tell me', 'other clients have', 'my clients all',
      'clients have told me', 'clients rave',
    ],
    explanation:
      'References to client satisfaction or endorsements require proper SEC disclosure under the updated Advertising Rule. Undisclosed testimonials are a clear violation.',
    suggestedFix:
      'Remove or add: "This is not representative of all client experiences. Clients were not compensated for this statement."',
  },
  // ── ADVISORY ────────────────────────────────────────────────────────────────
  {
    id: 'specific_returns',
    severity: 'ADVISORY',
    label: 'Specific Return Figures',
    rule: 'FINRA Rule 2210 / SEC Rule 206(4)-1',
    patterns: [
      '% annual return', '% return', '% gain', '% growth', '% yield',
      'returned 8%', 'returned 10%', 'returned 12%', 'returned 15%',
      'returned 20%', 'earned 8%', 'earned 10%', 'earned 12%',
    ],
    explanation:
      'Specific return figures require full context: the time period, gross vs. net of fees, and benchmark comparison if one is implied. Missing context can make this misleading.',
    suggestedFix:
      'Specify: time period, gross or net of fees, and append the past performance disclaimer.',
  },
  {
    id: 'replace_advisor',
    severity: 'ADVISORY',
    label: 'Advisor Replacement Suggestion',
    rule: 'FINRA Rule 2210 / Reg BI',
    patterns: [
      'replace your advisor', 'leave your current advisor',
      'switch advisors', 'better than your current',
      'better than what you have', 'your current advisor is',
      'ditch your advisor',
    ],
    explanation:
      "Suggesting a prospect leave their current advisor without documented basis creates Reg BI exposure. The switch must demonstrably benefit the client.",
    suggestedFix:
      'Position as complementary: "I\'d welcome the chance to offer a second perspective" rather than a direct replacement pitch.',
  },
  {
    id: 'prediction_language',
    severity: 'ADVISORY',
    label: 'Forward-Looking Prediction',
    rule: 'FINRA Rule 2210(d)(1)',
    patterns: [
      'the market will', 'stocks will rise', 'rates will fall',
      'the economy will', 'prices will go', 'we expect the market',
      'the market is going to', 'interest rates will',
    ],
    explanation:
      'Forward-looking market predictions presented as fact rather than opinion can mislead investors. They must be clearly labeled as opinions with no assurance of outcome.',
    suggestedFix:
      'Frame as opinion: "In our view...", "We believe...", "Some analysts expect..." with appropriate hedging.',
  },
]

// ─── COMPLIANCE CHECKLIST (Manual verification items) ─────────────────────────
const COMPLIANCE_CHECKLIST = [
  {
    id: 'no_guarantees',
    label: 'No performance guarantees',
    description: 'No language promising specific returns, safety, or guaranteed outcomes',
    rule: 'FINRA 2210(d)(1)',
    autoPassIf: 'perf_guarantee', // auto-unchecked if this rule has matches
  },
  {
    id: 'no_time_pressure',
    label: 'No artificial urgency',
    description: 'No deadline language or time-pressure that could pressure investor decisions',
    rule: 'FINRA 2210(d)(2)',
    autoPassIf: 'time_pressure',
  },
  {
    id: 'substantiated_claims',
    label: 'All performance claims substantiated',
    description: 'Any comparative or superlative claims have documented, current basis',
    rule: 'FINRA 2210(d)(1)(A)',
    autoPassIf: 'unsub_claims',
  },
  {
    id: 'past_perf_disclaimer',
    label: 'Past performance disclaimer included (if applicable)',
    description: 'If historical returns are referenced, the required disclaimer is present',
    rule: 'FINRA 2210(d)(1)(F)',
    autoPassIf: 'past_perf',
  },
  {
    id: 'reg_bi_compliant',
    label: 'Recommendation framing is Reg BI compliant',
    description: 'Any recommendation is framed around client benefit, not product promotion',
    rule: 'Reg BI / Rule 15l-1',
    autoPassIf: 'reg_bi',
  },
  {
    id: 'cta_appropriate',
    label: 'CTA is appropriate for contact type',
    description: 'Cold prospect emails invite a conversation only — not account decisions',
    rule: 'FINRA 2210 / Reg BI',
  },
  {
    id: 'balanced_presentation',
    label: 'Fair and balanced overall presentation',
    description: 'No cherry-picked data or one-sided framing that creates false impressions',
    rule: 'FINRA 2210 / SEC 206(4)-1',
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
interface PhraseMatch { phrase: string; index: number }
interface DetectedIssue {
  ruleId: string; severity: Severity; label: string; rule: string
  explanation: string; suggestedFix: string; matches: PhraseMatch[]
}
interface TextSegment {
  text: string; type: 'normal' | Severity; label?: string; ruleId?: string
}

function scanText(text: string): DetectedIssue[] {
  const lowered = text.toLowerCase()
  return COMPLIANCE_RULES.flatMap(rule => {
    const matches: PhraseMatch[] = []
    for (const pattern of rule.patterns) {
      const pat = pattern.toLowerCase()
      let idx = 0
      while (true) {
        const found = lowered.indexOf(pat, idx)
        if (found === -1) break
        matches.push({ phrase: text.slice(found, found + pattern.length), index: found })
        idx = found + 1
      }
    }
    return matches.length > 0
      ? [{ ruleId: rule.id, severity: rule.severity, label: rule.label, rule: rule.rule, explanation: rule.explanation, suggestedFix: rule.suggestedFix, matches }]
      : []
  })
}

function buildSegments(text: string, issues: DetectedIssue[], activeRuleId: string | null): TextSegment[] {
  const ranges: Array<{ start: number; end: number; severity: Severity; label: string; ruleId: string }> = []
  for (const issue of issues) {
    for (const match of issue.matches) {
      ranges.push({ start: match.index, end: match.index + match.phrase.length, severity: issue.severity, label: issue.label, ruleId: issue.ruleId })
    }
  }
  ranges.sort((a, b) => a.start - b.start)
  // Remove overlaps
  const merged: typeof ranges = []
  for (const r of ranges) {
    if (!merged.length || r.start >= merged[merged.length - 1].end) merged.push(r)
  }
  const segments: TextSegment[] = []
  let cursor = 0
  for (const r of merged) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start), type: 'normal' })
    segments.push({ text: text.slice(r.start, r.end), type: r.severity, label: r.label, ruleId: r.ruleId })
    cursor = r.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), type: 'normal' })
  return segments
}

const SEV = {
  MUST_FIX: {
    bg: 'bg-red-500/30', border: 'border-b border-red-400', text: 'text-red-200',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/40',
    dot: 'bg-red-500', label: 'MUST FIX', activeBg: 'bg-red-500/50',
    headerBg: 'bg-red-500/10 border-red-500/30', icon: '🚫',
  },
  SHOULD_FIX: {
    bg: 'bg-amber-500/25', border: 'border-b border-amber-400', text: 'text-amber-200',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    dot: 'bg-amber-400', label: 'SHOULD FIX', activeBg: 'bg-amber-500/45',
    headerBg: 'bg-amber-500/10 border-amber-500/30', icon: '⚠️',
  },
  ADVISORY: {
    bg: 'bg-blue-500/20', border: 'border-b border-blue-400', text: 'text-blue-200',
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    dot: 'bg-blue-400', label: 'ADVISORY', activeBg: 'bg-blue-500/35',
    headerBg: 'bg-blue-500/10 border-blue-500/30', icon: 'ℹ️',
  },
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
interface ComplianceReviewModalProps {
  email: EmailRecord | null
  isOpen: boolean
  onClose: () => void
}

export function ComplianceReviewModal({ email, isOpen, onClose }: ComplianceReviewModalProps) {
  const { user, updateEmailStatus } = useAuth()
  const [action, setAction] = useState<'approve' | 'deny' | null>(null)
  const [denialReason, setDenialReason] = useState('')
  const [complianceNotes, setComplianceNotes] = useState('')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [showCleanPreview, setShowCleanPreview] = useState(false)

  // ── Scan email body for compliance issues ──────────────────────────────────
  const detectedIssues = useMemo(() => {
    if (!email?.body) return []
    return scanText(email.body)
  }, [email?.body])

  const mustFixCount   = detectedIssues.filter(i => i.severity === 'MUST_FIX').length
  const shouldFixCount = detectedIssues.filter(i => i.severity === 'SHOULD_FIX').length
  const advisoryCount  = detectedIssues.filter(i => i.severity === 'ADVISORY').length
  const hasMustFix     = mustFixCount > 0

  // ── Build highlighted segments ─────────────────────────────────────────────
  const segments = useMemo(() => {
    if (!email?.body) return []
    return buildSegments(email.body, detectedIssues, activeRuleId)
  }, [email?.body, detectedIssues, activeRuleId])

  // ── Build clean preview (replaces flagged phrases with [FLAGGED]) ──────────
  const cleanPreviewText = useMemo(() => {
    if (!email?.body) return ''
    let text = email.body
    // Process in reverse order of index to preserve positions
    const allMatches: Array<{ start: number; end: number; ruleId: string }> = []
    for (const issue of detectedIssues) {
      for (const match of issue.matches) {
        allMatches.push({ start: match.index, end: match.index + match.phrase.length, ruleId: issue.ruleId })
      }
    }
    allMatches.sort((a, b) => b.start - a.start) // reverse order
    for (const m of allMatches) {
      text = text.slice(0, m.start) + `[⚠ FLAGGED — see compliance review]` + text.slice(m.end)
    }
    return text
  }, [email?.body, detectedIssues])

  // ── Auto-initialize checklist based on scan results ─────────────────────────
  const effectiveChecked = useMemo(() => {
    const base = { ...checkedItems }
    for (const item of COMPLIANCE_CHECKLIST) {
      if (item.autoPassIf) {
        const hasIssue = detectedIssues.some(i => i.ruleId === item.autoPassIf)
        if (hasIssue) base[item.id] = false // force unchecked if flagged
      }
    }
    return base
  }, [checkedItems, detectedIssues])

  const allChecked = COMPLIANCE_CHECKLIST.every(c => effectiveChecked[c.id])

  const handleCheckItem = (id: string) => {
    const item = COMPLIANCE_CHECKLIST.find(c => c.id === id)
    if (item?.autoPassIf && detectedIssues.some(i => i.ruleId === item.autoPassIf)) return
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = async () => {
    if (!email || !user || !action) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    if (action === 'approve') {
      updateEmailStatus(email.id, 'approved', user.name, undefined,
        complianceNotes || `Reviewed and approved. ${detectedIssues.length === 0 ? 'No compliance issues detected.' : `${detectedIssues.length} advisory item(s) noted and accepted.`}`)
    } else {
      const autoReason = hasMustFix
        ? `${mustFixCount} MUST FIX violation(s): ${detectedIssues.filter(i => i.severity === 'MUST_FIX').map(i => i.label).join(', ')}.`
        : ''
      updateEmailStatus(email.id, 'denied', user.name,
        denialReason || autoReason || 'Does not meet compliance requirements.', undefined)
    }
    setIsSubmitting(false)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setAction(null); setDenialReason(''); setComplianceNotes('')
    setCheckedItems({}); setActiveRuleId(null); setExpandedIssue(null)
    setShowCleanPreview(false)
  }

  if (!isOpen || !email) return null

  const scanStatus = detectedIssues.length === 0
    ? { label: 'Clean', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '✓' }
    : hasMustFix
    ? { label: `${detectedIssues.length} issue${detectedIssues.length > 1 ? 's' : ''} found`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: '✗' }
    : { label: `${detectedIssues.length} item${detectedIssues.length > 1 ? 's' : ''} to review`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '!' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto mx-4 bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[#1e293b] bg-[#111827]">
          <div>
            <h2 className="text-xl font-semibold text-white">Compliance Review</h2>
            <p className="text-sm text-[#64748b] mt-0.5">
              Email to <span className="text-[#94a3b8]">{email.prospectName}</span> from <span className="text-[#94a3b8]">{email.advisorName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Scan summary badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${scanStatus.bg} ${scanStatus.color}`}>
              <span>{scanStatus.icon}</span>
              <span>AI Scan: {scanStatus.label}</span>
              {detectedIssues.length > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  {mustFixCount > 0 && <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-red-300">{mustFixCount} MUST FIX</span>}
                  {shouldFixCount > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300">{shouldFixCount} SHOULD FIX</span>}
                  {advisoryCount > 0 && <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300">{advisoryCount} ADVISORY</span>}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-[#64748b] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* ── Email Preview ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Subject</label>
              <p className="text-white bg-[#0a0f1c] px-4 py-3 rounded-lg border border-[#1e293b] text-sm">{email.subject}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Message Body
                  {detectedIssues.length > 0 && (
                    <span className="ml-2 normal-case font-normal text-[#475569]">
                      — hover highlighted phrases to see issues
                    </span>
                  )}
                </label>
                {detectedIssues.length > 0 && (
                  <button
                    onClick={() => setShowCleanPreview(p => !p)}
                    className={`text-xs px-3 py-1 rounded-md border transition-colors ${
                      showCleanPreview
                        ? 'bg-[#1e293b] border-[#3b82f6] text-[#3b82f6]'
                        : 'border-[#1e293b] text-[#64748b] hover:text-white hover:border-[#475569]'
                    }`}
                  >
                    {showCleanPreview ? 'Show Original' : 'Show Clean Preview'}
                  </button>
                )}
              </div>

              <div className="bg-[#0a0f1c] px-4 py-3 rounded-lg border border-[#1e293b] max-h-56 overflow-y-auto">
                {showCleanPreview ? (
                  <div className="text-sm text-[#94a3b8] whitespace-pre-wrap font-mono leading-relaxed">{cleanPreviewText}</div>
                ) : (
                  <div className="text-sm text-[#94a3b8] whitespace-pre-wrap font-mono leading-relaxed">
                    {segments.map((seg, i) => {
                      if (seg.type === 'normal') return <span key={i}>{seg.text}</span>
                      const cfg = SEV[seg.type]
                      const isActive = activeRuleId === seg.ruleId
                      return (
                        <span
                          key={i}
                          style={{
                            backgroundColor: seg.type === 'MUST_FIX'
                              ? 'rgba(239,68,68,0.30)'
                              : seg.type === 'SHOULD_FIX'
                              ? 'rgba(245,158,11,0.28)'
                              : 'rgba(59,130,246,0.22)',
                            borderBottom: `2px solid ${seg.type === 'MUST_FIX' ? '#f87171' : seg.type === 'SHOULD_FIX' ? '#fbbf24' : '#60a5fa'}`,
                            color: seg.type === 'MUST_FIX' ? '#fca5a5' : seg.type === 'SHOULD_FIX' ? '#fcd34d' : '#93c5fd',
                            borderRadius: '3px',
                            padding: '0 2px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setActiveRuleId(prev => prev === seg.ruleId ? null : seg.ruleId ?? null)
                            setExpandedIssue(seg.ruleId ?? null)
                          }}
                          title={`${cfg.label}: ${seg.label} — click to expand`}
                        >
                          {seg.text}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Highlighting legend */}
              {detectedIssues.length > 0 && !showCleanPreview && (
                <div className="flex items-center gap-4 mt-2 text-xs text-[#64748b]">
                  <span className="font-medium">Highlight key:</span>
                  {mustFixCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/30 border-b border-red-400 inline-block" /> MUST FIX</span>}
                  {shouldFixCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/25 border-b border-amber-400 inline-block" /> SHOULD FIX</span>}
                  {advisoryCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500/20 border-b border-blue-400 inline-block" /> ADVISORY</span>}
                </div>
              )}
            </div>
          </div>

          {/* ── Detected Issues Panel ──────────────────────────────────────────── */}
          {detectedIssues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>AI-Detected Compliance Issues</span>
                <span className="text-xs font-normal text-[#64748b]">Click an issue to highlight it in the email</span>
              </h3>
              <div className="space-y-2">
                {(['MUST_FIX', 'SHOULD_FIX', 'ADVISORY'] as Severity[]).map(sev =>
                  detectedIssues
                    .filter(i => i.severity === sev)
                    .map(issue => {
                      const cfg = SEV[issue.severity]
                      const isExpanded = expandedIssue === issue.ruleId
                      const isActive = activeRuleId === issue.ruleId
                      return (
                        <div
                          key={issue.ruleId}
                          className={`rounded-xl border overflow-hidden transition-all ${
                            isActive ? cfg.headerBg : 'border-[#1e293b]'
                          }`}
                        >
                          {/* Issue header */}
                          <button
                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                              isActive ? cfg.headerBg : 'bg-[#0a0f1c] hover:bg-[#131f35]'
                            }`}
                            onClick={() => {
                              setExpandedIssue(prev => prev === issue.ruleId ? null : issue.ruleId)
                              setActiveRuleId(prev => prev === issue.ruleId ? null : issue.ruleId)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base">{cfg.icon}</span>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white">{issue.label}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                                    {cfg.label}
                                  </span>
                                </div>
                                <p className="text-xs text-[#64748b] mt-0.5">{issue.rule}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#64748b]">
                              <span className="bg-[#1e293b] px-2 py-0.5 rounded-full">
                                {issue.matches.length} match{issue.matches.length > 1 ? 'es' : ''}
                              </span>
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Issue detail */}
                          {isExpanded && (
                            <div className={`px-4 pb-4 pt-3 border-t border-[#1e293b] space-y-3 ${isActive ? cfg.headerBg : 'bg-[#0a0f1c]'}`}>
                              {/* Matched phrases */}
                              <div>
                                <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1.5">Flagged phrases</p>
                                <div className="flex flex-wrap gap-2">
                                  {issue.matches.map((m, i) => (
                                    <span key={i} className={`text-xs px-2 py-1 rounded-lg font-mono ${cfg.bg} ${cfg.text}`}>
                                      "{m.phrase}"
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* Explanation */}
                              <div>
                                <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1.5">Why this is a problem</p>
                                <p className="text-sm text-[#94a3b8] leading-relaxed">{issue.explanation}</p>
                              </div>
                              {/* Suggested fix */}
                              <div className="bg-[#052e16]/40 border border-[#22c55e]/20 rounded-lg px-3 py-2.5">
                                <p className="text-xs text-[#22c55e] font-semibold uppercase tracking-wider mb-1">Suggested Fix</p>
                                <p className="text-sm text-[#86efac] leading-relaxed">{issue.suggestedFix}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          )}

          {/* ── Compliance Checklist ────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span>SEC/FINRA Compliance Checklist</span>
              <span className="text-xs font-normal text-[#64748b]">Items linked to AI scan are auto-updated</span>
            </h3>
            <div className="space-y-2">
              {COMPLIANCE_CHECKLIST.map(check => {
                const blockedByAI = !!check.autoPassIf && detectedIssues.some(i => i.ruleId === check.autoPassIf)
                const isChecked = effectiveChecked[check.id] && !blockedByAI
                return (
                  <label
                    key={check.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      blockedByAI
                        ? 'bg-red-500/5 border-red-500/20 opacity-70 cursor-not-allowed'
                        : isChecked
                        ? 'bg-[#052e16]/30 border-[#22c55e]/40'
                        : 'bg-[#0a0f1c] border-[#1e293b] hover:border-[#3b82f6]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckItem(check.id)}
                      disabled={blockedByAI}
                      className="mt-0.5 w-4 h-4 rounded border-[#475569] bg-[#1e293b] text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-0 disabled:opacity-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${blockedByAI ? 'text-red-400' : isChecked ? 'text-[#22c55e]' : 'text-white'}`}>
                          {check.label}
                        </p>
                        <span className="text-xs text-[#475569] font-mono">{check.rule}</span>
                        {blockedByAI && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            AI flagged — requires fix
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">{check.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ── Review Decision ─────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Review Decision</h3>

            {hasMustFix && (
              <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                <span className="mt-0.5">🚫</span>
                <span><strong>Approval blocked:</strong> {mustFixCount} MUST FIX violation{mustFixCount > 1 ? 's' : ''} must be resolved before this email can be approved.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {/* Approve */}
              <button
                onClick={() => !hasMustFix && allChecked && setAction('approve')}
                disabled={hasMustFix || !allChecked}
                className={`p-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  action === 'approve'
                    ? 'border-[#22c55e] bg-[#22c55e]/10'
                    : 'border-[#1e293b] hover:border-[#22c55e]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${action === 'approve' ? 'text-[#22c55e]' : 'text-[#64748b]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm font-semibold ${action === 'approve' ? 'text-[#22c55e]' : 'text-white'}`}>Approve</span>
                </div>
                <p className="text-xs text-[#64748b]">Compliant — clear to send</p>
              </button>

              {/* Approve With Edits */}
              <button
                onClick={() => !hasMustFix && setAction('approve')}
                disabled={hasMustFix}
                className={`p-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  action === 'approve' && !allChecked
                    ? 'border-[#f59e0b] bg-[#f59e0b]/10'
                    : 'border-[#1e293b] hover:border-[#f59e0b]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className={`w-5 h-5 text-[#64748b]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Approve w/ Edits</span>
                </div>
                <p className="text-xs text-[#64748b]">Minor issues noted</p>
              </button>

              {/* Deny */}
              <button
                onClick={() => setAction('deny')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === 'deny'
                    ? 'border-[#ef4444] bg-[#ef4444]/10'
                    : 'border-[#1e293b] hover:border-[#ef4444]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className={`w-5 h-5 ${action === 'deny' ? 'text-[#ef4444]' : 'text-[#64748b]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className={`text-sm font-semibold ${action === 'deny' ? 'text-[#ef4444]' : 'text-white'}`}>Deny</span>
                </div>
                <p className="text-xs text-[#64748b]">Requires revision</p>
              </button>
            </div>
          </div>

          {/* ── Notes / Denial Reason ────────────────────────────────────────────── */}
          {action === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Compliance Notes <span className="text-[#64748b] font-normal">(optional)</span></label>
              <textarea
                value={complianceNotes}
                onChange={e => setComplianceNotes(e.target.value)}
                rows={3}
                placeholder="Document any advisory items you reviewed and accepted..."
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none text-sm"
              />
            </div>
          )}

          {action === 'deny' && (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Reason for Denial <span className="text-[#ef4444]">*</span>
              </label>
              {hasMustFix && (
                <div className="mb-2 text-xs text-[#64748b] bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-3 py-2">
                  Auto-populated from AI scan — edit as needed:
                </div>
              )}
              <textarea
                value={denialReason || (hasMustFix
                  ? `${mustFixCount} MUST FIX violation(s) identified:\n${detectedIssues.filter(i => i.severity === 'MUST_FIX').map(i => `• ${i.label} (${i.rule}): ${i.matches.map(m => `"${m.phrase}"`).join(', ')}`).join('\n')}\n\nSuggested fixes provided in review. Please revise and resubmit.`
                  : '')}
                onChange={e => setDenialReason(e.target.value)}
                rows={5}
                placeholder="Explain why this email does not meet compliance requirements..."
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent resize-none text-sm font-mono"
              />
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-[#1e293b] bg-[#111827]">
          <div className="text-xs text-[#475569]">
            Reviewed against FINRA Rule 2210 · Reg BI · SEC Advertising Rule 206(4)-1
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { resetForm(); onClose() }}
              className="px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!action || (action === 'deny' && !denialReason && !hasMustFix) || isSubmitting}
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
              ) : action === 'approve' ? 'Approve Email'
                : action === 'deny' ? 'Deny Email'
                : 'Select Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
