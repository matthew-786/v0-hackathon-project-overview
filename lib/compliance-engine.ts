// lib/compliance-engine.ts
export interface ComplianceRuleResult {
  passed: boolean;
  flaggedPhrases: Array<{
    phrase: string;
    reason: string;
    suggestion?: string;
  }>;
}

export interface ComplianceAuditResult {
  isVerified: boolean;
  hash: string;
  rules: {
    promissory: ComplianceRuleResult;
    balancedDisclosure: ComplianceRuleResult;
    fiduciary: ComplianceRuleResult;
  };
}

export const checkPromissoryLanguage = (text: string): ComplianceRuleResult => {
  const forbidden = [
    'guaranteed', 'no-risk', 'certainty', "can't lose", '100% safe',
    'major', "don't miss out", 'dont miss out', 'once in a lifetime', 
    'double investment', 'double your', 'huge returns', 'massive', 
    'secret strategy', 'risk-free', 'risk free', 'surefire', 'no downside'
  ];
  const lowerText = text.toLowerCase();
  const flaggedPhrases: ComplianceRuleResult['flaggedPhrases'] = [];

  forbidden.forEach(term => {
    // Escape term and use word boundaries if appropriate
    const regex = new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        flaggedPhrases.push({
          phrase: match,
          reason: `Keyword '${match}' violates FINRA Rule 2210 regarding exaggerated, promissory, or high-pressure claims.`,
        });
      });
    }
  });

  return { passed: flaggedPhrases.length === 0, flaggedPhrases };
};

export const checkBalancedDisclosure = (text: string): ComplianceRuleResult => {
  const benefits = ['qsbs', 'tax efficiency', 'tax benefit'];
  const risks = ['tax advice', 'consult your tax professional', 'risk', 'disclaimer'];
  
  const lowerText = text.toLowerCase();
  const flaggedPhrases: ComplianceRuleResult['flaggedPhrases'] = [];

  const hasBenefit = benefits.some(b => lowerText.includes(b));
  const hasRisk = risks.some(r => lowerText.includes(r));

  if (hasBenefit && !hasRisk) {
    // Find which benefit was mentioned
    benefits.forEach(b => {
      const regex = new RegExp(`\\b${b.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          flaggedPhrases.push({
            phrase: match,
            reason: `Mention of tax benefit ('${match}') requires a corresponding risk disclosure or disclaimer (e.g., 'This does not constitute tax advice').`,
            suggestion: "Please append a standard tax risk disclosure."
          });
        });
      }
    });

    // Fallback if token boundaries prevented regex matching but .includes was true
    if (flaggedPhrases.length === 0) {
      flaggedPhrases.push({
        phrase: 'Tax Benefit mentioned without disclosure',
        reason: "Mention of tax benefit requires a corresponding risk disclosure.",
        suggestion: "Please append a standard tax risk disclosure."
      });
    }
  }

  return { passed: flaggedPhrases.length === 0, flaggedPhrases };
};

export const checkFiduciaryGuardrail = (text: string): ComplianceRuleResult => {
  const solicitationTerms = ['replace', 'replacing', 'new advisor', 'transfer assets'];
  const safeHarbors = ['ancillary', 'complementary'];
  
  const lowerText = text.toLowerCase();
  const flaggedPhrases: ComplianceRuleResult['flaggedPhrases'] = [];

  solicitationTerms.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const hasSafeHarbor = safeHarbors.some(s => lowerText.includes(s));
      if (!hasSafeHarbor) {
        matches.forEach(match => {
          flaggedPhrases.push({
            phrase: match,
            reason: `Language suggesting replacing a current advisor ('${match}') is flagged. Ensure 'Ancillary Opportunity' phrasing is maintained.`,
            suggestion: "Clarify that the services are complementary or ancillary."
          });
        });
      }
    }
  });

  return { passed: flaggedPhrases.length === 0, flaggedPhrases };
};

export const generateComplianceHash = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `SEC-${timestamp}-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
};

export const runComplianceAudit = (text: string): ComplianceAuditResult => {
  const promissory = checkPromissoryLanguage(text);
  const balancedDisclosure = checkBalancedDisclosure(text);
  const fiduciary = checkFiduciaryGuardrail(text);

  const isVerified = promissory.passed && balancedDisclosure.passed && fiduciary.passed;
  const hash = generateComplianceHash(text);

  return {
    isVerified,
    hash,
    rules: {
      promissory,
      balancedDisclosure,
      fiduciary
    }
  };
};

export const appendRegulatoryFooters = (text: string): string => {
  const standardFooter = `\n\n---\nAcme Wealth Management, 123 Financial District \nSecurities offered through FINRA/SIPC. This email is intended for informational purposes only.`;
  if (text.includes('Securities offered through FINRA')) {
    return text;
  }
  return text + standardFooter;
};
