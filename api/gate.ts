
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Force Permissive CORS for everyone (Localhost & Production)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, App-ID, Auth-Token');
  
  // Debug header
  res.setHeader('X-RosterSync-Endpoint', 'gate-v4-auth-flow');

  // 2. Handle Preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Enforce POST (The client always POSTs to this proxy)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Robust body parsing
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { appId, authToken, iconikUrl, email, password, payload } = body || {};

    // App ID is always required for Iconik requests
    if (!appId) {
      return res.status(400).json({ error: 'Missing credentials. App-ID is required.' });
    }

    // Clean inputs
    const cleanAppId = appId.trim();
    const baseUrl = (iconikUrl || 'https://app.iconik.io').replace(/\/$/, "");
    
    let targetEndpoint = '';
    let fetchOptions: RequestInit = {};

    // MODE 1: LOGIN (Simple Auth)
    if (email && password) {
         console.log(`[Gate] Mode: Login with Email/Password`);
         targetEndpoint = `${baseUrl}/API/auth/v1/auth/simple/login/`;
         fetchOptions = {
             method: 'POST',
             headers: {
                 'App-ID': cleanAppId,
                 'Content-Type': 'application/json',
                 'Accept': 'application/json'
             },
             body: JSON.stringify({ email, password })
         };
         
         const iconikResponse = await fetch(targetEndpoint, fetchOptions);
         const dataText = await iconikResponse.text();
         let data;
         try { data = JSON.parse(dataText); } catch { data = { message: 'Non-JSON response', raw: dataText }; }
         
         if (!iconikResponse.ok && typeof data === 'object') {
            (data as any).targetUrl = targetEndpoint;
         }
         return res.status(iconikResponse.status).json(data);
    } 
    // MODE 2: SYNC (Metadata Field Creation/Update)
    else if (payload && authToken) {
         console.log(`[Gate] Mode: Sync Metadata (Create/Update)`);
         const cleanToken = authToken.trim();
         
         // 1. Try Create (POST)
         targetEndpoint = `${baseUrl}/API/metadata/v1/fields/`;
         fetchOptions = {
             method: 'POST',
             headers: {
                 'App-ID': cleanAppId,
                 'Auth-Token': cleanToken,
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify(payload)
         };
         
         let iconikResponse = await fetch(targetEndpoint, fetchOptions);
         
         // If 409 Conflict, it means the field already exists. We should try to UPDATE (PUT).
         if (iconikResponse.status === 409 && payload.name) {
             console.log(`[Gate] Field '${payload.name}' exists (409). Switching to PUT to update.`);
             targetEndpoint = `${baseUrl}/API/metadata/v1/fields/${payload.name}/`;
             fetchOptions.method = 'PUT';
             iconikResponse = await fetch(targetEndpoint, fetchOptions);
         }

         const dataText = await iconikResponse.text();
         let data;
         try {
           data = JSON.parse(dataText);
         } catch {
           data = { 
             message: 'Non-JSON response from Iconik', 
             raw: dataText.substring(0, 500)
           };
         }

         if (!iconikResponse.ok) {
             console.error(`[Gate] Sync Error ${iconikResponse.status}:`, dataText);
             if (typeof data === 'object' && data !== null) {
                 (data as any).targetUrl = targetEndpoint;
                 (data as any).statusCode = iconikResponse.status;
             }
         }

         return res.status(iconikResponse.status).json(data);
    }
    // MODE 3: VERIFY/PROXY (Token Auth Check)
    else if (authToken) {
        const cleanToken = authToken.trim();
        targetEndpoint = `${baseUrl}/API/users/me`;
        console.log(`[Gate] Mode: Verify Token`);
        fetchOptions = {
             method: 'GET',
             headers: {
                 'App-ID': cleanAppId,
                 'Auth-Token': cleanToken,
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
             }
        };

        const iconikResponse = await fetch(targetEndpoint, fetchOptions);
        const dataText = await iconikResponse.text();
        let data;
        try { data = JSON.parse(dataText); } catch { data = { message: 'Non-JSON response', raw: dataText }; }

        if (!iconikResponse.ok && typeof data === 'object') {
           (data as any).targetUrl = targetEndpoint;
        }
        return res.status(iconikResponse.status).json(data);

    } else {
        return res.status(400).json({ error: 'Missing credentials. Provide either (App-ID + Auth-Token) or (App-ID + Email + Password).' });
    }

  } catch (error: any) {
    console.error('[Gate] Internal Error:', error);
    return res.status(500).json({ error: 'Internal Proxy Error', details: error.message });
  }
}
