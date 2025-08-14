import { Client, Account } from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT as string;
const project = process.env.APPWRITE_PROJECT as string;
const apiKey = process.env.APPWRITE_API_KEY as string;

if (!endpoint || !project || !apiKey) {
  // For server-side usage, we still want to avoid throwing in dev; log a warning
  console.warn('Appwrite environment variables not fully set. Please configure .env');
}

const client = new Client();
client.setEndpoint(endpoint || 'https://example.com/v1').setProject(project || '');

// Note: setKey is only available server-side via SDK version; if not available, callers should set key per-request.
if (apiKey) {
  // @ts-expect-error - some SDK versions expose setKey
  client.setKey?.(apiKey);
}

export const appwriteClient = client;
export const appwriteAccount = new Account(client);
export default client;
