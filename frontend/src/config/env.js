/**
 * Centralized environment variable configuration.
 * Using this pattern ensures that all environment variables are validated and 
 * accessible from a single point, making the app easier to maintain and deploy.
 */

const getEnv = (key, defaultValue = "") => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

export const ENV = {
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
  // In production on Vercel, /api routes to serverless functions (same domain).
  // In local dev, Vite proxy forwards /api to localhost:5000.
  // Override with VITE_API_URL only if backend is on a different domain.
  API_URL: getEnv('VITE_API_URL', '/api'),
  IS_PROD: import.meta.env.PROD,
};

// Validate critical env vars at startup
if (!ENV.SUPABASE_URL) {
  console.error("❌ CRITICAL: VITE_SUPABASE_URL is not defined. Supabase will not work.");
}
if (!ENV.SUPABASE_ANON_KEY) {
  console.error("❌ CRITICAL: VITE_SUPABASE_ANON_KEY is not defined. Supabase will not work.");
}

export default ENV;
