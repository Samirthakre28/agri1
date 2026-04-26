# Farm Link - Smart Farming AI Dashboard

Farm Link is a full-stack platform designed to connect farmers and buyers directly, streamlining the agricultural supply chain using AI-driven insights and secure contract management.

## Project Structure

- **/frontend**: React + Vite + Tailwind CSS application.
- **/backend**: Node.js + Express API with Supabase integration.

## Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn
- Supabase Account

### Installation

1. Clone the repository.
2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

### Configuration

Create `.env` files in both `frontend/` and `backend/` directories based on the provided `.env.example` templates.

### Running Locally

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

## Deployment

### Backend
1. Deploy to a platform like Render, Railway, or Heroku.
2. Set environment variables:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Service/Anon Key.
   - `FRONTEND_URL`: The absolute URL of your deployed frontend (e.g., `https://farmlink.vercel.app`). This is required for CORS to allow the frontend to communicate with the backend.

### Frontend

1. Deploy to Vercel, Netlify, or Firebase.
2. Set environment variables in your deployment dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_API_URL`: **IMPORTANT** Must be the absolute URL of your deployed backend (e.g., `https://farmlink-api.onrender.com/api`). If left blank, it defaults to `/api` which only works in development or with a reverse proxy.

> [!NOTE]
> The project includes `vercel.json` and `netlify.toml` in the `frontend/` directory to handle Single Page Application (SPA) routing. This ensures that refreshing the page on sub-routes (like `/dashboard`) doesn't result in a 404 error.

## License
MIT
