import { Router } from 'express';
import transporter from '../services/email';
import { storeMagicToken, verifyMagicLink } from '../services/authService';
import crypto from 'crypto';

const router = Router();

router.post('/magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const token = crypto.randomBytes(20).toString('hex');
  storeMagicToken(email, token);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const link = `${clientUrl}/auth?token=${token}`;

  try {
    await transporter.sendMail({
      from: 'no-reply@warren-demo.local',
      to: email,
      subject: 'Your magic link for Warren Demo',
      text: `Click here to sign in: ${link}`,
      html: `<p>Click here to sign in: <a href="${link}">${link}</a></p>`
    });
    res.json({ message: 'Magic link sent' });
  } catch (error) {
    console.error('Error sending magic link email', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  try {
    const jwt = verifyMagicLink(token);
    res.json({ jwt });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

export default router;
