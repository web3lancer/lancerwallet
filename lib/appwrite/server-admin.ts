import { Client, Users, Databases, ID } from 'node-appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error('Missing required Appwrite server-side environment variables.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

export const serverAdmin = {
  client,
  users: new Users(client),
  databases: new Databases(client),
  dbId: databaseId,
  ID,
};
