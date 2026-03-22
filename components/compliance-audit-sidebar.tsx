'use client';

import { ComplianceAuditResult } from '@/lib/compliance-engine';

interface ComplianceAuditSidebarProps {
  auditResult: ComplianceAuditResult | null;
  onOverride?: () => void;
  isOverridden?: boolean;
  canOverride?: boolean;
}

export function ComplianceAuditSidebar({
  auditResult,
  onOverride,
  isOverridden,
  canOverride,
}: ComplianceAuditSidebarProps) {
  if (!auditResult) {
    return (
      <div className="h-full flex flex-col p-6 bg-[#0a0f1c] border-l border-[#1e293b]">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Compliance Audit Trail</h3>
        <p className="text-sm text-[#64748b]">Awaiting content for analysis...</p>
      </div>
    );
  }

  const { isVerified, hash, rules } = auditResult;
  const isActuallyVerified = isVerified || isOverridden;

  return (
    <div className="h-full flex flex-col bg-[#0a0f1c] border-l lg:border-t-0 border-t border-[#1e293b] rounded-r-2xl overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-[#1e293b] flex items-center gap-3 ${isActuallyVerified ? 'bg-[#052e16]/30' : 'bg-[#422006]/30'}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isActuallyVerified ? 'bg-[#22c55e]' : 'bg-[#f59e0b] animate-pulse'}`} />
        <div>
          <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-0.5">Status Header</h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isActuallyVerified ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
              COMPLIANCE: {isActuallyVerified ? 'VERIFIED' : 'ACTION REQUIRED'}
            </span>
            {isOverridden && <span className="px-2 py-0.5 bg-[#1e293b] text-white text-[10px] uppercase rounded">Overridden</span>}
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Rule Checklist */}
        <div>
          <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-wider border-b border-[#1e293b] pb-2">Rule Checklist</h3>
          <div className="space-y-4">
            <RuleItem
              name="Promissory Language Scan"
              passed={rules.promissory.passed}
              details={rules.promissory.passed ? '0 forbidden terms found.' : `${rules.promissory.flaggedPhrases.length} issue(s) detected.`}
              flaggedPhrases={rules.promissory.flaggedPhrases}
            />
            <RuleItem
              name="Balanced Disclosure"
              passed={rules.balancedDisclosure.passed}
              details={rules.balancedDisclosure.passed ? 'Risk disclosure verified.' : 'Missing required disclosure.'}
              flaggedPhrases={rules.balancedDisclosure.flaggedPhrases}
            />
            <RuleItem
              name="Non-Solicitation Check"
              passed={rules.fiduciary.passed}
              details={rules.fiduciary.passed ? 'Ancillary scope verified.' : 'Fiduciary boundary violation.'}
              flaggedPhrases={rules.fiduciary.flaggedPhrases}
            />
          </div>
        </div>

        {/* Audit ID */}
        <div className="bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
          <h3 className="text-xs font-medium text-[#64748b] mb-1">Audit ID</h3>
          <p className="text-sm font-mono text-[#94a3b8] break-all">{hash}</p>
        </div>

        {/* Override Button */}
        {canOverride && !isVerified && (
          <div className="pt-4 border-t border-[#1e293b]">
            <button
              onClick={onOverride}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isOverridden 
                  ? 'bg-[#1e293b] text-white hover:bg-[#334155]' 
                  : 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 border border-[#ef4444]/20'
              }`}
            >
              {isOverridden ? 'Revoke Override' : 'Manual Officer Override'}
            </button>
            <p className="text-xs text-[#64748b] mt-2 text-center">
              Officer review required to bypass automated constraints.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RuleItem({ name, passed, details, flaggedPhrases }: { name: string; passed: boolean; details: string; flaggedPhrases: any[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {passed ? (
          <svg className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${passed ? 'text-[#94a3b8]' : 'text-[#e2e8f0]'}`}>{name}</p>
          <p className={`text-xs ${passed ? 'text-[#64748b]' : 'text-[#ef4444]'}`}>{details}</p>
        </div>
      </div>
      
      {!passed && flaggedPhrases.length > 0 && (
        <div className="ml-7 space-y-2 mt-2">
          {flaggedPhrases.map((flag, idx) => (
            <div key={idx} className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded p-2 relative group cursor-help">
              <span className="text-xs font-mono text-[#ef4444] break-all">&quot;{flag.phrase}&quot;</span>
              
              {/* XAI Tooltip */}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl">
                <p className="text-xs text-white font-medium mb-1">Why was this flagged?</p>
                <p className="text-[11px] text-[#94a3b8]">{flag.reason}</p>
                {flag.suggestion && (
                  <p className="text-[11px] text-[#3b82f6] mt-1 pt-1 border-t border-[#334155]">{flag.suggestion}</p>
                )}
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#1e293b] border-b border-r border-[#334155] transform rotate-45"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
