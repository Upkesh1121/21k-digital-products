export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return json({
      error: 'Razorpay verification is not configured. Add RAZORPAY_KEY_SECRET to your deployment environment.',
    }, 500);
  }

  const body = await request.json() as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return json({ error: 'Missing payment verification fields.' }, 400);
  }

  const expected = await hmacSha256(`${orderId}|${paymentId}`, keySecret);

  if (expected !== signature) {
    return json({ error: 'Payment signature verification failed.' }, 400);
  }

  return json({
    ok: true,
    accessCode: await createAccessCode(paymentId, keySecret),
  });
};

async function createAccessCode(paymentId: string, secret: string) {
  const payload = base64UrlEncode(JSON.stringify({
    paymentId,
    issuedAt: Date.now(),
  }));
  const signature = (await hmacSha256(payload, secret)).slice(0, 24);
  return `21K.${payload}.${signature}`;
}

function base64UrlEncode(value: string) {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
