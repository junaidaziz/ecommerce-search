export async function sendOrderConfirmation(to, order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'orders@example.com';
  if (!apiKey) {
    console.log('No RESEND_API_KEY configured');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Order #${order.id} Confirmation`,
        html: `<p>Thank you for your order #${order.id}.</p>`,
      }),
    });
    if (!res.ok) {
      console.error('Failed to send email', await res.text());
    }
  } catch (e) {
    console.error('Email error', e);
  }
}

export async function sendOrderStatusUpdate(to, order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'orders@example.com';
  if (!apiKey) {
    console.log('No RESEND_API_KEY configured');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Order #${order.id} Status Update`,
        html: `<p>Your order #${order.id} status is now <b>${order.status}</b>.</p>`,
      }),
    });
    if (!res.ok) {
      console.error('Failed to send email', await res.text());
    }
  } catch (e) {
    console.error('Email error', e);
  }
}
