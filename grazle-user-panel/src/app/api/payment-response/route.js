import { NextRequest, NextResponse } from 'next/server';

const log = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        ...data
    }));
};


export async function POST(request) {
  const formData = await request.formData();
  const encResp = formData.get('encResp');

  if (!encResp) {
    return NextResponse.json({ error: 'Missing encResp parameter' }, { status: 400 });
  }

  // Store encResp in a secure way, such as in a database or encrypted session
  // For this example, we'll use cookies, but in production, use a more secure method
  const response = NextResponse.redirect(`/payment-response?encResp=${encResp}`, 307);
  response.cookies.set('encResp', encResp, { httpOnly: true, secure: true, sameSite: 'strict' });

  return response;
}

export async function GET(request) {
  const encResp = request.cookies.get('encResp');

  if (!encResp) {
    return NextResponse.json({ error: 'No encResp found' }, { status: 404 });
  }

  // Clear the cookie after reading it
  const response = NextResponse.json({ encResp: encResp.value });
  response.cookies.set('encResp', '', { maxAge: 0 });

  return response;
}


export async function PUT(request) {
    log("Received PUT request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request) {
    log("Received DELETE request to /api/payment-response");
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}