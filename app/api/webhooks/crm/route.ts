import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { emailId, status, prospectName, subject } = await req.json();

        // Simulate CRM processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simulate sending webhook to Salesforce / HubSpot
        console.log('[CRM Webhook] Successfully Synced to Salesforce:', {
            emailId,
            status,
            prospectName,
            subject,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            { success: true, message: 'Successfully synced with Salesforce CRM' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to sync with CRM' },
            { status: 500 }
        );
    }
}
