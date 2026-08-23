const ORIGIN = 'https://restaurant-guest-revival.charitylovesai.chatgpt.site';
const STRIPE_URL = 'https://buy.stripe.com/4gM7sL9PP7v2g7AfLa1ZS08';

function injectionScript() {
  return `
<script>
(function(){
  const STRIPE_URL = ${JSON.stringify(STRIPE_URL)};

  function textOf(el){ return (el.innerText || el.textContent || '').trim(); }

  function wireStripeLinks(){
    document.querySelectorAll('a').forEach(a => {
      const t = textOf(a);
      if (/\$\s*297|297\s*\/\s*month|start my guest revival/i.test(t)) {
        a.href = STRIPE_URL;
        a.target = '_self';
      }
    });
  }

  function inferValue(form, patterns){
    const fields = [...form.querySelectorAll('input,select,textarea')];
    for (const el of fields){
      const hay = [el.name, el.id, el.placeholder, el.getAttribute('aria-label')].filter(Boolean).join(' ').toLowerCase();
      if (patterns.some(p => p.test(hay)) && el.value) return el.value;
    }
    return '';
  }

  function inferConsent(form){
    const checks = [...form.querySelectorAll('input[type="checkbox"]')];
    return checks.some(el => {
      const hay = [el.name, el.id, el.value, el.getAttribute('aria-label')].filter(Boolean).join(' ').toLowerCase();
      return el.checked && /sms|text|consent|message/.test(hay);
    });
  }

  document.addEventListener('submit', function(e){
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const fullName = inferValue(form, [/full.?name/, /your.?name/]);
    let first = inferValue(form, [/first.?name/, /^first$/]);
    let last = inferValue(form, [/last.?name/, /surname/]);
    if (!first && fullName) {
      const parts = fullName.trim().split(/\s+/);
      first = parts.shift() || '';
      last = parts.join(' ');
    }

    const payload = {
      first_name: first,
      last_name: last,
      email: inferValue(form, [/email/]),
      phone: inferValue(form, [/phone/, /mobile/, /cell/]),
      business_name: inferValue(form, [/restaurant/, /business/, /company/]),
      selected_offer: inferValue(form, [/offer/, /priority/, /automation/]),
      sms_consent: inferConsent(form),
      source: 'Restaurant Convention 2026'
    };

    if (payload.email || payload.phone) {
      fetch('/api/lead', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(){});
    }
  }, true);

  wireStripeLinks();
  new MutationObserver(wireStripeLinks).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Preserve the existing Pages Function that securely relays leads to GHL.
  if (url.pathname === '/api/lead' || url.pathname.startsWith('/api/lead/')) {
    return context.next();
  }

  const upstream = new URL(url.pathname + url.search, ORIGIN);
  const init = {
    method: context.request.method,
    headers: new Headers(context.request.headers),
    redirect: 'follow'
  };
  init.headers.set('host', new URL(ORIGIN).host);
  init.headers.delete('cf-connecting-ip');
  init.headers.delete('cf-ipcountry');

  if (!['GET','HEAD'].includes(context.request.method)) {
    init.body = context.request.body;
  }

  const res = await fetch(upstream.toString(), init);
  const type = res.headers.get('content-type') || '';

  if (!type.includes('text/html')) {
    return res;
  }

  let html = await res.text();
  const inject = `<base href="${ORIGIN}/">` + injectionScript();
  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, inject + '</body>');
  else html += inject;

  const headers = new Headers(res.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('content-security-policy');
  headers.delete('content-security-policy-report-only');
  headers.delete('x-frame-options');
  headers.set('cache-control','no-store, max-age=0');
  headers.set('content-type','text/html; charset=UTF-8');

  return new Response(html, {status: res.status, statusText: res.statusText, headers});
}
