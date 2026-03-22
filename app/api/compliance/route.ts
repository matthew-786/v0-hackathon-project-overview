import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { emailBody, subject } = await req.json();

        const finraRuleContext = `
      FINRA Rule 2210 (Communications with the Public) explicitly states:
      1. All member communications must be based on principles of fair dealing and good faith, must be fair and balanced, and must provide a sound basis for evaluating the facts in regard to any particular security or type of security, industry, or service.
      2. No member may make any false, exaggerated, unwarranted, promissory or misleading statement or claim in any communication.
      3. Members may not predict or project performance, imply that past performance will recur or make any exaggerated or unwarranted claim, promise or guarantee.
    `;

        const result = streamObject({
            model: google('gemini-1.5-pro-latest'),
            schema: z.object({
                is_compliant: z.boolean().describe('Whether the email complies with FINRA Rule 2210'),
                flagged_text: z.array(z.string()).describe('Specific phrases from the email that violate the rule'),
                rule_cited: z.string().describe('The specific section of FINRA Rule 2210 cited (e.g., "FINRA 2210(d)(1)")'),
                suggested_fix: z.string().describe('A suggested edit to make the email compliant'),
                explanation: z.string().describe('Detailed explanation of why this was flagged or approved. Stream this text so the user can read it as it generates.')
            }),
            prompt: `
        Evaluate the following email draft against FINRA rules.
        
        ${finraRuleContext}

        Email Subject: ${subject}
        Email Body:
        """
        ${emailBody}
        """

        Determine if this email is safe to send without violating FINRA Rule 2210. 
        Focus especially on avoiding promissory language, guarantees, and exaggerated claims.
      `,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
