# 🔐 Euro Hotel Authentication System

A complete authentication and user management system for the Euro Hotel website, featuring JWT-based authentication with HTTP-only cookies, OTP verification, and a modern React frontend.

## 🏗️ Architecture

- **Backend**: FastAPI with MongoDB (using Beanie ODM)
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: JWT tokens with HTTP-only cookies
- **Database**: MongoDB with indexed collections
- **Email**: SMTP-based OTP delivery
- **Security**: Rate limiting, password hashing, CORS protection

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate

# Install dependencies using UV
uv pip install -e .

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the server
./start.sh
# OR manually:
python run.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment file should already be created
# Edit .env.local if needed
nano .env.local

# Start development server
npm run dev
```

### 3. Database Setup

Make sure MongoDB is running locally or provide a MongoDB URI in your `.env` file.

## 📋 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/euro_hotel

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET_KEY=your-refresh-secret-key-change-this-in-production

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔧 SMTP Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASSWORD`

## 🎯 Features

### 🔐 Authentication
- ✅ JWT-based authentication with HTTP-only cookies
- ✅ Refresh token rotation
- ✅ Password strength validation
- ✅ Rate limiting on auth endpoints
- ✅ Secure password hashing (bcrypt)

### 👤 User Management
- ✅ User registration with email/username/phone
- ✅ Email OTP verification
- ✅ Login with email or username
- ✅ Password reset with OTP
- ✅ Profile updates (username, phone, password)
- ✅ Duplicate email/username prevention

### 🎨 Frontend
- ✅ Modal-based authentication UI
- ✅ Consistent with hotel theme (navy/gold palette)
- ✅ Toast notifications for feedback
- ✅ Protected routes with middleware
- ✅ Responsive design
- ✅ Form validation

### 🛡️ Security
- ✅ HTTP-only cookies (no localStorage)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify email with OTP
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Password Management
- `POST /auth/reset-password-request` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP

### Profile Management
- `PUT /auth/update-profile` - Update user profile

## 🎨 UI Components

### Modals
- **AuthModal**: Login/Register/OTP/Password Reset
- **ProfileModal**: Update user profile

### Features
- Animated transitions with Framer Motion
- Form validation with visual feedback
- Password strength indicators
- OTP input with proper formatting
- Toast notifications for all actions

## 🔒 Security Best Practices

1. **JWT Tokens**: Short-lived access tokens (30 min) with longer refresh tokens (7 days)
2. **HTTP-Only Cookies**: Prevents XSS attacks on tokens
3. **Rate Limiting**: 5 requests/minute on auth endpoints
4. **Password Requirements**: 8+ chars with uppercase, lowercase, number, special char
5. **OTP Expiry**: 10-minute expiration on verification codes
6. **CORS**: Restricted to specific origins
7. **Input Validation**: Server-side validation on all inputs

## 🛣️ Protected Routes

Routes that require authentication:
- `/profile` - User profile page
- `/booking` - Booking management
- `/dashboard` - User dashboard

Middleware automatically redirects unauthenticated users to home page with auth modal.

## 🎭 User Experience

### Registration Flow
1. User clicks "Sign Up" → Registration modal opens
2. User fills form → Server validates and sends OTP
3. OTP modal opens → User enters code
4. Account activated → User logged in automatically

### Login Flow
1. User clicks "Sign In" → Login modal opens
2. User enters credentials → Server validates
3. Success → Modal closes, user menu appears in header

### Password Reset Flow
1. User clicks "Forgot Password" → Reset modal opens
2. User enters email → Server sends OTP
3. User enters OTP + new password → Password updated

## 🚨 Error Handling

- **Client-side**: Form validation with real-time feedback
- **Server-side**: Detailed error messages with proper HTTP status codes
- **User-friendly**: Toast notifications for all success/error states
- **Rate limiting**: Clear messages when limits exceeded

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with valid/invalid data
- [ ] Email OTP verification
- [ ] Login with email and username
- [ ] Password reset flow
- [ ] Profile updates
- [ ] Protected route access
- [ ] Rate limiting behavior
- [ ] Token refresh functionality

## 🚀 Production Deployment

### Backend
1. Set strong JWT secrets
2. Configure production MongoDB URI
3. Set up proper SMTP service
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up monitoring and logging

### Frontend
1. Update API URL to production backend
2. Enable HTTPS
3. Configure proper CSP headers
4. Set up error tracking

## 🔧 Troubleshooting

### Common Issues

**"Failed to send email"**
- Check SMTP credentials
- Verify Gmail app password
- Check firewall/network restrictions

**"Invalid refresh token"**
- Clear browser cookies
- Check JWT secret consistency
- Verify token expiration settings

**"CORS error"**
- Add frontend URL to `allowed_origins`
- Check protocol (http vs https)
- Verify port numbers

**"Database connection failed"**
- Ensure MongoDB is running
- Check connection string format
- Verify network connectivity

## 📚 Dependencies

### Backend
- FastAPI - Web framework
- Beanie - MongoDB ODM
- Motor - Async MongoDB driver
- python-jose - JWT handling
- passlib - Password hashing
- slowapi - Rate limiting
- aiosmtplib - Async email sending

### Frontend
- Next.js 15 - React framework
- Framer Motion - Animations
- React Hot Toast - Notifications
- Lucide React - Icons
- Tailwind CSS - Styling

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Test all authentication flows
5. Update documentation

## 📄 License

This authentication system is part of the Euro Hotel project and follows the same licensing terms.