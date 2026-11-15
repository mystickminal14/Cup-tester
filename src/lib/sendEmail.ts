import { event } from '../data/event'

/**
 * One EmailJS template for every form on the site (the free plan has one).
 * The site builds the email HTML itself and the template just prints it:
 *
 *   Subject:  {{subject}}
 *   Reply To: {{reply_to}}
 *   Content:  {{{content_html}}}   ← three braces = insert as HTML
 */

const ejs = event.registration.emailjs

export const emailReady = Boolean(ejs.serviceId && ejs.templateId && ejs.publicKey)

export type EmailRow = [label: string, value: string]
export type EmailSection = { title: string; rows: EmailRow[] }

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const cell = 'padding:7px 6px;border-bottom:1px solid #eadfcd;vertical-align:top;'

function buildHtml(heading: string, sections: EmailSection[], photoUrl?: string, footer?: string) {
  const tables = sections
    .map(
      (s) => `
      <p style="margin:18px 0 6px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a0522d;">${esc(s.title)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${s.rows
          .map(
            ([k, v]) =>
              `<tr><td style="${cell}width:40%;color:#7a6a5a;">${esc(k)}</td><td style="${cell}white-space:pre-line;">${esc(v || '—')}</td></tr>`,
          )
          .join('')}
      </table>`,
    )
    .join('')

  const photo = photoUrl
    ? `<p style="margin:18px 0 6px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a0522d;">Photo</p>
       <a href="${esc(photoUrl)}"><img src="${esc(photoUrl)}" alt="Photo" width="160" style="display:block;max-width:160px;border-radius:4px;"></a>
       <a href="${esc(photoUrl)}" style="color:#a0522d;font-size:12px;">Open full-size photo</a>`
    : ''

  return `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4ede1;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fcf6ec;border:1px solid #e3d6c2;border-radius:4px;overflow:hidden;">
    <div style="background:#2b1a0e;color:#f4ede1;padding:22px 26px;">
      <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c98a4b;">Cup Tasters Championship Nepal</p>
      <h1 style="margin:8px 0 0;font-size:21px;">${esc(heading)}</h1>
    </div>
    <div style="padding:6px 26px 22px;color:#1f130a;font-size:14px;line-height:1.5;">
      ${tables}
      ${photo}
      <p style="margin:18px 0 0;font-size:12px;color:#7a6a5a;">Submitted ${esc(
        new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu' }),
      )} (NPT)${footer ? ' · ' + esc(footer) : ''}</p>
    </div>
  </div>
</div>`
}

/** Sends one email through the shared template. Throws on failure. */
export async function sendEmail(opts: {
  subject: string
  heading: string
  replyTo?: string
  sections: EmailSection[]
  photoUrl?: string
  footer?: string
}) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: ejs.serviceId,
      template_id: ejs.templateId,
      user_id: ejs.publicKey,
      template_params: {
        subject: opts.subject,
        reply_to: opts.replyTo ?? '',
        content_html: buildHtml(opts.heading, opts.sections, opts.photoUrl, opts.footer),
      },
    }),
  })
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`)
}
