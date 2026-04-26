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
2. Set environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `FRONTEND_URL`.

### Frontend
1. Deploy to Vercel, Netlify, or Firebase.
2. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.

## License
MIT
