const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const supportEmail = 'boticart.management@gmail.com';

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_FROM
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return {
      from: SMTP_FROM || 'no-reply@localhost',
      transporter: nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
      })
    };
  }

  return {
    from: SMTP_FROM || SMTP_USER,
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  };
}

function formatEmailText(payload) {
  return [
    'BotiCart Support Team,',
    '',
    'I would like to request deletion of my BotiCart account and associated personal data.',
    '',
    `Full name: ${payload.fullName}`,
    `Registered email: ${payload.emailAddress}`,
    `Username: ${payload.username || '—'}`,
    `Reason for deletion: ${payload.reason || '—'}`,
    `Requested data deletion scope: ${(payload.scopes || []).join(', ') || '—'}`,
    `Additional notes: ${payload.notes || '—'}`,
    '',
    'Please confirm the next steps and any identity verification requirements.',
    '',
    'Thank you.'
  ].join('\n');
}

function formatEmailHtml(payload) {
  const scopes = Array.isArray(payload.scopes) && payload.scopes.length > 0 ? payload.scopes : ['—'];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1c2b3a;">
      <h2 style="margin:0 0 16px;color:#1a6fa8;">Account Deletion Request</h2>
      <p>BotiCart Support Team,</p>
      <p>I would like to request deletion of my BotiCart account and associated personal data.</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Full name</td><td style="padding:6px 0;">${escapeHtml(payload.fullName)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Registered email</td><td style="padding:6px 0;">${escapeHtml(payload.emailAddress)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Username</td><td style="padding:6px 0;">${escapeHtml(payload.username || '—')}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Reason for deletion</td><td style="padding:6px 0;">${escapeHtml(payload.reason || '—')}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Requested scope</td><td style="padding:6px 0;">${escapeHtml(scopes.join(', '))}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#6b8299;">Additional notes</td><td style="padding:6px 0;">${escapeHtml(payload.notes || '—')}</td></tr>
      </table>
      <p>Please confirm the next steps and any identity verification requirements.</p>
      <p>Thank you.</p>
    </div>
  `;
}

app.post('/api/account-deletion', async (req, res) => {
  const payload = req.body || {};
  const requiredFields = ['subject', 'body', 'fullName', 'emailAddress', 'reason', 'scopes'];
  const missingField = requiredFields.find((field) => {
    const value = payload[field];
    return Array.isArray(value) ? value.length === 0 : !String(value || '').trim();
  });

  if (missingField) {
    return res.status(400).json({
      message: `Missing required field: ${missingField}`
    });
  }

  const mailConfig = createTransporter();

  try {
    await mailConfig.transporter.sendMail({
      from: mailConfig.from,
      to: supportEmail,
      replyTo: payload.emailAddress,
      subject: payload.subject,
      text: formatEmailText(payload),
      html: formatEmailHtml(payload)
    });

    return res.status(200).json({
      ok: true,
      message: 'Deletion request sent successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send deletion request email.',
      error: error.message
    });
  }
});

app.get('/health', function(_req, res) {
  res.json({ ok: true });
});

app.get('/account-deletion', (req, res) => {
  res.sendFile(path.join(__dirname, 'account-deletion.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.use((req, res) => {
  res.status(404).send('Not Found');
});


app.listen(port, function() {
  console.log(`BotiCart account deletion server running on http://localhost:${port}`);
});