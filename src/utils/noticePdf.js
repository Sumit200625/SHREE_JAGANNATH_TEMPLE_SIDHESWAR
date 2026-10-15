// Builds a real PDF file of a notice in the browser (works for English, Odia and Hindi text)
// and downloads it. The PDF libraries are loaded only when the button is clicked.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function generateNoticePdf({ id, title, content, category, publishDate, expiryDate }, contact = {}) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  const node = document.createElement('div');
  node.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;padding:56px 56px 48px;background:#ffffff;color:#2b1a10;' +
    "font-family:'Inter','Noto Sans Oriya','Noto Sans Devanagari','Nirmala UI',system-ui,sans-serif;box-sizing:border-box;";
  node.innerHTML = `
    <div style="text-align:center;border-bottom:3px solid #e35f24;padding-bottom:16px;margin-bottom:24px">
      <div style="font-size:26px;font-weight:800;color:#7a0f0f">Shree Jagannath Temple Sidheswar</div>
      <div style="font-size:13px;color:#a15c32;margin-top:4px">Sidhaswar, Ganjam, Odisha &nbsp;|&nbsp; Official Temple Notice</div>
    </div>
    <div style="font-size:12px;color:#8a6a50;margin-bottom:14px">
      <span style="background:#fbe9dc;color:#c2410c;padding:3px 10px;border-radius:999px;font-weight:700">${esc(String(category || 'general').toUpperCase())}</span>
      &nbsp; Published: ${esc(publishDate || '-')} &nbsp;|&nbsp; Valid till: ${esc(expiryDate || '-')}
    </div>
    <div style="font-size:22px;font-weight:800;line-height:1.35;margin-bottom:16px">${esc(title)}</div>
    <div style="font-size:15px;line-height:1.75;white-space:pre-wrap">${esc(content)}</div>
    <div style="margin-top:40px;border-top:1px solid #eadcc9;padding-top:12px;font-size:11px;color:#8a6a50">
      ${contact.phone ? 'Phone / WhatsApp: ' + esc(contact.phone) + ' &nbsp;|&nbsp; ' : ''}${contact.email ? 'Email: ' + esc(contact.email) : ''}<br>
      Notice ID: ${esc(id)}
    </div>`;
  document.body.appendChild(node);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    const img = canvas.toDataURL('image/jpeg', 0.92);
    let left = imgH;
    let y = 0;
    pdf.addImage(img, 'JPEG', 0, y, pageW, imgH);
    left -= pageH;
    while (left > 0) {
      y -= pageH;
      pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, y, pageW, imgH);
      left -= pageH;
    }
    pdf.save(`temple-notice-${String(id).slice(-8)}.pdf`);
  } finally {
    document.body.removeChild(node);
  }
}
