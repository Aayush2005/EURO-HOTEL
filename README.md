# Euro Hotel - Luxury Booking Management System

A modern, full-stack hotel booking platform built for Euro Hotel, featuring real-time availability, secure payments, and a premium user experience.

**Author:** Aayush

## Overview

Euro Hotel is a comprehensive booking management system that combines a FastAPI backend with a Next.js frontend to deliver a seamless hotel reservation experience. The platform handles everything from room browsing to payment processing, with a focus on luxury hospitality standards.

## Features

- **Room Management**: 4 distinct room categories with detailed amenities
- **Real-time Booking**: Live availability with 15-minute hold system
- **Secure Payments**: Razorpay integration with webhook support
- **User Authentication**: JWT-based auth with OTP verification
- **Admin Dashboard**: Complete booking and inventory management
- **Responsive Design**: Mobile-first approach with luxury aesthetics
- **Promo Codes**: Flexible discount system
- **Audit Logging**: Complete transaction tracking

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database with Beanie ODM
- **JWT Authentication** - Secure token-based auth
- **Razorpay** - Payment gateway integration
- **SMTP** - Email notifications

### Frontend
- **Next.js 15** - React framework with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Lucide Icons** - Modern icon library

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- UV package manager

### Backend Setup
```bash
cd backend
uv sync
cp .env.example .env
# Edit .env with your configuration
./start.sh
```

### Frontend Setup
```bash
cd frontend
npm install
# Environment file should already be configured
npm run dev
```

### Database Setup
```bash
cd backend
python seed_rooms.py
```

## Room Categories

- **Standard Heritage Room** - ₹8,500/night (8 rooms)
- **Deluxe Heritage Room** - ₹12,500/night (6 rooms)
- **Heritage Suite** - ₹18,500/night (4 rooms)
- **Presidential Suite** - ₹35,000/night (2 rooms)

## Project Structure

```
euro-hotel/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Business logic
│   ├── main.py            # Application entry point
│   └── requirements files
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## Key Features

### Booking Flow
1. **Browse Rooms** - Filter by dates, guests, and preferences
2. **Select Room** - View detailed information and pricing
3. **Guest Details** - Secure information collection
4. **Payment** - Razorpay integration with hold system
5. **Confirmation** - Instant booking confirmation

### Security
- HTTP-only cookies for authentication
- Rate limiting on critical endpoints
- Input validation and sanitization
- Secure payment processing
- CORS protection

### Admin Features
- Real-time booking management
- Revenue analytics
- Room inventory control
- Guest check-in/check-out
- Promo code management

## Environment Configuration

### Backend (.env)
```env
MONGODB_URI=db-url
JWT_SECRET_KEY=your-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
```


## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend development
cd frontend
npm run dev
```

### Code Style
- Python: Follow PEP 8 standards
- TypeScript: ESLint configuration included
- Consistent naming conventions
- Comprehensive error handling

## Deployment

The system is production-ready with proper:
- Environment variable management
- Database indexing and optimization
- Security configurations
- Error handling and logging
- Performance optimizations

## License

This project is proprietary software developed for Euro Hotel.

---

**Euro Hotel** - Where luxury meets technology. Experience seamless booking with our modern platform designed for discerning travelers.