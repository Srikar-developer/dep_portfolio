require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const hasGmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const hasSendGridConfig = Boolean(process.env.SENDGRID_API_KEY);
const OWNER_EMAIL = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER || 'srikarsri5566@gmail.com';

// Initialize SendGrid if API key is provided
if (hasSendGridConfig) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
};

// ── Middleware ──────────────────────────────────────────────────────────────
// Allow any localhost port, 127.0.0.1, and any Vercel deployment domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests / curl
    if (
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      origin === 'https://dep-portfolio-eight.vercel.app'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive default for portfolio API
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

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
      rejectUnauthorized: false,
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
  console.warn('⚠️ No email service configured! Contact form will run in fallback simulation mode.');
}

// Simple in-memory rate limiting map
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per 15 minutes

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before trying again.',
    });
  }

  clientData.count += 1;
  requestCounts.set(ip, clientData);
  next();
};

// ── POST /api/contact ───────────────────────────────────────────────────────
app.post('/api/contact', rateLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim();
  const cleanSubject = String(subject).trim();
  const cleanMessage = String(message).trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  if (!transporter && !hasSendGridConfig) {
    return res.status(503).json({
      success: false,
      error: 'Email service is not configured. Please contact directly at ' + OWNER_EMAIL,
    });
  }

  try {
    const fromEmail = process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@portfolio.dev';

    // Email to Srikar (admin notification)
    const notificationHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">New Contact Submission</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Automated notification from your portfolio</p>
        </div>
        
        <div style="margin-bottom: 35px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 16px; font-size: 15px;">
            <tr>
              <td style="color: #64748b; width: 120px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Name</td>
              <td style="color: #0f172a; font-weight: 600;">${escapeHtml(cleanName)}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
              <td><a href="mailto:${escapeHtml(cleanEmail)}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${escapeHtml(cleanEmail)}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</td>
              <td style="color: #0f172a; font-weight: 500;">${escapeHtml(cleanSubject)}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Message Content</h3>
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 15px; border: 1px solid #e2e8f0;">${escapeHtml(cleanMessage)}</div>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 500;">
          System generated message &bull; Portfolio Backend
        </div>
      </div>
    `;

    // Auto-reply to sender
    const replyHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Message Received</h2>
        </div>
        
        <div style="padding: 32px 0;">
          <p style="color: #334155; font-size: 16px; line-height: 1.7; margin-top: 0; font-weight: 500;">Dear ${escapeHtml(cleanName)},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.7;">Thank you for contacting me. This is an automated confirmation that your message regarding <strong style="color: #0f172a; font-weight: 600;">"${escapeHtml(cleanSubject)}"</strong> has been successfully delivered to my inbox.</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.7;">I am currently reviewing your inquiry and will provide a response as promptly as possible, generally within 1-2 business days.</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="https://github.com/Srikar-developer" style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 14px; border-radius: 8px; margin: 0 8px 8px 0;">View GitHub</a>
            <a href="https://www.linkedin.com/in/srikar-p-64a4b12a5/" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #0f172a; text-decoration: none; font-weight: 500; border-radius: 8px; font-size: 14px; border: 1px solid #cbd5e1; margin: 0 0 8px 0;">Connect on LinkedIn</a>
          </div>
          
          <div style="margin-top: 48px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
            <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 16px;">Best regards,</p>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 15px;">Srikar</p>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Software Developer</p>
          </div>
        </div>
      </div>
    `;

    let notificationSent = false;
    let emailServiceUsed = null;

    // 1. Try Gmail via Nodemailer
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Portfolio Contact" <${fromEmail}>`,
          to: OWNER_EMAIL,
          replyTo: cleanEmail,
          subject: `Portfolio Contact: ${cleanSubject}`,
          html: notificationHtml,
        });
        notificationSent = true;
        emailServiceUsed = 'Gmail';

        // Attempt user auto-reply non-blockingly
        transporter.sendMail({
          from: `"Srikar" <${fromEmail}>`,
          to: cleanEmail,
          subject: `Thanks for reaching out, ${cleanName}!`,
          html: replyHtml,
        }).catch((replyErr) => console.warn('Gmail auto-reply notice:', replyErr.message));

      } catch (gmailError) {
        console.warn('Gmail sending failed:', gmailError.message);
      }
    }

    // 2. Fallback to SendGrid if Gmail was unavailable or failed
    if (!notificationSent && hasSendGridConfig) {
      try {
        const sendgridSender = process.env.SENDGRID_FROM_EMAIL || fromEmail;
        await sgMail.send({
          to: OWNER_EMAIL,
          from: sendgridSender,
          replyTo: cleanEmail,
          subject: `Portfolio Contact: ${cleanSubject}`,
          html: notificationHtml,
        });
        notificationSent = true;
        emailServiceUsed = 'SendGrid';
        console.log('✅ Email delivered via SendGrid fallback');

        sgMail.send({
          to: cleanEmail,
          from: sendgridSender,
          subject: `Thanks for reaching out, ${cleanName}!`,
          html: replyHtml,
        }).catch((sgReplyErr) => console.warn('SendGrid auto-reply notice:', sgReplyErr.message));

      } catch (sendGridError) {
        console.error('SendGrid fallback error:', sendGridError.message);
      }
    }

    if (!notificationSent) {
      throw new Error('All configured email transports failed to send the message.');
    }

    res.json({
      success: true,
      message: 'Message sent successfully!',
      service: emailServiceUsed,
    });

  } catch (err) {
    console.error('Contact form endpoint error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again later.' });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on http://localhost:${PORT}`);
});
