import nodemailer from 'nodemailer';

// Helper function to escape HTML
const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
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
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eaebed;">
          <!-- Header block -->
          <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:30px;text-align:center;">
            <h2 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">📬 New Connection</h2>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Someone reached out from your portfolio</p>
          </div>
          <!-- Body -->
          <div style="padding:40px 30px;background:#ffffff;">
            <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:30px;border:1px solid #f1f5f9;">
              <table style="width:100%;border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#334155;width:80px;">Name</td>
                  <td style="padding:8px 0;color:#0f172a;font-weight:500;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#334155;">Email</td>
                  <td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#6366f1;text-decoration:none;font-weight:500;">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#334155;">Subject</td>
                  <td style="padding:8px 0;color:#0f172a;font-weight:500;">${escapeHtml(subject)}</td>
                </tr>
              </table>
            </div>
            
            <h3 style="margin:0 0 12px;color:#1e293b;font-size:16px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message</h3>
            <div style="background:#f8fafc;padding:20px;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;color:#334155;line-height:1.7;white-space:pre-wrap;font-size:15px;">${escapeHtml(message)}</div>
          </div>
          <!-- Footer -->
          <div style="padding:20px;text-align:center;background:#f8fafc;border-top:1px solid #eaebed;color:#64748b;font-size:13px;">
            Deployed via Vercel Serverless Contact System
          </div>
        </div>
      `,
    };

    // Auto-reply to sender
    const replyEmail = {
      from: `"Srikar" <${fromEmail}>`,
      to: email,
      subject: `Thanks for reaching out, ${escapeHtml(name)}!`,
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eaebed;">
          <!-- Header block -->
          <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:30px;text-align:center;">
            <h2 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">Message Received!</h2>
          </div>
          <!-- Body -->
          <div style="padding:40px 30px;background:#ffffff;">
            <p style="color:#334155;font-size:16px;line-height:1.6;margin-top:0;">Hi <strong>${escapeHtml(name)}</strong> 👋,</p>
            <p style="color:#334155;font-size:16px;line-height:1.7;">Thanks for reaching out! I've successfully received your message about <strong style="color:#0f172a;background:#f1f5f9;padding:2px 8px;border-radius:4px;">${escapeHtml(subject)}</strong>.</p>
            <p style="color:#334155;font-size:16px;line-height:1.7;">I'll review it and get back to you within 24–48 hours.</p>
            
            <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;">
              <p style="color:#64748b;font-size:15px;margin-bottom:12px;">In the meantime, feel free to explore:</p>
              <a href="https://github.com/Srikar-developer" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin-right:10px;">GitHub Profile</a>
              <a href="https://www.linkedin.com/in/srikar-p-64a4b12a5/" style="display:inline-block;padding:10px 20px;background:#0077b5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">LinkedIn Profile</a>
            </div>
            
            <p style="margin-top:40px;color:#0f172a;font-weight:700;font-size:16px;">Best regards,<br><span style="color:#6366f1;">Srikar</span></p>
          </div>
        </div>
      `,
    };

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Vercel Email configuration missing: EMAIL_USER or EMAIL_PASS not set.");
      return res.status(503).json({ success: false, error: 'Email service is not configured on Vercel backend. Please try again later.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail(notificationEmail);
    await transporter.sendMail(replyEmail);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully via Vercel!',
    });

  } catch (err) {
    console.error('API Contact error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send email via Vercel. Please try again.' });
  }
}
