# Deployment Guide - Fix for "JSON" Error

When deploying to production, the form was showing: **"Failed to execute 'json' on 'Response': Unexpected end of JSON input"**

This is fixed! Here's how to properly deploy:

---

## 🔧 What Was Fixed

### Issue 1: Hardcoded Backend URL
**Before:** Form tried to send to `/api/contact` (relative path)  
**After:** Configurable backend URL based on environment

### Issue 2: Poor JSON Error Handling
**Before:** Blindly parsed response as JSON without checking content-type  
**After:** Checks Content-Type header before parsing

### Issue 3: Unclear Error Messages
**Before:** Generic errors  
**After:** Specific errors for different failure types (offline vs backend error)

---

## 📋 How to Deploy

### **Option 1: Deploy with your own backend (Recommended)**

#### Step 1: Update Backend URL in App.js
```javascript
// File: portfolio/src/App.js (Line 1-4)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://your-backend-url.com'; // ← CHANGE THIS
```

Replace `https://your-backend-url.com` with your actual backend URL:
- If using Heroku: `https://your-app.herokuapp.com`
- If using Railway: `https://your-app.up.railway.app`
- If using Render: `https://your-app.onrender.com`

#### Step 2: Deploy Frontend
```bash
cd portfolio
npm run build
# Deploy portfolio/dist/ to Vercel/Netlify/GitHub Pages
```

#### Step 3: Deploy Backend
```bash
cd server
# Deploy to Heroku/Railway/Render with:
# PORT environment variable
# EMAIL_USER (Gmail)
# EMAIL_PASS (Gmail App Password)
# SENDGRID_API_KEY (optional fallback)
```

---

### **Option 2: Use Vercel for both Frontend + Backend**

#### Step 1: Add Backend Function
Create `api/contact.js` in your Vercel project:
```javascript
// vercel project root: api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    });

    return res.status(200).json({ success: true, message: 'Email sent!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### Step 2: Update App.js for Vercel
```javascript
// portfolio/src/App.js
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin; // Uses same domain (Vercel)
```

---

## 🚀 Deployment Platforms

### **Vercel (Recommended - Easiest)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd portfolio
vercel

# It will ask for settings, auto-detects Vite build
```
- ✅ Free tier available
- ✅ Auto SSL/HTTPS
- ✅ Environment variables built-in
- ✅ Can use Serverless Functions for backend

### **Netlify**
```bash
cd portfolio
npm run build

# Drag & drop portfolio/dist/ to Netlify
# Or: npm install -g netlify-cli && netlify deploy
```

**For backend API, add to `netlify.toml`:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
```

### **Railway.app**
```bash
# Deploy backend
railway link
railway deploy

# Frontend to Vercel/Netlify
```

### **Render.com**
```bash
# Create Web Service from GitHub
# Set Build Command: npm run build
# Set Start Command: node server.js
```

---

## 🔐 Environment Variables

### **Backend Environmental Variables** (server/.env)
```env
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
SENDGRID_API_KEY=SG.xxxxx (optional)
```

### **Frontend Configuration** (portfolio/src/App.js)
```javascript
// Change this line based on deployment:
const API_BASE_URL = 'https://your-deployed-backend.com';
```

---

## ✅ Testing After Deployment

### Test 1: Form Submission
```
1. Fill out contact form
2. Submit
3. Should show success message
4. Check your email for the message
```

### Test 2: Error Handling
```
1. Go offline (DevTools → Network → Offline)
2. Try to submit
3. Should show: "You're offline. Your message has been saved"
4. Red banner should appear
```

### Test 3: Draft Save
```
1. Type in form
2. Refresh page
3. Form should be pre-filled with previous data
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
**Problem:** Backend URL is wrong  
**Solution:** Check `API_BASE_URL` in `portfolio/src/App.js`

### Error: "Failed to send message"
**Problem:** Backend isn't responding with JSON  
**Solution:** Check backend logs, ensure it's running

### Error: "All fields required"
**Problem:** Form validation failing  
**Solution:** Check that all fields are filled correctly

### Error: "Gmail service is not ready"
**Problem:** EMAIL_USER or EMAIL_PASS is wrong  
**Solution:** 
1. Use Gmail App Password (not regular password)
2. Generate at: https://myaccount.google.com/apppasswords
3. Must be exactly 16 characters

---

## 📝 Deployment Checklist

- [ ] Updated `API_BASE_URL` in App.js to production backend
- [ ] Built frontend: `npm run build`
- [ ] Deployed frontend to Vercel/Netlify
- [ ] Deployed backend with environment variables
- [ ] Backend has EMAIL_USER and EMAIL_PASS set
- [ ] Backend is running and accessible
- [ ] Test form submission works
- [ ] Test offline detection shows red banner
- [ ] Test draft auto-save works

---

## 🆘 Quick Fix: Using Email Fallback Only

If you don't have a backend yet, temporarily change the form to show the email fallback directly:

```javascript
// portfolio/src/App.js - In form submit handler
// Instead of fetch, just show email message:
formMessage.innerHTML = `
  <div style="display:flex;gap:12px;align-items:center;">
    <i class="fas fa-envelope" style="color:#6366f1;"></i>
    <span>Send your message to <a href="mailto:srikarpuyal.me@gmail.com">srikarpuyal.me@gmail.com</a></span>
  </div>
`;
```

Then restore the real backend later.

---

## 📞 Need Help?

For deployment issues:
1. Check backend is actually running
2. Check API_BASE_URL is correct
3. Check environment variables are set
4. Check CORS is configured on backend
5. Look at browser Console (F12) for actual error

---

**Status:** ✅ Fixed and ready to deploy!

Generated: April 17, 2026
