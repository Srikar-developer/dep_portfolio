require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const hasGmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const hasSendGridConfig = Boolean(process.env.SENDGRID_API_KEY);

// Initialize SendGrid if API key is provided
if (hasSendGridConfig) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to escape HTML
const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://dep-portfolio-eight.vercel.app'] }));
app.use(express.json());

// ── Nodemailer transporter (Gmail + App Password) ───────────────────────────
let transporter = null;

if (hasGmailConfig) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-char Google App Password
    },
    tls: {
      rejectUnauthorized: false, // Handle self-signed cert chains on some networks
    },
  });

  // Verify transporter on startup
  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️ Gmail service is not ready:', error.message);
      console.log('⚠️ Check EMAIL_USER and EMAIL_PASS in .env (use a Gmail App Password).');
    } else {
      console.log('✅ Gmail service ready');
    }
  });
} else {
  console.log('⚠️ Gmail is not configured. Set EMAIL_USER and EMAIL_PASS in .env to enable Gmail.');
}

// Check SendGrid configuration
if (hasSendGridConfig) {
  console.log('✅ SendGrid configured as fallback');
} else {
  console.log('⚠️ SendGrid is not configured. Set SENDGRID_API_KEY in .env to enable SendGrid fallback.');
}

if (!hasGmailConfig && !hasSendGridConfig) {
  console.warn('⚠️ No email service configured! Contact form will not work.');
}

// ── POST /api/contact ───────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  if (!transporter && !hasSendGridConfig) {
    return res.status(503).json({
      success: false,
      error: 'Email service is not configured. Please try again later.',
    });
  }

  try {
    const fromEmail = process.env.EMAIL_USER || 'noreply@portfolio.dev';

    // Email to Srikar (notification)
    const notificationEmail = {
      from: `"Portfolio Contact" <${fromEmail}>`,
      to: process.env.EMAIL_USER || email,
      replyTo: email,
      subject: `Portfolio Contact: ${escapeHtml(subject)}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h2 style="color:#6366f1;margin-bottom:24px;">📬 New Contact Message</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;width:100px;">Name</td><td style="padding:10px 0;color:#475569;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;">Email</td><td style="padding:10px 0;color:#475569;"><a href="mailto:${escapeHtml(email)}" style="color:#6366f1;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;">Subject</td><td style="padding:10px 0;color:#475569;">${escapeHtml(subject)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-weight:700;color:#0f172a;margin-bottom:8px;">Message:</p>
          <p style="color:#475569;line-height:1.8;white-space:pre-wrap;">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-size:13px;color:#94a3b8;">Sent from your portfolio contact form.</p>
        </div>
      `,
    };

    // Auto-reply to sender
    const replyEmail = {
      from: `"Srikar" <${fromEmail}>`,
      to: email,
      subject: `Thanks for reaching out, ${escapeHtml(name)}!`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h2 style="color:#6366f1;margin-bottom:16px;">Hi ${escapeHtml(name)} 👋</h2>
          <p style="color:#475569;line-height:1.8;">Thanks for getting in touch! I've received your message about <strong style="color:#0f172a;">"${escapeHtml(subject)}"</strong> and will get back to you within <strong style="color:#0f172a;">24–48 hours</strong>.</p>
          <p style="color:#475569;line-height:1.8;margin-top:16px;">In the meantime, feel free to explore my <a href="https://github.com/Srikar-developer" style="color:#6366f1;">GitHub</a> or connect on <a href="https://www.linkedin.com/in/srikar-p-64a4b12a5/" style="color:#6366f1;">LinkedIn</a>.</p>
          <p style="margin-top:32px;color:#0f172a;font-weight:600;">— Srikar</p>
        </div>
      `,
    };

    let emailServiceUsed = null;

    // Try Gmail first, then fallback to SendGrid
    try {
      if (transporter) {
        await transporter.sendMail(notificationEmail);
        await transporter.sendMail(replyEmail);
        emailServiceUsed = 'Gmail';
      } else {
        throw new Error('Gmail not available');
      }
    } catch (gmailError) {
      console.warn('Gmail failed:', gmailError.message);

      if (hasSendGridConfig) {
        try {
          await sgMail.send(notificationEmail);
          await sgMail.send(replyEmail);
          emailServiceUsed = 'SendGrid';
          console.log('✅ Email sent via SendGrid (Gmail fallback)');
        } catch (sendGridError) {
          console.error('SendGrid also failed:', sendGridError.message);
          throw new Error('Both Gmail and SendGrid failed');
        }
      } else {
        throw gmailError;
      }
    }

    res.json({
      success: true,
      message: 'Message sent successfully!',
      service: emailServiceUsed
    });
  } catch (err) {
    console.error('Contact form error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
