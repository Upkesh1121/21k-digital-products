export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return json({ error: 'Access-code verification is not configured.' }, 500);
  }

  const body = await request.json() as { accessCode?: string };
  const accessCode = body.accessCode?.trim();

  if (!accessCode) {
    return json({ error: 'Access code is required.' }, 400);
  }

  const parts = accessCode.split('.');
  if (parts.length !== 3 || parts[0] !== '21K') {
    return json({ error: 'Invalid access code format.' }, 400);
  }

  const [, payload, signature] = parts;
  const expected = (await hmacSha256(payload, keySecret)).slice(0, 24);

  if (signature !== expected) {
    return json({ error: 'Access code verification failed.' }, 400);
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { paymentId?: string; issuedAt?: number };
    if (!decoded.paymentId || !decoded.issuedAt) {
      return json({ error: 'Invalid access code payload.' }, 400);
    }
  } catch {
    return json({ error: 'Invalid access code payload.' }, 400);
  }

  return json({ ok: true });
};

async function hmacSha256(message: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function base64UrlDecode(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(base64);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
