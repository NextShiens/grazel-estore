import { NextRequest, NextResponse } from 'next/server';

const log = (message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data
  }));
};

export async function POST(request) {
  log("Received POST request to /api/payment-response", {
    headers: Object.fromEntries(request.headers),
  });

  try {
    // Parse the request body
    const formData = await request.formData();
    const encResp = formData.get('encResp');

    if (!encResp) {
      log("No encResp found in request body");
      return NextResponse.json({ error: 'Missing encResp parameter' }, { status: 400 });
    }

    log("Extracted encResp from request body", { encResp });

    // Redirect to the frontend page with encResp as a query parameter
    const redirectUrl = `/payment-response?encResp=${encodeURIComponent(encResp)}`;
    log("Redirecting to frontend", { redirectUrl });

    // Instead of redirecting, let's return a JSON response for debugging
    return NextResponse.json({ success: true, redirectUrl });

    // Uncomment this line when ready to actually redirect
    // return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    log("Error processing payment response", { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}