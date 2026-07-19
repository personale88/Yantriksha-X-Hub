import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load environmental parameters
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Yantriksha_X_Hub <noreply@yantriksha.com>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const originalTo = to;
  let targetTo = to;
  let finalSubject = subject;

  // Resend free accounts can only send emails to the owner's verified address
  if (SMTP_HOST.includes('resend.com') && to.toLowerCase() !== 'boddedavignesh3@gmail.com') {
    targetTo = 'boddedavignesh3@gmail.com';
    finalSubject = `[SANDBOX FOR: ${originalTo}] ${subject}`;
    console.log(`[EMAIL UTILITY] Resend sandbox restriction active. Redirecting email from ${originalTo} to verified owner: ${targetTo}`);
  } else {
    console.log(`[EMAIL UTILITY] Sending email to: ${to} | Subject: ${subject}`);
  }
  
  // 1. Create simulated email log entry for local development verification
  const logDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const logFile = path.join(logDir, 'emails-sent.log');
  const emailLogEntry = `
========================================
[TIMESTAMP] ${new Date().toISOString()}
[TO] ${targetTo} (Original: ${originalTo})
[SUBJECT] ${finalSubject}
[BODY]
${html}
========================================
`;
  
  try {
    fs.appendFileSync(logFile, emailLogEntry);
    console.log(`[EMAIL UTILITY] Email simulator logged successfully to: scratch/emails-sent.log`);
  } catch (logErr) {
    console.error(`[EMAIL UTILITY] Failed to write simulated email log:`, logErr);
  }

  // 2. Try sending real email using SMTP if configured
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM,
        to: targetTo,
        subject: finalSubject,
        html,
      });

      console.log(`[EMAIL UTILITY] Real email successfully sent via SMTP to: ${targetTo}`);
    } catch (smtpErr) {
      console.error(`[EMAIL UTILITY] Real SMTP email delivery failed (falling back to simulator logs):`, smtpErr);
    }
  } else {
    console.log(`[EMAIL UTILITY] SMTP credentials missing in .env. Real email skipped, simulated locally.`);
  }
}
