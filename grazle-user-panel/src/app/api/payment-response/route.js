import { NextRequest, NextResponse } from 'next/server';

const log = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        ...data
    }));
};
let redirectUrl = null;

export async function POST(request) {
    log("Received POST request to /api/payment-response", {
        headers: Object.fromEntries(request.headers),
    });

    try {
        // Parse the request body
        const formData = await request.formData();
        log("Received form data", { formData: Object.fromEntries(formData) });
        const encResp = formData.get('encResp');

        if (!encResp) {
            log("No encResp found in request body");
            return NextResponse.json({ error: 'Missing encResp parameter' }, { status: 400 });
        }

        log("Extracted encResp from request body", { encResp });

        // Redirect to the frontend page with encResp as a query parameter
         redirectUrl = `/payment-response?encResp=${encodeURIComponent(encResp)}`;
        log("Redirecting to frontend", { redirectUrl });

        return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
        log("Error processing payment response", { error: error.message, stack: error.stack });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request) {
    log("Received GET request to /api/payment-response");
  return NextResponse.json({ redirectUrl });
}

export async function PUT(request) {
    log("Received PUT request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request) {
    log("Received DELETE request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}