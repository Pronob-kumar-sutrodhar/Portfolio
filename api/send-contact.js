/* Vercel Serverless Function: /api/send-contact
   Uses SendGrid to forward contact form submissions.

   Environment variables required:
   - SENDGRID_API_KEY
   - CONTACT_TO_EMAIL
*/

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 10; // max requests per window per IP
const rateMap = new Map(); // simple in-memory rate limiter (resets on cold-start)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, message, hp } = req.body || {};

  // Basic spam prevention
  if (hp) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

  if (!SENDGRID_API_KEY || !CONTACT_TO_EMAIL) {
    return res.status(500).json({ error: 'Email service not configured. Set SENDGRID_API_KEY and CONTACT_TO_EMAIL.' });
  }

  // Simple rate limiting per IP
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const prev = rateMap.get(ip) || [];
  const recent = prev.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  recent.push(now);
  rateMap.set(ip, recent);
  if (recent.length > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const payload = {
      personalizations: [{ to: [{ email: CONTACT_TO_EMAIL }] }],
      from: { email: CONTACT_TO_EMAIL },
      subject: `Portfolio contact from ${name}`,
      content: [{ type: 'text/plain', value: `Name: ${name}\nEmail: ${email}\n\n${message}` }]
    };

    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('SendGrid error', r.status, text);
      return res.status(502).json({ error: 'Email service error' });
    }

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('send-contact error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
