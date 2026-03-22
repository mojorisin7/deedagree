import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface InviteEmailParams {
  to: string
  guarantorName: string
  deedReference: string
  companyName: string
  propertyAddress: string
  mortgageAmountFormatted: string
  lender: string
  signingUrl: string
  expiryDate: string
}

export async function sendInviteEmail(params: InviteEmailParams): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Deed of Guarantee — Signature Required — ${params.companyName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
          <div style="background: #1a237e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 2px;">DEED OF GUARANTEE</h1>
          </div>
          <div style="padding: 32px; background: #fff;">
            <p>Dear ${params.guarantorName},</p>
            <p>You have been identified as a guarantor for the following Deed of Guarantee and your signature is required.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Reference</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.deedReference}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.companyName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Property</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.propertyAddress}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mortgage Amount</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${params.mortgageAmountFormatted}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Lender</td><td style="padding: 8px;">${params.lender}</td></tr>
            </table>
            <p>Please review the deed carefully before signing. You may wish to seek independent legal advice before proceeding.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${params.signingUrl}" style="background: #1a237e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Review and Sign the Deed →</a>
            </div>
            <p style="font-size: 12px; color: #666;">This link expires on ${params.expiryDate}. If you have any questions, please contact the issuing organisation.</p>
          </div>
          <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 11px; color: #888; font-family: Arial, sans-serif;">
            This email was sent by the Deed of Guarantee management system. This is a legally binding document.
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send invite email:', error)
  }
}

export interface ReminderEmailParams extends InviteEmailParams {
  daysRemaining: number
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Reminder: Deed of Guarantee Signature Required — ${params.companyName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
          <div style="background: #1a237e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 2px;">REMINDER — DEED OF GUARANTEE</h1>
          </div>
          <div style="padding: 32px; background: #fff;">
            <p>Dear ${params.guarantorName},</p>
            <p>This is a reminder that your signature is still required on the following Deed of Guarantee. <strong>${params.daysRemaining} day(s)</strong> remain before the signing link expires.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${params.signingUrl}" style="background: #1a237e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Sign the Deed Now →</a>
            </div>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send reminder email:', error)
  }
}

export interface CompletionEmailParams {
  to: string[]
  recipientName: string
  deedReference: string
  companyName: string
  downloadUrl: string
}

export async function sendCompletionEmail(params: CompletionEmailParams): Promise<void> {
  try {
    for (const recipient of params.to) {
      await resend.emails.send({
        from: FROM,
        to: recipient,
        subject: `Deed of Guarantee Fully Signed — ${params.companyName}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
            <div style="background: #1a237e; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 2px;">DEED FULLY EXECUTED</h1>
            </div>
            <div style="padding: 32px; background: #fff;">
              <p>Dear ${params.recipientName},</p>
              <p>All parties have signed the Deed of Guarantee <strong>${params.deedReference}</strong> for <strong>${params.companyName}</strong>.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${params.downloadUrl}" style="background: #1a237e; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Download Executed Deed →</a>
              </div>
            </div>
          </div>
        `,
      })
    }
  } catch (error) {
    console.error('Failed to send completion email:', error)
  }
}

export async function sendMagicLinkEmail(params: { to: string; url: string }): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: 'Sign in to Deed of Guarantee',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Sign in to Deed of Guarantee</h2>
          <p>Click the button below to sign in. This link expires in 10 minutes.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${params.url}" style="background: #1a237e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">Sign In →</a>
          </div>
          <p style="font-size: 12px; color: #888;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send magic link email:', error)
  }
}
