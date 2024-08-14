import { NextRequest, NextResponse } from 'next/server';

const log = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        ...data
    }));
};
// In-memory store
let encRespStore = {};

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

        // Store encResp in the in-memory store
        encRespStore["123456"] = encResp;

        // Redirect to the payment response page
        const redirectUrl = `/payment-response`;
        const baseUrl = request.nextUrl.origin; // Get the base URL from the request

        // Log the redirection attempt
        log(`Attempting to redirect to: ${redirectUrl}`);

        // Construct the absolute URL
        const absoluteUrl = new URL(redirectUrl, baseUrl);

        // Perform the redirection
        return NextResponse.redirect(absoluteUrl, 307);
    } catch (error) {
        // Log any errors that occur during processing
        log('Error processing payment response', { error: error.message, stack: error.stack });

        // Return a 500 Internal Server Error response
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function GET(request) {
    log("Received GET request to /api/payment-response");

    // Retrieve encResp from the in-memory store
    const encResp = encRespStore["123456"];

    if (!encResp) {
        log("No encResp found in store");
        return NextResponse.json({ error: 'No encResp found' }, { status: 404 });
    }

    return NextResponse.json({ encResp });
}

export async function PUT(request) {
    log("Received PUT request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request) {
    log("Received DELETE request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}