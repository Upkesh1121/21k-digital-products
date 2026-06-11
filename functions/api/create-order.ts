export const onRequestPost: PagesFunction = async ({ env }) => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return json({
      error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your deployment environment.',
    }, 500);
  }

  const amount = 49900;
  const currency = 'INR';
  const receipt = `21k_${Date.now()}`;

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes: {
        product: 'Build Your First AI Website',
        brand: '21K Build',
      },
    }),
  });

  const order = await response.json();

  if (!response.ok) {
    return json({ error: order?.error?.description || 'Unable to create payment order.' }, response.status);
  }

  return json({
    key: keyId,
    orderId: order.id,
    amount,
    currency,
    name: '21K Build',
    description: 'Build Your First AI Website',
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
