require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.static('.'));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/rsvp', async (req, res) => {
  const { firstName, lastName, attending } = req.body;
  const fullName = `${firstName} ${lastName}`.trim();
  const status = attending ? 'JOYFULLY ACCEPTED' : 'REGRETFULLY DECLINED';
  const emoji = attending ? '🎉' : '💌';

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `${emoji} Wedding RSVP — ${fullName} has ${status}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #0f1932; color: #e8d9c0; border-radius: 8px;">
          <h2 style="color: #c4b49a; border-bottom: 1px solid #2a1f3d; padding-bottom: 1rem;">New RSVP Received</h2>
          <p><strong style="color: #9b2d52;">Guest:</strong> ${fullName}</p>
          <p><strong style="color: #9b2d52;">Response:</strong> ${status}</p>
          <p><strong style="color: #9b2d52;">Received:</strong> ${new Date().toLocaleString('en-ZA')}</p>
        </div>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wedding server running at http://localhost:${PORT}`);
});