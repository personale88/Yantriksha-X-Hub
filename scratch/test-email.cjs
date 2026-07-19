const nodemailer = require('nodemailer');
require('dotenv').config();

async function test() {
  console.log("Testing Resend SMTP Connection directly via script...");
  const SMTP_HOST = process.env.SMTP_HOST || '';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';
  const SMTP_FROM = process.env.SMTP_FROM || 'Yantriksha_X_Hub <noreply@yantriksha.com>';

  console.log(`Config: Host=${SMTP_HOST}, Port=${SMTP_PORT}, User=${SMTP_USER}`);

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: 'boddedavignesh3@gmail.com',
      subject: 'Test Email from Yantriksha Hub Script',
      html: '<p>This is a test email sent from the testing script to verify Resend SMTP credentials.</p>'
    });
    console.log("✓ Success! Email sent successfully. Message ID:", info.messageId);
  } catch (err) {
    console.error("✗ Failed to send email:", err);
  }
}

test();
