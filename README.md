# Poker Connect Hub

A poker hand analysis and sharing platform built with React, TypeScript, and NestJS.

## Features

- **Hand Recreation**: Recreate poker hands step-by-step
- **Hand Analysis**: Analyze poker decisions and strategies
- **Social Sharing**: Share hands with the poker community
- **Google Authentication**: Secure login with Google OAuth
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- Axios

### Backend
- NestJS
- MongoDB
- Passport.js (Google OAuth)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or Atlas)
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd poker-connect-hub
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables:

Create `.env` in the root directory:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
DATABASE_URL=mongodb://localhost:27017/poker_connect_hub
# ... other variables
```

4. Run the development servers:
```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
# Frontend only
npm run dev

# Backend only
npm run backend:dev
```

## Deployment

### Frontend (Netlify)
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy

### Backend
Deploy to any Node.js hosting service (Heroku, Railway, Render, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.