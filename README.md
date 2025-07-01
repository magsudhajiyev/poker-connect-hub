# Poker Connect Hub

A poker hand analysis and sharing platform built with Next.js, React, and TypeScript.

## Features

- **Hand Recreation**: Recreate poker hands step-by-step
- **Hand Analysis**: Analyze poker decisions and strategies
- **Social Sharing**: Share hands with the poker community
- **Google Authentication**: Secure login with Google OAuth
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

### Tech Stack
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- NextAuth.js (Google OAuth)
- MongoDB
- JWT Authentication
- Axios

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
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables:

Copy the example file and update with your values:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/poker-connect-hub

# JWT for API authentication
JWT_SECRET=your-jwt-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - All variables from `.env.example`
   - Update URLs to your production domain
4. Deploy

The app will automatically deploy on every push to main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.