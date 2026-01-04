
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Setup Headers (CORS)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  // Fallback to onboarding@resend.dev if no verified domain is configured
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  console.log(`[Notify] Attempting to send email. From: ${fromEmail}, To: ${adminEmail}`);

  if (!apiKey) {
    console.error('[Notify] Error: Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration: Missing Email API Key' });
  }

  if (!adminEmail) {
    console.error('[Notify] Error: Missing ADMIN_EMAIL');
    return res.status(500).json({ error: 'Server misconfiguration: Missing Admin Recipient Email' });
  }

  const resend = new Resend(apiKey);

  try {
    const { type, data } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (type === 'demo_request') {
        console.log(`[Notify] Processing Demo Request for ${data.email}`);
        
        // 1. Send Notification to Admin
        const adminResult = await resend.emails.send({
          from: `RosterSync Leads <${fromEmail}>`, 
          to: [adminEmail],
          subject: `🚀 New Demo Request: ${data.name} (${data.company})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #5851E8; margin-top: 0;">New Demo Request Received</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone}</p>
                </div>
                <p style="font-weight: bold; color: #333;">Requester Notes:</p>
                <div style="border-left: 4px solid #5851E8; padding: 10px 20px; background: #fdfdfd; font-style: italic; color: #555;">
                    ${data.notes || 'No specific notes provided.'}
                </div>
            </div>
          `,
        });

        if (adminResult.error) {
            console.error('[Notify] Resend Admin Email Error:', adminResult.error);
        }

        // 2. Send Confirmation to the User
        // Note: This only works on Resend trial if the user's email is your verified test email
        const userResult = await resend.emails.send({
          from: `RosterSync <${fromEmail}>`, 
          to: [data.email],
          subject: `RosterSync Demo Scheduled: We've received your request!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #5851E8; margin-top: 0;">Hello ${data.name.split(' ')[0]},</h2>
                <p>Thank you for your interest in <strong>RosterSync</strong>!</p>
                <p>We've received your request for a personalized demo for <strong>${data.company}</strong>. Our team will reach out shortly.</p>
                <p style="margin: 20px 0; font-weight: bold;">Best regards,<br/>The RosterSync Team</p>
            </div>
          `,
        });

        if (userResult.error) {
            console.warn('[Notify] Resend User Confirmation Error (Expected if user email not verified in Resend Trial):', userResult.error);
        }

        return res.status(200).json({ success: true, adminSent: !adminResult.error });

    } else if (type === 'support_ticket') {
        console.log(`[Notify] Processing Support Ticket from ${data.email}`);
        const supportResult = await resend.emails.send({
          from: `RosterSync Support <${fromEmail}>`,
          to: [adminEmail],
          subject: `🎫 Support Ticket: ${data.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #5851E8;">New Support Ticket</h2>
                <p><strong>User:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <hr style="border: none; border-top: 1px solid #eee;"/>
                <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
          `,
        });
        
        if (supportResult.error) {
            console.error('[Notify] Resend Support Ticket Error:', supportResult.error);
            return res.status(500).json({ error: supportResult.error });
        }
        
        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid notification type' });

  } catch (error: any) {
    console.error('[Notify] Internal Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
