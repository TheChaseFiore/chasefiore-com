interface Env {
  TURNSTILE_SECRET_KEY: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData();
  const token = formData.get('cf-turnstile-response');

  if (!token) {
    return Response.json({ error: 'Missing verification token' }, { status: 400 });
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token.toString(),
      remoteip: ip,
    }),
  });

  const { success } = await verifyRes.json() as TurnstileVerifyResponse;
  if (!success) {
    return Response.json({ error: 'Verification failed' }, { status: 403 });
  }

  formData.delete('cf-turnstile-response');

  const formspreeRes = await fetch('https://formspree.io/f/mlgalneq', {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  const body = await formspreeRes.json();
  return Response.json(body, { status: formspreeRes.status });
};
