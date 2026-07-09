// Simple static app (no build tools)
// Uses a single logo image from ./assets/

const TAGLINE = 'Polishing will always exist — for the few cars that can afford to lose clear coat. The rest of the world now has SkyGloss.';

// Single available asset (wordmark).
const LOGO_SRC = './assets/logo.png';
const BANNER_SRC = './assets/banner_with_text.png';
const SPOTLIGHT_IMG_SRC = './assets/main-image.png';
const FACTORY_SIG_SRC = './assets/factoryforever.png';
const SPOTLIGHT_BG_SRC = './assets/email-signature-bg.png';
const PUBLIC_ASSET_BASE = 'https://skygloss-signature-builder.netlify.app/';
const ICON_SRCS = {
  tel: './assets/icon-phone.svg',
  mobile: './assets/icon-mobile.svg',
  email: './assets/icon-email.svg',
  addr: './assets/icon-address.svg',
};

let layout = 7;
let opts = { tagline: true, taglineMode: 'image', hiring: false, demo: false };
let bg = 'white';
const assetDataUrlCache = new Map();

function g(id) { return document.getElementById(id); }
function v(id) { return g(id)?.value?.trim() || ''; }

function normalizeHttpUrl(value) {
  if (!value) return '';
  if (/^[a-z]+:/i.test(value)) return value;
  return `https://${value.replace(/^\/+/, '')}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function absoluteAssetUrl(src) {
  return new URL(src, PUBLIC_ASSET_BASE).href;
}

async function fetchAssetBlob(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to load asset: ${src}`);
    return await res.blob();
  } catch {
    const publicSrc = absoluteAssetUrl(src);
    const res = await fetch(publicSrc);
    if (!res.ok) throw new Error(`Failed to load asset: ${publicSrc}`);
    return await res.blob();
  }
}

async function assetToDataUrl(src) {
  if (assetDataUrlCache.has(src)) return assetDataUrlCache.get(src);
  const blob = await fetchAssetBlob(src);
  const dataUrl = src.toLowerCase().endsWith('.svg')
    ? await svgBlobToPngDataUrl(blob)
    : await blobToDataUrl(blob);
  assetDataUrlCache.set(src, dataUrl);
  return dataUrl;
}

function svgBlobToPngDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 14;
      canvas.height = img.naturalHeight || 14;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

async function buildClipboardHTML() {
  let html = g('sig_preview').innerHTML.trim();
  const assets = [...new Set([LOGO_SRC, ...Object.values(ICON_SRCS)])];

  for (const src of assets) {
    try {
      const dataUrl = await assetToDataUrl(src);
      html = html.replace(new RegExp(escapeRegExp(src), 'g'), dataUrl);
    } catch {
      html = html.replace(new RegExp(escapeRegExp(src), 'g'), absoluteAssetUrl(src));
    }
  }

  html = html.replace(new RegExp(escapeRegExp(BANNER_SRC), 'g'), absoluteAssetUrl(BANNER_SRC));
  html = html.replace(new RegExp(escapeRegExp(SPOTLIGHT_IMG_SRC), 'g'), absoluteAssetUrl(SPOTLIGHT_IMG_SRC));
  html = html.replace(new RegExp(escapeRegExp(FACTORY_SIG_SRC), 'g'), absoluteAssetUrl(FACTORY_SIG_SRC));
  html = html.replace(new RegExp(escapeRegExp(SPOTLIGHT_BG_SRC), 'g'), absoluteAssetUrl(SPOTLIGHT_BG_SRC));

  const root = document.createElement('div');
  root.innerHTML = html;
  return root.innerHTML.trim();
}

async function buildCompositeBannerDataUrl(width = 650) {
  const bgSrc = await assetToDataUrl(BANNER_SRC);
  const bgImg = await loadImage(bgSrc);
  const height = Math.round((bgImg.naturalHeight / bgImg.naturalWidth) * width);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bgImg, 0, 0, width, height);

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '400 26px Mulish, Arial, sans-serif';
  ctx.fillText('STOP POLISHING PAINT', 32, 24);

  ctx.fillStyle = '#11A3E6';
  ctx.font = 'italic 400 26px Mulish, Arial, sans-serif';
  ctx.fillText('START REBUILDING IT!', 32, 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '400 12px Mulish, Arial, sans-serif';
  ctx.fillText('An easier approach to modern paint correction.', 32, 100);

  return canvas.toDataURL('image/png');
}

function buildClipboardPlainText() {
  return (g('sig_preview')?.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
}

function copyRichHTMLFallback(html, plainText) {
  const host = document.createElement('div');
  host.contentEditable = 'true';
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0';
  host.style.opacity = '0';
  host.innerHTML = html;
  document.body.appendChild(host);

  const onCopy = (event) => {
    event.preventDefault();
    event.clipboardData.setData('text/html', html);
    event.clipboardData.setData('text/plain', plainText);
  };
  document.addEventListener('copy', onCopy, true);

  const range = document.createRange();
  range.selectNodeContents(host);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  const ok = document.execCommand('copy');
  selection.removeAllRanges();
  document.removeEventListener('copy', onCopy, true);
  document.body.removeChild(host);
  if (!ok) throw new Error('Copy command failed');
}

function svgDataUri(svg) {
  // Keep it readable and email-client friendly
  const cleaned = svg.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

function iconImg(svg, color, opts = {}) {
  const {
    width = 12,
    height = 12,
    marginRight = 6,
    verticalAlign = -2,
    opacity = 1,
  } = opts;
  const uri = svgDataUri(svg.replaceAll('currentColor', color));
  return `<img alt="" src="${uri}" width="${width}" height="${height}" style="display:inline-block;vertical-align:${verticalAlign}px;margin-right:${marginRight}px;opacity:${opacity}">`;
}

function icons(accent) {
  const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  return {
    tel: iconImg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path ${common} d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z"/></svg>`, accent),
    mobile: iconImg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect ${common} x="7" y="2" width="10" height="20" rx="2"/><path ${common} d="M11 18h2"/></svg>`, accent),
    email: iconImg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path ${common} d="M4 4h16v16H4z"/><path ${common} d="m4 6 8 7 8-7"/></svg>`, accent),
    web: iconImg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle ${common} cx="12" cy="12" r="10"/><path ${common} d="M2 12h20"/><path ${common} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, accent),
    addr: iconImg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path ${common} d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z"/><circle ${common} cx="12" cy="10" r="2.5"/></svg>`, accent),
  };
}

function businessCardIcons() {
  const opts = { width: 14, height: 14, marginRight: 0, verticalAlign: 0, opacity: 0.7 };
  const icon = (src, extra = {}) => {
    const width = extra.width ?? opts.width;
    const height = extra.height ?? opts.height;
    const marginRight = extra.marginRight ?? opts.marginRight;
    const verticalAlign = extra.verticalAlign ?? opts.verticalAlign;
    const opacity = extra.opacity ?? opts.opacity;
    return `<img alt="" src="${src}" width="${width}" height="${height}" style="display:inline-block;vertical-align:${verticalAlign}px;margin-right:${marginRight}px;opacity:${opacity};border:0">`;
  };
  return {
    tel: icon(ICON_SRCS.tel),
    mobile: icon(ICON_SRCS.mobile, { height: 15 }),
    email: icon(ICON_SRCS.email),
    addr: icon(ICON_SRCS.addr),
  };
}

function buildRows({ tel, mobile, email, website, address, bg, includeWebsite = true }) {
  const accent = (bg === 'dark') ? '#4cc3ff' : '#00a0df';
  const textCol = (bg === 'dark') ? '#e2e8f0' : '#4a5a6a';
  const linkCol = accent;
  const ic = icons(accent);
  const websiteHref = normalizeHttpUrl(website);

  const cellStyle = `padding:1.5px 0;color:${textCol};font-size:11px;font-family:Mulish,Arial,sans-serif;white-space:nowrap`;
  const cellStyleWrap = `padding:1.5px 0;color:${textCol};font-size:11px;font-family:Mulish,Arial,sans-serif`;
  const linkText = `color:${textCol};text-decoration:none`;
  const linkAccent = `color:${linkCol};text-decoration:none`;
  const addressPretty = (address || '').replace(/\s*,\s*The Netherlands\s*$/i, '<br/>The Netherlands');

  const rows = [
    tel ? `<tr><td style="${cellStyle}">${ic.tel}<a href="tel:${tel}" style="${linkText}">${tel}</a></td></tr>` : '',
    mobile ? `<tr><td style="${cellStyle}">${ic.mobile}<a href="tel:${mobile}" style="${linkText}">${mobile}</a></td></tr>` : '',
    email ? `<tr><td style="${cellStyle}">${ic.email}<a href="mailto:${email}" style="${linkAccent}">${email}</a></td></tr>` : '',
    (includeWebsite && website) ? `<tr><td style="${cellStyle}">${ic.web}<a href="${websiteHref}" style="${linkAccent}">${website.replace(/^https?:\/\//,'')}</a></td></tr>` : '',
    address ? `<tr><td style="${cellStyleWrap}">${ic.addr}${addressPretty}</td></tr>` : '',
  ].join('');

  return { rows, accent, textCol, linkCol };
}

function buildSig() {
  const raw = {
    name: v('f_name'),
    title: v('f_title'),
    company: v('f_company'),
    tel: v('f_tel'),
    mobile: v('f_mobile'),
    email: v('f_email'),
    website: v('f_website'),
    address: v('f_address'),
    demoUrl: v('f_demo'),
  };

  const allEmpty = Object.values(raw).every(val => !val);

  // If the user hasn't filled anything yet, show a complete example preview.
  const demo = {
    name: 'Neil Erickson',
    title: 'Regional Director',
    company: 'SkyGloss Global',
    tel: '+1 (602) 784-41134',
    mobile: '+1 (602) 784-4113‬',
    email: 'name@skygloss.com',
    website: 'https://skygloss.com',
    address: '8342 W Camelback Rd, STE 205 Scottsdale AZ 85251 United States',
    demoUrl: 'https://demo.skygloss.com',
  };

  const data = allEmpty ? demo : {
    name: raw.name || 'Your Name',
    title: raw.title || '',
    company: raw.company || 'SkyGloss',
    tel: raw.tel || '',
    mobile: raw.mobile || '',
    email: raw.email || '',
    website: raw.website || '',
    address: raw.address || '',
    demoUrl: raw.demoUrl || '#',
  };

  const { name, title, company, tel, mobile, email, website, address, demoUrl } = data;
  const websiteHref = normalizeHttpUrl(website);
  const demoHref = normalizeHttpUrl(demoUrl) || '#';

  const { accent } = buildRows({ tel, mobile, email, website, address, bg, includeWebsite: true });
  const { rows: employeeRowsNoWebsite } = buildRows({ tel, mobile, email, website, address, bg, includeWebsite: false });

  const hBadge = opts.hiring
    ? `<td style="padding:0;vertical-align:middle"><span style="background:${accent};color:#fff;font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:3px;white-space:nowrap;font-family:Mulish,Arial,sans-serif">🚀 We're Hiring</span></td>`
    : '';
  const dBadge = opts.demo
    ? `<td style="padding:0 0 0 7px;vertical-align:middle"><a href="${demoHref}" style="display:inline-block;border:1.5px solid ${accent};color:${accent};font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:3px;text-decoration:none;font-family:Mulish,Arial,sans-serif;white-space:nowrap">Book a Consultation →</a></td>`
    : '';
  const badgeCells = `${hBadge}${dBadge}`;
  const badges = (opts.hiring || opts.demo)
    ? `<tr><td style="padding-top:9px"><table cellpadding="0" cellspacing="0" border="0"><tr>${badgeCells}</tr></table></td></tr>`
    : '';
  const taglineInner = (opts.tagline && (opts.taglineMode || 'text') === 'text')
    ? `<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding-top:10px;border-top:1px solid #e0e8f0;font-size:9.5px;color:#a0aab4;font-style:italic;line-height:1.55;font-family:Mulish,Arial,sans-serif">${TAGLINE}</td></tr></table>`
    : '';

  const bannerImage = ({ width = 420 } = {}) => {
    if (!opts.tagline || (opts.taglineMode || 'text') !== 'image') return '';
    return `<a href="${websiteHref}" style="text-decoration:none;border:0;display:inline-block;line-height:0;font-size:0"><img src="${BANNER_SRC}" alt="" width="${width}" style="display:block;width:${width}px;height:auto;border:0"></a>`;
  };

  const companySide = ({ align = 'center', logoHeight = 34, logoMaxWidth = 220, websiteOnDark = false, logoSrc = LOGO_SRC, showWebsite = true }) => {
    const siteColor = websiteOnDark ? '#4cc3ff' : accent;
    const logoStyleExtra = align === 'center' ? 'margin:0 auto;' : '';
    const logoHtml = `<img src="${logoSrc}" alt="SkyGloss" style="display:block;${logoStyleExtra}height:${logoHeight}px;width:auto;max-width:${logoMaxWidth}px">`;
    const site = (showWebsite && website) ? `<div style="padding-top:8px;font-size:10.5px;font-family:Mulish,Arial,sans-serif;white-space:nowrap"><a href="${websiteHref}" style="color:${siteColor};text-decoration:none">${website.replace(/^https?:\/\//,'')}</a></div>` : '';
    return `<div style="text-align:${align}">${logoHtml}${site}</div>`;
  };

  const isTagImageAllowed = (layout === 1 || layout === 2 || layout === 3 || layout === 4);
  const tagModeEffective = ((opts.taglineMode || 'text') === 'image' && isTagImageAllowed) ? 'image' : 'text';

  // Layout numbering follows picker order:
  // 7 Spotlight (first in picker), 1 Showcase, 2 Ribbon, 3 Classic, 4 Banner, 5 Studio, 6 Split

  // Spotlight: bold two-panel banner — black identity panel + hero image.
  // Fixed design; extra fields (mobile, address, company, tagline, badges) are ignored.
  if (layout === 7) {
    const spotBlue = '#11a3e6';
    const spotFont = 'Muli, Mulish, Arial, sans-serif';
    const siteText = (website ? website.replace(/^https?:\/\//, '') : 'skygloss.com').toUpperCase();
    const linkStyle = `font-family:${spotFont};color:#ffffff;text-decoration:none`;
    const contactStyle = `font-size:9px;line-height:1.4;color:#ffffff;font-family:${spotFont};letter-spacing:.25em`;
    const contactRows = [
      tel ? `<div style="${contactStyle}"><a href="tel:${tel}" style="${linkStyle}">${tel}</a></div>` : '',
      email ? `<div style="${contactStyle}"><a href="mailto:${email}" style="${linkStyle}">${email.toUpperCase()}</a></div>` : '',
    ].join('');
    // Whole banner is 2.5:1 (1000:400 -> 600x240). The background image bakes in
    // the black left panel, the "Factory Forever" script and the hero photo; the
    // text below is overlaid on top of the black left panel (240px).
    const spotH = 240;
    return `<div style="position:relative;display:inline-block;width:600px;max-width:600px;background:#000000;line-height:0;font-size:0">
  <img src="${SPOTLIGHT_BG_SRC}" alt="SkyGloss" width="600" height="${spotH}" style="display:block;width:600px;height:${spotH}px;border:0">
  <table cellpadding="0" cellspacing="0" border="0" style="position:absolute;top:0;left:0;font-family:${spotFont};width:240px;border-collapse:collapse;table-layout:fixed">
  <tr>
    <td style="width:240px;height:${spotH}px;vertical-align:top;padding:26px 28px 22px 28px">
      <div style="font-size:12px;line-height:1.2;font-weight:800;color:${spotBlue};letter-spacing:.25em;text-transform:uppercase;font-family:${spotFont}">${siteText}</div>
      <div style="height:104px;line-height:104px;font-size:0">&nbsp;</div>
      <div style="font-size:10px;line-height:1.2;font-weight:800;color:#ffffff;letter-spacing:.25em;text-transform:uppercase;font-family:${spotFont}">${name}</div>
      ${title ? `<div style="padding-top:6px;font-size:10px;line-height:1.2;font-weight:800;color:${spotBlue};letter-spacing:.25em;text-transform:uppercase;font-family:${spotFont}">${title}</div>` : ''}
      ${contactRows ? `<div style="height:14px;line-height:14px;font-size:0">&nbsp;</div>${contactRows}` : ''}
    </td>
  </tr>
  </table>
</div>`;
  }

  if (layout === 3) return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Mulish,Arial,sans-serif">
  <tr>
    <td style="vertical-align:middle;padding-right:18px;border-right:2px solid ${accent}">
      ${companySide({ align: 'center', logoHeight: 38, logoMaxWidth: 160 })}
    </td>
    <td style="padding-left:18px;vertical-align:top">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:18px;font-weight:700;color:${accent};letter-spacing:.01em;padding-bottom:1px;font-family:Mulish,Arial,sans-serif">${name}</td></tr>
        ${title ? `<tr><td style="font-size:10.5px;color:#7a8ea3;text-transform:uppercase;letter-spacing:.09em;padding-bottom:8px;font-family:Mulish,Arial,sans-serif">${title}${company ? ' &middot; ' + company : ''}</td></tr>` : ''}
        ${employeeRowsNoWebsite ? `<tr><td><table cellpadding="0" cellspacing="0">${employeeRowsNoWebsite}</table></td></tr>` : ''}
        ${badges}
      </table>
    </td>
  </tr>
  ${tagModeEffective === 'image'
    ? `<tr><td colspan="2" style="padding-top:10px">${bannerImage({ width: 420 })}</td></tr>`
    : (taglineInner ? `<tr><td colspan="2" style="padding-top:10px">${taglineInner}</td></tr>` : '')}
</table>`;

  if (layout === 5) return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Mulish,Arial,sans-serif;max-width:620px">
  <tr>
    <td style="padding:0">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e7eef6;border-radius:10px;overflow:hidden">
        <tr>
          <td style="padding:16px 18px;vertical-align:middle;background:#f5fbff;border-right:1px solid #e7eef6;min-width:170px;text-align:center">
            ${companySide({ align: 'center', logoHeight: 28, logoMaxWidth: 210 })}
          </td>
          <td style="padding:16px 18px;vertical-align:top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-size:18px;font-weight:800;color:#1a2332;letter-spacing:-.01em;padding-bottom:2px;font-family:Mulish,Arial,sans-serif">${name}</td></tr>
              ${title ? `<tr><td style="font-size:10.5px;color:${accent};text-transform:uppercase;letter-spacing:.09em;padding-bottom:9px;font-family:Mulish,Arial,sans-serif">${title}${company ? ' &middot; ' + company : ''}</td></tr>` : ''}
              ${employeeRowsNoWebsite ? `<tr><td><table cellpadding="0" cellspacing="0">${employeeRowsNoWebsite}</table></td></tr>` : ''}
              ${badges}
            </table>
          </td>
        </tr>
        ${tagModeEffective === 'image'
          ? `<tr><td colspan="2" style="padding:0 18px 16px 18px">${bannerImage({ width: 420 })}</td></tr>`
          : (taglineInner ? `<tr><td colspan="2" style="padding:0 18px 16px 18px">${taglineInner}</td></tr>` : '')}
      </table>
    </td>
  </tr>
</table>`;

  if (layout === 4) {
    const employeeOnly = buildRows({ tel, mobile, email, website, address, bg, includeWebsite: false }).rows;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Mulish,Arial,sans-serif;width:420px;max-width:420px">
  <tr>
    <td style="width:200px;vertical-align:top;padding-right:16px;border-right:1px solid ${accent};color:#717171;line-height:18px">
      <div style="font-size:12pt;color:#000000;font-family:Mulish,Arial,sans-serif;font-weight:700">${name}</div>
      ${title ? `<div style="font-size:9pt;color:#717171;font-family:Mulish,Arial,sans-serif;padding-top:2px">${title}${company ? ' &middot; ' + company : ''}</div>` : ''}
      <div style="padding-top:14px">${companySide({ align: 'left', logoHeight: 22, logoMaxWidth: 170 })}</div>
    </td>
    <td style="width:220px;vertical-align:top;padding-left:18px;line-height:18px">
      ${employeeOnly ? `<table cellpadding="0" cellspacing="0" border="0">${employeeOnly}</table>` : ''}
      ${badges ? `<div style="padding-top:6px">${badges.replaceAll('<tr>','').replaceAll('</tr>','').replaceAll('<td','<div').replaceAll('</td>','</div>')}</div>` : ''}
    </td>
  </tr>
  ${tagModeEffective === 'image'
    ? `<tr><td colspan="2" style="padding-top:16px">${bannerImage({ width: 420 })}</td></tr>`
    : (taglineInner ? `<tr><td colspan="2" style="padding-top:16px">${taglineInner}</td></tr>` : '')}
</table>`;
  }

  if (layout === 2) {
    const employeeOnly = buildRows({ tel, mobile, email, website, address, bg, includeWebsite: false }).rows;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Mulish,Arial,sans-serif;width:420px;max-width:420px">
  <tr><td colspan="2" style="font-size:14px;line-height:14px;height:14px">&nbsp;</td></tr>
  <tr><td colspan="2" style="font-size:14px;line-height:14px;height:14px;border-top:1px solid ${accent}">&nbsp;</td></tr>
  <tr>
    <td style="width:200px;vertical-align:top;padding-right:10px;padding-bottom:10px">
      <div style="margin:0;line-height:1.05">
        <div style="font-size:12pt;color:${accent};font-family:Mulish,Arial,sans-serif;font-weight:800;line-height:18pt">${name}</div>
        ${title ? `<div style="font-size:9pt;color:#010100;font-family:Mulish,Arial,sans-serif;line-height:14pt">${title}${company ? ' &middot; ' + company : ''}</div>` : ''}
      </div>
      <div style="padding-top:12px">${companySide({ align: 'left', logoHeight: 24, logoMaxWidth: 160, showWebsite: false })}</div>
    </td>
    <td style="padding-left:20px;padding-bottom:6px;vertical-align:top;line-height:18px">
      ${employeeOnly ? `<table cellpadding="0" cellspacing="0" border="0">${employeeOnly}</table>` : ''}
    </td>
  </tr>
  ${tagModeEffective === 'image'
    ? `<tr><td colspan="2" style="padding-bottom:14px">${bannerImage({ width: 420 })}</td></tr>`
    : (taglineInner ? `<tr><td colspan="2" style="padding-bottom:14px">${taglineInner}</td></tr>` : '')}
  <tr>
    <td style="vertical-align:top;border-top:1px solid ${accent};padding-top:12px">
      ${website ? `<a href="${websiteHref}" style="font-size:9pt;font-family:Mulish,Arial,sans-serif;text-decoration:none;color:${accent};font-weight:700">${website.replace(/^https?:\/\//,'')}</a>` : ''}
    </td>
    <td style="vertical-align:top;border-top:1px solid ${accent};padding-top:12px;text-align:right">
      ${badges ? `<table cellpadding="0" cellspacing="0" border="0" style="float:right"><tr>${hBadge}${dBadge}</tr></table>` : ''}
    </td>
  </tr>
</table>`;
  }

  // layout 2 (Split)
  if (layout === 6) return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Mulish,Arial,sans-serif;max-width:580px;border-top:3px solid ${accent};background:#ffffff">
  <tr>
    <td style="padding:16px 22px;vertical-align:top;border-right:2px solid #e0e8f0">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:19px;font-weight:700;color:#1a2332;padding-bottom:2px;font-family:Mulish,Arial,sans-serif">${name}</td></tr>
        ${title ? `<tr><td style="font-size:10.5px;color:${accent};text-transform:uppercase;letter-spacing:.09em;padding-bottom:9px;font-family:Mulish,Arial,sans-serif">${title}${company ? ' &middot; ' + company : ''}</td></tr>` : ''}
        ${employeeRowsNoWebsite ? `<tr><td><table cellpadding="0" cellspacing="0">${employeeRowsNoWebsite}</table></td></tr>` : ''}
        ${badges}
      </table>
    </td>
    <td style="padding:16px 22px;vertical-align:middle;text-align:center">
      ${companySide({ align: 'center', logoHeight: 34, logoMaxWidth: 220 })}
    </td>
  </tr>
  ${tagModeEffective === 'image'
    ? `<tr><td colspan="2" style="padding:0 22px 16px 22px">${bannerImage({ width: 420 })}</td></tr>`
    : (taglineInner ? `<tr><td colspan="2" style="padding:0 22px 16px 22px">${taglineInner}</td></tr>` : '')}
</table>`;

  if (layout === 1) {
    const bc = businessCardIcons();
    const contactCell = 'padding:0 0 10px 0';
    const contactCellWrap = 'padding:0';
    const iconCell = 'width:22px;padding:0 10px 0 0;vertical-align:top;line-height:0';
    const textCell = 'font-size:12px;line-height:1.45;color:#6F6F6F;font-family:Mulish,Arial,sans-serif;padding:0;vertical-align:top';
    const contactLink = 'color:#6F6F6F;text-decoration:none';
    const showcaseAddress = (address || '').replace(/\s*,\s*The Netherlands\s*$/i, ',<br>The Netherlands');
    const showcaseRows = [
      tel ? `<tr><td style="${contactCell}"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="${iconCell}">${bc.tel}</td><td style="${textCell};white-space:nowrap"><a href="tel:${tel}" style="${contactLink}">${tel}</a></td></tr></table></td></tr>` : '',
      mobile ? `<tr><td style="${contactCell}"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="${iconCell}">${bc.mobile}</td><td style="${textCell};white-space:nowrap"><a href="tel:${mobile}" style="${contactLink}">${mobile}</a></td></tr></table></td></tr>` : '',
      email ? `<tr><td style="${contactCell}"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="${iconCell}">${bc.email}</td><td style="${textCell};white-space:nowrap"><a href="mailto:${email}" style="${contactLink}">${email}</a></td></tr></table></td></tr>` : '',
      address ? `<tr><td style="${contactCellWrap}"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="${iconCell}">${bc.addr}</td><td style="${textCell}"><span>${showcaseAddress}</span></td></tr></table></td></tr>` : '',
    ].join('');
    const contact = showcaseRows ? `<table cellpadding="0" cellspacing="0" border="0">${showcaseRows}</table>` : '';
    const contactBlock = (contact || badgeCells)
      ? `<table cellpadding="0" cellspacing="0" border="0">${contact ? `<tr><td>${contact}</td></tr>` : ''}${badgeCells ? `<tr><td style="padding-top:12px"><table cellpadding="0" cellspacing="0" border="0"><tr>${badgeCells}</tr></table></td></tr>` : ''}</table>`
      : '';
    const site = website ? website.replace(/^https?:\/\//, '') : '';
    const titleLine = [title, company].filter(Boolean);
    const titleHtml = titleLine.length === 2
      ? `${titleLine[0]} <span style="color:#B7B7B7;padding:0 8px">|</span> ${titleLine[1]}`
      : (titleLine[0] || '');
    const showcaseTagline = opts.tagline
      ? (tagModeEffective === 'image'
        ? `<tr><td style="padding-top:24px">${bannerImage({ width: 650, overlayText: true })}</td></tr>`
        : `<tr><td style="padding-top:24px"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#476d8f"><tr><td style="padding:28px 42px;color:#ffffff;font-family:Mulish,Arial,sans-serif"><div style="font-size:26px;line-height:1.2;font-weight:600;text-transform:uppercase;letter-spacing:.02em;font-family:Mulish,Arial,sans-serif">Stop polishing paint<br>start rebuilding it!</div><div style="padding-top:5px;font-size:12px;line-height:1.5;color:#ffffff;font-family:Mulish,Arial,sans-serif;opacity:.9">An easier approach to modern paint correction.</div></td></tr></table></td></tr>`)
      : '';
    return `<table cellpadding="0" cellspacing="0" border="0" width="650" style="font-family:Mulish,Arial,sans-serif;width:650px;min-width:650px;max-width:650px;border-collapse:collapse;table-layout:fixed">
  <tr>
    <td style="padding:14px 0 0 0">
      <div style="font-size:24px;line-height:1.25;color:#232323;font-weight:500;font-family:Mulish,Arial,sans-serif">${name}</div>
      ${titleHtml ? `<div style="padding-top:6px;font-size:12px;line-height:1.4;color:#6F6F6F;font-family:Mulish,Arial,sans-serif">${titleHtml}</div>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding:16px 0 0 0">
      <div style="height:1px;background:#B7B7B7;font-size:0;line-height:0">&nbsp;</div>
    </td>
  </tr>
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:48%;vertical-align:middle;padding:28px 18px 0 0;text-align:center">
            <div style="display:inline-block;text-align:left">
              <img src="${LOGO_SRC}" alt="SkyGloss" style="display:block;height:44px;width:auto;max-width:160px;border:0">
              ${site ? `<div style="padding-top:4px;font-size:11px;line-height:1.35;color:#6F6F6F;font-family:Mulish,Arial,sans-serif"><a href="${websiteHref}" style="color:#6F6F6F;text-decoration:none">${site}</a></div>` : ''}
            </div>
          </td>
          <td style="width:52%;vertical-align:top;padding:16px 0 0 10px">
            ${contactBlock}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${showcaseTagline}
</table>`;
  }

  // Fallback (shouldn't happen)
  return '';
}

function render() {
  const html = buildSig();
  g('sig_preview').innerHTML = html;
  g('html_out').value = html.replace(/\n\s*/g, ' ').trim();
}

async function copyHTML() {
  const plainText = buildClipboardPlainText();
  let html = g('sig_preview').innerHTML.trim();

  try {
    html = await buildClipboardHTML();
  } catch {
    html = html
      .replace(new RegExp(escapeRegExp(LOGO_SRC), 'g'), absoluteAssetUrl(LOGO_SRC))
      .replace(new RegExp(escapeRegExp(BANNER_SRC), 'g'), absoluteAssetUrl(BANNER_SRC))
      .replace(new RegExp(escapeRegExp(SPOTLIGHT_IMG_SRC), 'g'), absoluteAssetUrl(SPOTLIGHT_IMG_SRC))
      .replace(new RegExp(escapeRegExp(FACTORY_SIG_SRC), 'g'), absoluteAssetUrl(FACTORY_SIG_SRC))
      .replace(new RegExp(escapeRegExp(SPOTLIGHT_BG_SRC), 'g'), absoluteAssetUrl(SPOTLIGHT_BG_SRC));
    Object.values(ICON_SRCS).forEach((src) => {
      html = html.replace(new RegExp(escapeRegExp(src), 'g'), absoluteAssetUrl(src));
    });
  }

  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
    } else {
      copyRichHTMLFallback(html, plainText);
    }
  } catch {
    try {
      copyRichHTMLFallback(html, plainText);
    } catch {
      const ta = g('html_out');
      ta.focus();
      ta.select();
      document.execCommand('copy');
    }
  }
  const t = g('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function downloadHTML() {
  const sig = g('html_out').value;
  const full = `<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>SkyGloss Signature</title></head>\n<body style="margin:32px;background:#f4f7fa;font-family:Mulish,Arial,sans-serif">\n<p style="font-size:11px;color:#999;margin-bottom:20px;font-family:Mulish,Arial,sans-serif">SkyGloss Email Signature — copy the HTML below into your email client signature settings.</p>\n${sig}\n</body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([full], { type: 'text/html' }));
  a.download = 'skygloss-signature.html';
  a.click();
}

function setLayout(n) {
  layout = n;
  [1, 2, 3, 4, 5, 6, 7].forEach(i => g(`lopt_${i}`)?.classList.toggle('sel', i === n));
  applyTaglineModeAvailability();
  render();
}

function setBg(b) {
  bg = b;
  g('prev_stage').className = `prev-stage bg-${b}`;
  document.querySelectorAll('.bg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === b);
  });
  render();
}

function toggleOpt(k) {
  opts[k] = !opts[k];
  g(`tog_${k}`)?.classList.toggle('on', opts[k]);
  if (k === 'demo') g('sub_demo')?.classList.toggle('open', opts[k]);
  if (k === 'tagline') g('sub_tagline')?.classList.toggle('open', opts[k]);
  render();
}

function setTaglineMode(mode) {
  opts.taglineMode = (mode === 'image') ? 'image' : 'text';
  document.querySelectorAll('[data-tagmode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tagmode === opts.taglineMode);
  });
  render();
}

function applyTaglineModeAvailability() {
  const allowImage = (layout === 1 || layout === 2 || layout === 3 || layout === 4);
  const imageBtn = document.querySelector('[data-tagmode="image"]');
  if (imageBtn) imageBtn.disabled = !allowImage;

  if (!allowImage) opts.taglineMode = 'text';

  document.querySelectorAll('[data-tagmode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tagmode === (opts.taglineMode || 'text'));
  });
}

function init() {
  // Set the single logo file everywhere (header)
  const hdr = g('hdr_logo');
  if (hdr) hdr.src = LOGO_SRC;

  // Ensure a preview is visible immediately on load
  layout = 7;
  opts = { tagline: true, taglineMode: 'image', hiring: false, demo: false };
  bg = 'white';

  // Reflect defaults in UI
  [1, 2, 3, 4, 5, 6, 7].forEach(i => g(`lopt_${i}`)?.classList.toggle('sel', i === 7));
  document.querySelectorAll('.bg-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.bg === 'white'));
  g('tog_tagline')?.classList.add('on');
  ['hiring', 'demo'].forEach(k => g(`tog_${k}`)?.classList.remove('on'));
  g('sub_demo')?.classList.remove('open');
  g('sub_tagline')?.classList.add('open');
  applyTaglineModeAvailability();

  // Inputs
  document.querySelectorAll('input').forEach(inp => inp.addEventListener('input', render));
  const out = g('html_out');
  if (out) out.addEventListener('click', () => out.select());

  // Layout picker
  document.querySelectorAll('[data-layout]').forEach(el => {
    el.addEventListener('click', () => setLayout(Number(el.dataset.layout)));
  });

  // Theme buttons
  document.querySelectorAll('[data-bg]').forEach(el => {
    el.addEventListener('click', () => setBg(el.dataset.bg));
  });

  // Toggles
  document.querySelectorAll('[data-opt]').forEach(el => {
    el.addEventListener('click', () => toggleOpt(el.dataset.opt));
  });

  // Tagline mode
  document.querySelectorAll('[data-tagmode]').forEach(el => {
    el.addEventListener('click', () => setTaglineMode(el.dataset.tagmode));
  });

  // Actions
  g('btn_copy')?.addEventListener('click', copyHTML);
  g('btn_download')?.addEventListener('click', downloadHTML);

  render();
}

init();




