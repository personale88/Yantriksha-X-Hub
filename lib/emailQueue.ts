import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  category?: 'club_updates' | 'event_notifications' | 'general_announcements' | 'newsletter' | 'recruitment_notifications';
}

/**
 * Queue an email for background sending.
 * Checks user preferences, prevents duplicate emails, and schedules sending.
 */
export async function queueEmail({ to, subject, html, category }: EmailOptions): Promise<boolean> {
  const originalTo = to.trim().toLowerCase();
  
  // 1. Check user notification preferences if category is provided
  if (category) {
    try {
      const userRes = await query('SELECT id FROM users WHERE LOWER(email) = ?', [originalTo]);
      if (userRes && userRes.length > 0) {
        const userId = userRes[0].id;
        const prefRes = await query(
          `SELECT ${category} FROM notification_preferences WHERE user_id = ?`,
          [userId]
        );
        // If preference record exists and is set to false, skip sending
        if (prefRes && prefRes.length > 0 && !prefRes[0][category]) {
          console.log(`[EMAIL QUEUE] Skipping email to ${originalTo} for category '${category}' (User opted-out)`);
          return false;
        }
      }
    } catch (prefErr) {
      console.error(`[EMAIL QUEUE] Error checking preferences for ${originalTo}:`, prefErr);
    }
  }

  // 2. Prevent duplicate emails (same recipient, same subject in last 5 minutes)
  try {
    const duplicateCheck = await query(
      `SELECT id FROM email_logs 
       WHERE recipient_email = ? AND subject = ? AND created_at >= NOW() - INTERVAL 5 MINUTE LIMIT 1`,
      [originalTo, subject]
    );
    if (duplicateCheck && duplicateCheck.length > 0) {
      console.log(`[EMAIL QUEUE] Skipping duplicate email to ${originalTo} with subject: "${subject}" (duplicate within 5 mins)`);
      return false;
    }
  } catch (dupErr) {
    console.error(`[EMAIL QUEUE] Error checking duplicates for ${originalTo}:`, dupErr);
  }

  // 3. Insert pending email into queue log
  try {
    await query(
      `INSERT INTO email_logs (recipient_email, subject, body_html, status, attempts) 
       VALUES (?, ?, ?, 'pending', 0)`,
      [originalTo, subject, html]
    );
    
    // Trigger background process (asynchronously, do not block the thread)
    processEmailQueue().catch(err => {
      console.error('[EMAIL QUEUE] Background queue processing failed:', err);
    });
    
    return true;
  } catch (queueErr) {
    console.error('[EMAIL QUEUE] Failed to queue email:', queueErr);
    return false;
  }
}

/**
 * Worker function to process all pending emails.
 * Uses nodemailer transporter and updates queue logs.
 */
export async function processEmailQueue(): Promise<void> {
  try {
    // Grab pending emails that have failed less than 3 times
    const pendingEmails = await query(
      `SELECT * FROM email_logs WHERE status = 'pending' AND attempts < 3 ORDER BY created_at ASC`
    );

    if (!pendingEmails || pendingEmails.length === 0) {
      return;
    }

    console.log(`[EMAIL QUEUE] Processing ${pendingEmails.length} pending email(s) in background...`);

    for (const email of pendingEmails) {
      // Pre-emptively increment attempts to prevent overlapping duplicate runs
      const currentAttempts = email.attempts + 1;
      await query(
        `UPDATE email_logs SET attempts = ? WHERE id = ?`,
        [currentAttempts, email.id]
      );

      try {
        await sendEmail({
          to: email.recipient_email,
          subject: email.subject,
          html: email.body_html,
        });

        // Set status to sent upon success
        await query(
          `UPDATE email_logs SET status = 'sent', last_error = NULL WHERE id = ?`,
          [email.id]
        );
      } catch (sendErr: any) {
        console.error(`[EMAIL QUEUE] Delivery failed for email ID ${email.id} (Attempt ${currentAttempts}):`, sendErr);
        
        // If attempts reach 3, mark as failed permanently, otherwise return to pending to retry later
        const nextStatus = currentAttempts >= 3 ? 'failed' : 'pending';
        await query(
          `UPDATE email_logs SET status = ?, last_error = ? WHERE id = ?`,
          [nextStatus, sendErr.message || String(sendErr), email.id]
        );
      }
    }
  } catch (workerErr) {
    console.error('[EMAIL QUEUE] Queue worker encounter error:', workerErr);
  }
}

interface TemplateParams {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  preheader?: string;
}

/**
 * Generates a clean, responsive HTML template with YantrikshaX Hub branding.
 */
export function generateEmailTemplate({ title, content, buttonText, buttonUrl, preheader }: TemplateParams): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .inner-body { width: 100% !important; padding: 20px !important; }
          .header-box { padding: 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      ${preheader ? `<span style="display: none; max-height: 0px; overflow: hidden;">${preheader}</span>` : ''}

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table class="inner-body" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);">
              
              <!-- ── Header ── -->
              <tr>
                <td class="header-box" style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #2563eb;">
                  <img src="https://excited-salk.vercel.app/logo.png" alt="YantrikshaX Hub Logo" style="height: 54px; width: auto; display: inline-block; vertical-align: middle;" />
                  <h1 style="color: #ffffff; font-family: sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 0.15em; margin: 12px 0 0 0; text-transform: uppercase;">YantrikshaX Hub</h1>
                </td>
              </tr>

              <!-- ── Content Body ── -->
              <tr>
                <td style="padding: 30px 40px; color: #334155; font-size: 15px; line-height: 1.625;">
                  
                  <h2 style="color: #1e293b; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 20px; letter-spacing: -0.01em;">
                    ${title}
                  </h2>
                  
                  <div style="color: #475569; font-weight: 400; margin-bottom: 25px;">
                    ${content}
                  </div>

                  ${buttonText && buttonUrl ? `
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${buttonUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2), 0 2px 4px -1px rgba(37,99,235,0.1); border: 1px solid #3b82f6;">
                          ${buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>` : ''}

                </td>
              </tr>

              <!-- ── Footer ── -->
              <tr>
                <td style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">
                  
                  <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">
                    YantrikshaX Hub Incubation Center
                  </p>
                  <p style="margin: 0 0 10px 0; line-height: 1.4;">
                    Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology
                  </p>
                  
                  <p style="margin: 0 0 18px 0; font-size: 11px;">
                    Coordinator: <a href="tel:+919182169185" style="color: #2563eb; text-decoration: none; font-weight: bold;">+91 91821 69185</a> | 
                    Email: <a href="mailto:yantrikshaxhub@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: bold;">yantrikshaxhub@gmail.com</a>
                  </p>

                  <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.5; border-t: 1px solid #e2e8f0; padding-top: 15px;">
                    This is an automated operational system email. You can manage your email notification categories inside your student <a href="http://localhost:3000/dashboard" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Dashboard settings console</a>.
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}
