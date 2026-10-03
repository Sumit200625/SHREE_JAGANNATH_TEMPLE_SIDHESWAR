# Sidheswar Shree Jagannath Temple – production setup

1. **Database**: Vercel → Storage → Create **Neon (Postgres)** → connect to project (adds `DATABASE_URL`). Tables + initial content are created automatically on first request.
2. **Image storage**: Vercel → Storage → Create **Blob** → connect (adds `BLOB_READ_WRITE_TOKEN`).
3. **Google login**: console.cloud.google.com → APIs & Services → Credentials → *OAuth client ID* → type **Web application** → Authorized JavaScript origins: `https://<your-domain>` (and `http://localhost:3000` for dev). Put the client ID in `GOOGLE_CLIENT_ID`. Configure the OAuth consent screen and *Publish* it (otherwise only test users can sign in).
4. **Admin access**: set `ADMIN_EMAILS` to the head admin's Google email. Other staff: `STAFF_ROLES`.
5. **Payments (Razorpay)**: create a Razorpay account in the Temple Trust's name (KYC needed), set `RAZORPAY_KEY_ID/SECRET`.
   Webhook: Razorpay Dashboard → Webhooks → URL `https://<your-domain>/api/payments/webhook`, events `payment.captured` + `order.paid`, secret = `RAZORPAY_WEBHOOK_SECRET`.
6. `JWT_SECRET`: `openssl rand -base64 48`.
7. Redeploy. Local dev: `npm i -g vercel && npm i && vercel dev` (needs the env vars via `vercel env pull`).
