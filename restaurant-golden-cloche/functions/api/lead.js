export async function onRequestPost({ request, env }) {
  if (!env.GHL_WEBHOOK_URL) {
    return Response.json({ error: 'Missing server configuration' }, { status: 500 });
  }

  const destination = new URL(env.GHL_WEBHOOK_URL);
  if (destination.protocol !== 'https:' || destination.hostname !== 'services.leadconnectorhq.com') {
    return Response.json({ error: 'Invalid webhook destination' }, { status: 500 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const payload = {
    first_name: String(input.first_name || '').slice(0, 100),
    last_name: String(input.last_name || '').slice(0, 100),
    email: String(input.email || '').slice(0, 254),
    phone: String(input.phone || '').slice(0, 50),
    business_name: String(input.business_name || '').slice(0, 160),
    selected_offer: String(input.selected_offer || '').slice(0, 160),
    sms_consent: input.sms_consent === true,
    source: 'Restaurant Convention 2026'
  };

  if (!payload.email && !payload.phone) {
    return Response.json({ error: 'Email or phone required' }, { status: 400 });
  }

  const upstream = await fetch(destination.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!upstream.ok) {
    return Response.json({ error: 'Lead delivery failed' }, { status: 502 });
  }

  return Response.json({ ok: true });
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response('Method Not Allowed', { status: 405 });
}
