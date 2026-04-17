import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Hashes an email address using SHA-256.
 * This is safe for Edge Runtime.
 */
async function hashEmail(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Webhook Secret (Anti-Abuse)
    if (WEBHOOK_SECRET) {
      const providedSecret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-webhook-secret');
      if (providedSecret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized: Invalid secret' }, { status: 401 });
      }
    }

    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      console.error('Missing GA_MEASUREMENT_ID or GA_API_SECRET');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    // Try to parse body if present (for custom params), but valid even if empty
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Ignore JSON parse error, body might be empty
    }

    // We need a client_id for GA4. 
    // Since this is a server-side webhook, we don't have the user's browser cookie.
    // We'll use a fixed string or a value from the webhook if provided.
    const clientId = body.client_id || crypto.randomUUID();

    console.log(body);

    // Hash email if provided
    let hashedEmail: string | undefined = undefined;
    if (body.email && typeof body.email === 'string') {
      hashedEmail = await hashEmail(body.email);
    }

    const gaPayload = {
      client_id: clientId,
      events: [
        {
          name: 'request_connector_submission',
          params: {
            source: 'notion_form_webhook',
            debug_mode: true, // Enable debug mode to see in DebugView
            engagement_time_msec: 100, // Required for some reports to show the event
            ...(hashedEmail && { hashed_email: hashedEmail }), // Add hashed email if present
          },
        },
      ],
    };

    console.log('Sending GA4 Payload:', JSON.stringify(gaPayload, null, 2));

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(gaPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GA4 Measurement Protocol Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to send event to GA4' },
        { status: 502 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event recorded',
      processed_email: !!hashedEmail
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
