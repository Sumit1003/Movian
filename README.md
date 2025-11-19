# 🎬 Movian — MERN Movie Discovery Platform

A full-stack movie discovery and streaming information platform built with the MERN stack (MongoDB, Express, React, Node.js). Features user authentication, movie metadata, personal watchlists, admin dashboard, and real-time streaming availability.

![Movian Preview](https://img.shields.io/badge/React-18.2-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green) ![Node.js](https://img.shields.io/badge/Node.js-20.0-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Live Demo:  `https://movian.onrender.com`  



## ✨ Features

### 🎯 Core Features
- **Movie Discovery** - Browse trending, search, and explore movies
- **Streaming Info** - Find where to watch movies across platforms
- **Personal Watchlist** - Save movies to watch later
- **User Reviews & Comments** - Share thoughts and read others' opinions
- **Advanced Search** - Filter by genre, year, rating, and more

### 👤 User System
- **JWT Authentication** - Secure login/register system
- **Email Verification** - Account confirmation with token system
- **Password Recovery** - Forgot/reset password functionality
- **User Profiles** - Personal dashboard and preferences
- **Watch History** - Track viewed content

### 🛡️ Admin Features
- **Admin Dashboard** - Comprehensive management interface
- **User Management** - Ban/unban users, view statistics
- **Content Moderation** - Manage comments and user content
- **Analytics** - Platform usage and performance metrics
- **System Monitoring** - Real-time system status

### 🎨 User Experience
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Framer Motion transitions
- **Dark Theme** - Eye-friendly interface
- **Fast Performance** - Optimized loading and rendering
- **Accessibility** - WCAG compliant design

## 🏗️ Architecture
```
MOVIAN/
│
├── 📁 client/ # React + Vite Frontend
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── admin/ # Admin-specific components
│ │ ├── pages/ # Route pages
│ │ ├── context/ # React context providers
│ │ ├── utils/ # Helper functions & API calls
│ │ ├── hooks/ # Custom React hooks
│ │ └── styles/ # Global styles & Tailwind config
│ ├── package.json
│ └── vite.config.js
│
├── 📁 server/ # Node.js + Express Backend
│ ├── config/ # Database & external services
│ ├── controllers/ # Route handlers
│ ├── middleware/ # Auth, validation, error handling
│ ├── models/ # MongoDB schemas
│ ├── routes/ # API route definitions
│ ├── services/ # Business logic
│ ├── utils/ # Helpers & utilities
│ ├── server.js # Entry point
│ └── package.json
│
├── 📁 docs/ # Documentation
├── .gitignore
├── README.md
└── package.json # Root package.json
```



## ⚙️ Environment Configuration

### Backend (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movian?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_specific_password

# External APIs
OMDB_API_KEY=your_omdb_api_key
TMDB_API_KEY=your_tmdb_api_key

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Admin
ADMIN_EMAIL=admin@movian.com
ADMIN_INITIAL_PASSWORD=change_this_immediately
```
### Frontend (.env)
```
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Movian
VITE_APP_VERSION=1.0.0

# External Services
VITE_OMDB_API_KEY=your_omdb_api_key
VITE_TMDB_API_KEY=your_tmdb_api_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
```

### 🛠️ Installation & Setup
Prerequisites
Node.js 18.0+

MongoDB 6.0+

Git
1. Clone Repository
```bash
git clone https://github.com/yourusername/movian.git
cd movian
```
### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Or for production
npm start
```
### 3. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
```
### 4. Database Initialization
```bash
# The application will automatically create necessary collections
# For admin user creation, use the setup script:
npm run setup:admin
```

### 🚀 Deployment
Backend Deployment (AWS EC2/Heroku/DigitalOcean)
```bash
# Build and start production server
npm run build
npm start

# Using PM2 for process management
pm2 start server.js --name "movian-api"
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the project
npm run build

# The build folder is ready to be deployed
```
## 📡 API Documentation
### Authentication Endpoints
```
## Authentication Endpoints

| Method | Endpoint                          | Description            | Auth Required |
|--------|------------------------------------|-------------------------|---------------|
| **POST** | `/api/auth/register`              | User registration      | No            |
| **POST** | `/api/auth/login`                 | User login             | No            |
| **GET**  | `/api/auth/me`                    | Get current user       | Yes           |
| **POST** | `/api/auth/forgot-password`       | Request password reset | No            |
| **POST** | `/api/auth/reset-password/:token` | Reset password         | No            |
| **GET**  | `/api/auth/verify-email/:token`   | Verify email address   | No            |
| **POST** | `/api/auth/logout`                | User logout            | Yes           |
```

### Movie Endpoints
```
## Movie Endpoints

| Method | Endpoint               | Description                     | Auth Required |
|--------|-------------------------|---------------------------------|---------------|
| **GET** | `/api/movies/trending` | Get trending movies             | No            |
| **GET** | `/api/movies/search`   | Search movies                   | No            |
| **GET** | `/api/movies/:id`      | Get movie details               | No            |
| **GET** | `/api/movies`          | Get all movies (paginated)      | No            |
| **GET** | `/api/movies/genres`   | Get available genres            | No            |
```

### User Features
```
## User Features

| Method | Endpoint                 | Description              | Auth Required |
|--------|---------------------------|---------------------------|---------------|
| **POST**   | `/api/mylist/add`           | Add to watchlist          | Yes           |
| **GET**    | `/api/mylist`               | Get user's watchlist      | Yes           |
| **DELETE** | `/api/mylist/:id`           | Remove from watchlist     | Yes           |
| **POST**   | `/api/comments`             | Add comment               | Yes           |
| **GET**    | `/api/comments/movie/:id`   | Get movie comments        | No            |
```

## 🗃️ Database Models
### User Model
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  watchlist: [{ imdbID: String, addedAt: Date }],
  createdAt: { type: Date, default: Date.now }
}
```
### Movie Model
```javascript
{
  imdbID: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  year: String,
  genre: String,
  plot: String,
  poster: String,
  rating: String,
  runtime: String,
  streaming: [{
    platform: String,
    url: String,
    type: String
  }]
}
```

## 🔒 Security Features
- JWT Authentication with secure token storage
- Password Hashing using bcrypt
- CORS Protection with whitelisted origins
- Rate Limiting on authentication endpoints
- Input Validation and sanitization
- XSS Protection through content security policies
- Helmet.js for security headers
- CSRF Protection implementation

## 📊 Performance Optimization
### Frontend
- Code Splitting with React.lazy()
- Image Optimization with lazy loading
- Bundle Analysis and tree shaking
- Caching Strategies for static assets
- PWA Ready with service workers

### Backend
- Database Indexing on frequently queried fields
- Query Optimization with Mongoose
- Response Caching with Redis (optional)
- Compression with gzip
- Connection Pooling for database

## 🧪 Testing
```bash
# Backend testing
cd server
npm test

# Frontend testing
cd client
npm test

# End-to-end testing
npm run test:e2e
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation accordingly

## 📝 License
### This project is licensed under the MIT License - see the LICENSE file for details.

### 🆘 Support
- 📧 Email: support@movian.com
- 🐛 Issues: GitHub Issues
- 💬 Discord: Join our community
- 📚 Documentation: Full docs

### 🙏 Acknowledgments
- Movie data provided by OMDB API & TMDB API
- Icons by Lucide React
- UI components built with Tailwind CSS
- Animations powered by Framer Motion

## Movian © 2024 - Discover Your Next Favorite Movie 🎬









