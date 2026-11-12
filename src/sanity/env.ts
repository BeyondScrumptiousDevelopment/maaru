/**
 * Sanity connection settings. The project ID is public (it is in every API URL),
 * so it is fine to commit it here. You can also set it as an environment variable
 * (PUBLIC_SANITY_PROJECT_ID) locally in .env and in Cloudflare.
 *
 * While the project ID is empty, the site keeps reading the Markdown files in
 * src/content/ and the /admin studio is not built. Fill it in to switch to Sanity.
 */
export const PROJECT_ID = '';
export const DATASET = 'production';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const proc = typeof process !== 'undefined' ? process.env : {};

export const projectId: string = (env.PUBLIC_SANITY_PROJECT_ID || proc.PUBLIC_SANITY_PROJECT_ID || PROJECT_ID || '').trim();
export const dataset: string = (env.PUBLIC_SANITY_DATASET || proc.PUBLIC_SANITY_DATASET || DATASET).trim();
export const apiVersion = '2026-11-01';
export const sanityEnabled = projectId.length > 0;
/** Only for local testing against a mock API. */
export const apiHost: string | undefined = proc.SANITY_API_HOST || undefined;
