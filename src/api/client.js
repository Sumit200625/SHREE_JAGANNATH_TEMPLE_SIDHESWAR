// Real API client (replaces the old localStorage mockApi). Same method names, so pages keep working.
async function call(path, { method = 'GET', body, raw, headers } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: raw ? headers : { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: raw ? raw : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

// Compress big phone photos in the browser so they fit the 4.5 MB upload limit
async function shrinkImage(file, maxSide = 1800, quality = 0.85) {
  if (file.size < 1_500_000 && file.type !== 'image/png') return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
  return blob || file;
}

let razorpayLoading;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  razorpayLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    s.onerror = () => { razorpayLoading = null; reject(new Error('Could not load the payment window. Check your internet connection.')); };
    document.body.appendChild(s);
  });
  return razorpayLoading;
}

// Opens Razorpay (UPI / cards / netbanking). Resolves with { type, record } only after the SERVER verified the payment.
async function pay(orderInput, prefill = {}) {
  const order = await call('/payments/order', { method: 'POST', body: orderInput });
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'Sidheswar Shree Jagannath Temple',
      description: orderInput.type === 'seva' ? 'Seva booking' : 'Temple donation',
      theme: { color: '#e35f24' },
      prefill: { name: prefill.name || '', email: prefill.email || '', contact: prefill.phone || '' },
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
      handler: async (r) => {
        try { resolve(await call('/payments/verify', { method: 'POST', body: r })); }
        catch (e) { reject(e); }
      },
    });
    rz.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed. No money was deducted.')));
    rz.open();
  });
}

export const api = {
  config: () => call('/config'),

  // auth
  googleLogin: (credential) => call('/account/google', { method: 'POST', body: { credential } }),
  register: (body) => call('/account/register', { method: 'POST', body }),
  login: (body) => call('/account/login', { method: 'POST', body }),
  logout: () => call('/account/logout', { method: 'POST' }),
  me: () => call('/account/me'),
  updateProfile: (body) => call('/account/profile', { method: 'PATCH', body }),

  // content
  getNotices: () => call('/notices'),
  createNotice: (body) => call('/notices', { method: 'POST', body }),
  updateNotice: (id, body) => call(`/notices/${id}`, { method: 'PATCH', body }),
  deleteNotice: (id) => call(`/notices/${id}`, { method: 'DELETE' }),
  getFestivals: () => call('/festivals'),
  getFAQs: () => call('/faqs'),
  addFAQ: (body) => call('/faqs', { method: 'POST', body }),
  deleteFAQ: (id) => call(`/faqs/${id}`, { method: 'DELETE' }),

  // gallery
  getGallery: ({ all = false } = {}) => call(`/gallery${all ? '?all=1' : ''}`),
  uploadImage: async (file) => {
    const f = await shrinkImage(file);
    const type = f.type || 'image/jpeg';
    return call('/upload', { method: 'POST', raw: f, headers: { 'Content-Type': type } });
  },
  addGalleryItem: (body) => call('/gallery', { method: 'POST', body }),
  approveGalleryItem: (id) => call(`/gallery/${id}/approve`, { method: 'POST' }),
  deleteGalleryItem: (id) => call(`/gallery/${id}`, { method: 'DELETE' }),

  // payments
  payDonation: (donor, amount) => pay({ type: 'donation', amount, donor }, { name: donor.donorName, email: donor.email, phone: donor.phone }),
  paySeva: (booking) => pay({ type: 'seva', booking }, { name: booking.devoteeName, email: booking.email, phone: booking.phone }),

  // donations / sevas
  getPublicDonations: () => call('/donations?scope=public'),
  getMyDonations: () => call('/donations?scope=mine'),
  getDonations: () => call('/donations'),
  getMySevas: () => call('/sevas?scope=mine'),
  trackSeva: (ref) => call(`/sevas?scope=track&ref=${encodeURIComponent(ref)}`),
  getSevas: () => call('/sevas'),
  updateSevaStatus: (id, approvalStatus, rejectionReason) => call(`/sevas/${id}`, { method: 'PATCH', body: { approvalStatus, rejectionReason } }),

  // tickets & admin
  submitTicket: (body) => call('/tickets', { method: 'POST', body }),
  getTickets: () => call('/tickets'),
  updateTicketStatus: (id, status, notes) => call(`/tickets/${id}`, { method: 'PATCH', body: { status, notes } }),
  getAuditLogs: () => call('/audit'),
  getAnalytics: () => call('/analytics'),
  backupDatabase: async () => {
    const data = await call('/backup');
    return {
      filename: `temple_db_backup_${new Date().toISOString().slice(0, 10)}.json`,
      dataUri: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`,
    };
  },
};

