'use server'

import { google } from 'googleapis'

const CLIENT_ID = process.env.GMAIL_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN
const USER_EMAIL = process.env.GMAIL_USER_EMAIL

export async function sendGmailEmail({ 
  to, 
  subject, 
  body 
}: { 
  to: string, 
  subject: string, 
  body: string 
}) {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !USER_EMAIL) {
    throw new Error('Gmail API credentials are not configured in environment variables.')
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // Encode the message to base64url
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
  const messageParts = [
    `From: ${USER_EMAIL}`,
    `To: ${to}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Subject: ${utf8Subject}`,
    '',
    body,
  ]
  const message = messageParts.join('\n')

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    return { success: true, messageId: res.data.id }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
