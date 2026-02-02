# SendGrid / Vercel Setup

This project includes a Vercel serverless function at `/api/send-contact` which forwards contact form submissions to your email using SendGrid.

Steps to enable:

1. Create a SendGrid account (https://sendgrid.com/) and obtain an API key with `Mail Send` permissions.
2. In the Vercel dashboard for this project, add the following environment variables:
   - `SENDGRID_API_KEY` — the SendGrid API key
   - `CONTACT_TO_EMAIL` — the email address that should receive contact messages (e.g. `kpronob74@gmail.com`)
3. Deploy the project to Vercel. The serverless function will be available at `/api/send-contact`.

Local testing (optional):
- Use `vercel dev` and set the variables in a local `.env.local` file (copy `.env.example` to `.env.local` and fill the values).

Security notes:
- Do NOT commit your real `SENDGRID_API_KEY` to source control.
- Consider adding a CAPTCHA or other anti-spam protections if you see automated abuse.
