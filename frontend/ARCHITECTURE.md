# Project Architecture - Farm Link

This project follows a professional, scalable, and deployment-optimized structure for React/Vite applications.

## Directory Structure

- `src/assets/`: Static assets handled by the module graph (e.g., imported images, SVGs).
- `src/components/ui/`: Atomic, reusable primitive components (Button, Input, Badge). These do not contain business logic.
- `src/components/layout/`: Structural components for page layouts (Navbar, Sidebar, MainLayout).
- `src/config/`: Centralized application settings. `env.js` manages and validates all environment variables.
- `src/context/`: Global state management using React Context API.
- `src/hooks/`: Custom React hooks for shared logic (e.g., `useAuth`).
- `src/pages/`: Main entry points for each route.
- `src/services/`: API clients and third-party SDK configurations (e.g., Supabase, Fetch wrappers).
- `src/styles/`: Global CSS, Tailwind configuration, and utility styles.
- `src/utils/`: Generic helper functions (formatting, validation, math).

## Best Practices

### 1. Environment Variables
- Never use `import.meta.env` directly in components.
- Import `ENV` from `@/config/env` to ensure consistent defaults and validation.

### 2. State Management
- Use `AuthContext` for user session data.
- Use local `useState` for page-specific UI state.
- For complex data fetching, consider moving logic to `services/`.

### 3. Styling
- Use Tailwind CSS utility classes.
- Use the `cn` utility in `src/utils/cn.js` for clean conditional class merging.

### 4. Deployment Flow
- **Local**: `npm run dev` uses `.env`.
- **Production**: Build with `npm run build`. Continuous Deployment (Netlify/Vercel) automatically handles building from the `src` folder.

## Build & Distribution
- The project outputs a production-optimized bundle to the `dist/` folder.
- Deployment platforms should be configured to serve `dist/index.html` for all routes (handled by `vercel.json` / `netlify.toml`).
