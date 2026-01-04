
export interface IconikResponse {
    success: boolean;
    data: any;
}

export const testIconikConnection = async (
    appId: string, 
    authToken: string, 
    iconikUrl: string = 'https://app.iconik.io',
    email?: string,
    password?: string
): Promise<IconikResponse> => {
    // We target the new 'gate' endpoint
    const PROXY_URL = '/api/gate';
    
    console.log(`Attempting to connect to proxy at: ${PROXY_URL}`);

    try {
        const payload: any = { appId, iconikUrl };
        
        // If credentials provided, send them for login. Otherwise send token for verification.
        if (email && password) {
            payload.email = email;
            payload.password = password;
        } else {
            payload.authToken = authToken;
        }

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();

            if (!response.ok) {
                console.warn('Iconik Proxy returned error:', result);
                
                let errorMessage = "Connection failed.";

                if (response.status === 404) {
                    errorMessage = `Iconik returned 404 (Not Found) from ${result.targetUrl || 'the endpoint'}. \n\n1. Ensure your App-ID is correct. \n2. Check if your Iconik URL in settings matches your region (e.g., https://app.iconik.io or https://lucidlink.iconik.io).`;
                } else if (response.status === 401) {
                    errorMessage = "Iconik returned 401 (Unauthorized). Please check your App ID and Credentials.";
                } else if (result.error) {
                    errorMessage = result.error;
                } else if (result.detail) {
                    errorMessage = result.detail;
                } else if (result.message) {
                    errorMessage = result.message;
                } else if (result.errors) {
                    if (Array.isArray(result.errors)) {
                        const firstError = result.errors[0];
                        errorMessage = typeof firstError === 'string' 
                            ? firstError 
                            : firstError?.message || JSON.stringify(firstError);
                    } else {
                         errorMessage = JSON.stringify(result.errors);
                    }
                } else {
                    errorMessage = `Server Error (${response.status}): ${JSON.stringify(result)}`;
                }

                return { success: false, data: errorMessage };
            }
            
            return { success: true, data: result };
        } else {
            const text = await response.text();
            console.error('Received non-JSON response from proxy:', text);
            return { success: false, data: `Server Error (${response.status}): The proxy endpoint could not be reached. Response: ${text.substring(0, 100)}...` };
        }

    } catch (error: any) {
        console.error('Iconik Service Network Error:', error);
        return { 
            success: false, 
            data: `Network Error: Unable to reach the backend proxy. ${error.message}` 
        };
    }
};

export const syncRosterToIconik = async (
    appId: string,
    authToken: string,
    iconikUrl: string,
    payload: any
): Promise<IconikResponse> => {
    const PROXY_URL = '/api/gate';

    try {
        const body = {
            appId,
            authToken,
            iconikUrl,
            payload // Sending payload triggers the Sync Mode in the gate
        };

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();

            if (!response.ok) {
                console.warn('Iconik Sync Error:', result);
                let errorMessage = result.error || result.message || "Sync failed";
                
                if (result.errors) {
                     errorMessage = Array.isArray(result.errors) 
                        ? (typeof result.errors[0] === 'string' ? result.errors[0] : JSON.stringify(result.errors[0]))
                        : JSON.stringify(result.errors);
                }

                return { success: false, data: errorMessage };
            }

            return { success: true, data: result };
        } else {
            const text = await response.text();
            return { success: false, data: `Server Error (${response.status}): ${text.substring(0, 100)}` };
        }
    } catch (error: any) {
        console.error('Iconik Sync Network Error:', error);
        return { success: false, data: error.message };
    }
};
