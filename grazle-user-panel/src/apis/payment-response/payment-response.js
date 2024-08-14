import { NextApiRequest, NextApiResponse } from 'next';

const log = (message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data
  }));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  log("Received request to /api/payment-response", {
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  });

  if (req.method === 'POST') {
    try {
      // Extract encResp from the request body
      const { encResp } = req.body;

      if (!encResp) {
        log("No encResp found in request body");
        return res.status(400).json({ error: 'Missing encResp parameter' });
      }

      log("Extracted encResp from request body", { encResp });

      // Redirect to the frontend page with encResp as a query parameter
      const redirectUrl = `/payment-response?encResp=${encodeURIComponent(encResp)}`;
      log("Redirecting to frontend", { redirectUrl });

      res.redirect(307, redirectUrl);
    } catch (error) {
      log("Error processing payment response", { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    log("Method not allowed", { method: req.method });
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};