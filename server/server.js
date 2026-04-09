require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// ── Nodemailer transporter (Gmail + App Password) ───────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'placeholder',
    pass: process.env.EMAIL_PASS || 'placeholder',   // 16-char Google App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail transporter error:', error.message);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Please create a .env file and set EMAIL_USER and EMAIL_PASS.');
    }
  } else {
    console.log('✅ Mail server ready');
  }
});

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

  try {
    // Email to Srikar (notification)
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h2 style="color:#6366f1;margin-bottom:24px;">📬 New Contact Message</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;width:100px;">Name</td><td style="padding:10px 0;color:#475569;">${name}</td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;">Email</td><td style="padding:10px 0;color:#475569;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:700;color:#0f172a;">Subject</td><td style="padding:10px 0;color:#475569;">${subject}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-weight:700;color:#0f172a;margin-bottom:8px;">Message:</p>
          <p style="color:#475569;line-height:1.8;white-space:pre-wrap;">${message}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
          <p style="font-size:13px;color:#94a3b8;">Sent from your portfolio contact form.</p>
        </div>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Srikar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h2 style="color:#6366f1;margin-bottom:16px;">Hi ${name} 👋</h2>
          <p style="color:#475569;line-height:1.8;">Thanks for getting in touch! I've received your message about <strong style="color:#0f172a;">"${subject}"</strong> and will get back to you within <strong style="color:#0f172a;">24–48 hours</strong>.</p>
          <p style="color:#475569;line-height:1.8;margin-top:16px;">In the meantime, feel free to explore my <a href="https://github.com/Srikar-developer" style="color:#6366f1;">GitHub</a> or connect on <a href="https://www.linkedin.com/in/srikar-p-64a4b12a5/" style="color:#6366f1;">LinkedIn</a>.</p>
          <p style="margin-top:32px;color:#0f172a;font-weight:600;">— Srikar</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Mail send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
