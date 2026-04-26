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
  API_URL: getEnv('VITE_API_URL', '/api'),
  IS_PROD: import.meta.env.PROD,
};

// Log warning in development if critical keys are missing
if (!ENV.IS_PROD) {
  if (!ENV.SUPABASE_URL) console.warn("VITE_SUPABASE_URL is not defined");
  if (!ENV.SUPABASE_ANON_KEY) console.warn("VITE_SUPABASE_ANON_KEY is not defined");
}

export default ENV;
