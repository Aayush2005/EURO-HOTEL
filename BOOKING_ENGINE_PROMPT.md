# 🏨 EURO HOTEL - Production Booking Management Engine

**Goal**: Build a production-ready Booking Management Engine using FastAPI (backend) and integrate with the existing Next.js frontend. Use MongoDB for storage. The deliverable must be production-grade code ready for real transactions — no mockups, no demo UIs. Provide clear manual steps for payment provider integration and deployment.

## 🎯 Core Requirements — Backend (FastAPI)

### 📊 Domain Models & Collections (MongoDB)

**rooms**:
```json
{
  "id": "ObjectId",
  "slug": "deluxe-heritage-suite",
  "title": "Deluxe Heritage Suite",
  "description": "Luxurious suite with heritage charm...",
  "room_type": "suite|deluxe|standard|presidential",
  "amenities": ["wifi", "ac", "minibar", "balcony", "heritage_view"],
  "images": [
    {
      "url": "/images/rooms/deluxe-suite-1.jpg",
      "alt": "Deluxe Suite Main View",
      "is_primary": true,
      "order": 1
    }
  ],
  "base_price": 15000,
  "seasonal_prices": [
    {
      "season": "peak|off_peak|festival",
      "start_date": "2024-12-20",
      "end_date": "2024-01-05",
      "price_multiplier": 1.5
    }
  ],
  "max_occupancy": 4,
  "bed_configuration": "1 King + 1 Sofa Bed",
  "room_size": "45 sqm",
  "floor": "2nd Floor",
  "view": "Heritage Courtyard",
  "cancellation_policy": "free_24h|non_refundable|flexible",
  "created_at": "datetime",
  "updated_at": "datetime",
  "active": true,
  "metadata": {
    "total_rooms": 5,
    "room_numbers": ["201", "202", "203", "204", "205"]
  }
}
```

**room_inventory**:
```json
{
  "room_id": "ObjectId",
  "date": "2024-12-25",
  "available_count": 3,
  "locked_count": 1,
  "price_override": 18000,
  "blocked_reason": "maintenance|event|seasonal_closure"
}
```

**bookings**:
```json
{
  "id": "ObjectId",
  "booking_reference": "EH2024001234",
  "user_id": "ObjectId",
  "guest_details": {
    "primary_guest": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "id_type": "passport|aadhar|driving_license",
      "id_number": "A1234567"
    },
    "additional_guests": [
      {
        "name": "Jane Doe",
        "age": 28
      }
    ]
  },
  "room_bookings": [
    {
      "room_id": "ObjectId",
      "room_number": "201",
      "start_date": "2024-12-25",
      "end_date": "2024-12-27",
      "nights": 2,
      "base_price": 15000,
      "seasonal_multiplier": 1.5,
      "final_price": 22500
    }
  ],
  "total_guests": 2,
  "special_requests": "Late check-in, vegetarian meals",
  "status": "pending|confirmed|cancelled|checked_in|checked_out|no_show|failed",
  "pricing": {
    "subtotal": 45000,
    "taxes": {
      "gst": 8100,
      "service_charge": 4500
    },
    "discounts": {
      "promo_code": "WELCOME10",
      "discount_amount": 4500
    },
    "total_amount": 53100,
    "currency": "INR"
  },
  "payment_status": "pending|paid|partially_paid|refunded|failed",
  "created_at": "datetime",
  "updated_at": "datetime",
  "idempotency_key": "unique_string",
  "hold_expires_at": "datetime",
  "check_in_time": "14:00",
  "check_out_time": "12:00"
}
```

**payments**:
```json
{
  "booking_id": "ObjectId",
  "provider": "razorpay|stripe|payu",
  "provider_payment_id": "pay_xyz123",
  "provider_order_id": "order_abc456",
  "amount": 53100,
  "currency": "INR",
  "status": "created|authorized|captured|failed|refunded",
  "payment_method": "card|upi|netbanking|wallet",
  "created_at": "datetime",
  "captured_at": "datetime",
  "failure_reason": "string"
}
```

**promo_codes**:
```json
{
  "code": "WELCOME10",
  "discount_type": "percentage|fixed",
  "discount_value": 10,
  "min_amount": 10000,
  "max_discount": 5000,
  "valid_from": "datetime",
  "valid_until": "datetime",
  "usage_limit": 100,
  "used_count": 45,
  "active": true,
  "applicable_room_types": ["all"]
}
```

**audit_logs**:
```json
{
  "actor": "user_id|admin_id|system",
  "action": "booking_created|payment_captured|booking_cancelled",
  "resource": "booking|payment|room",
  "resource_id": "ObjectId",
  "before": {},
  "after": {},
  "timestamp": "datetime",
  "ip_address": "string",
  "user_agent": "string"
}
```

### 🔗 API Endpoints (Clean REST + JSON)

**Room Management**:
- `GET /api/rooms` — List with filtering (date-range, occupancy, price-range, amenities, room_type) and pagination
- `GET /api/rooms/{slug}` — Room details with gallery, amenities, pricing, availability calendar
- `POST /api/rooms/availability` — Check availability for date range and guest count

**Booking Flow**:
- `POST /api/bookings/price-check` — Compute total price, taxes, fees, availability (idempotent)
- `POST /api/bookings/hold` — Create temporary hold (lock inventory for 15 minutes), return hold token
- `POST /api/bookings/confirm` — Confirm booking using hold token and idempotency key
- `POST /api/bookings/cancel` — Cancel with refund policy enforcement
- `GET /api/bookings/{id}` — Booking details for user/admin
- `PUT /api/bookings/{id}/check-in` — Admin check-in
- `PUT /api/bookings/{id}/check-out` — Admin check-out

**Payment Integration**:
- `POST /api/payments/create-session` — **STUB**: Create payment session (document provider integration point)
- `POST /api/webhooks/payment/{provider}` — Receive payment gateway webhooks
- `GET /api/payments/{booking_id}/status` — Payment status check

**Admin Operations**:
- `GET /api/admin/bookings` — List all bookings with filters
- `PUT /api/admin/bookings/{id}` — Update booking status
- `GET /api/admin/dashboard/stats` — Revenue, occupancy, booking stats
- `POST /api/admin/rooms/{id}/block` — Block room dates
- `PUT /api/admin/pricing/seasonal` — Update seasonal pricing

**Promo Codes**:
- `POST /api/promo/validate` — Validate promo code
- `POST /api/admin/promo` — Create promo code

### 🔒 Security & Concurrency

**Availability & Concurrency**:
- Use MongoDB transactions for hold → confirm operations
- Implement optimistic locking with version fields
- Hold TTL: Auto-release holds after 15 minutes using TTL indexes
- Idempotency keys on confirm and payment endpoints
- Rate limiting: 10 requests/minute on booking endpoints, 5/minute on payment

**Security Measures**:
- Input validation with Pydantic models
- CSRF protection for payment flows
- Audit logging for all booking changes
- Masked logging for sensitive data
- Strong error handling with consistent HTTP status codes

### 💰 Pricing & Business Rules

**Indian Hotel Pricing**:
- Base price + seasonal multipliers (Peak: 1.5x, Festival: 2x)
- GST: 18% on room tariff above ₹7,500, 12% below
- Service charge: 10% (optional, configurable)
- Support for promo codes and corporate discounts
- Weekend pricing (Friday-Sunday): 1.2x multiplier

**Booking Rules**:
- Minimum stay: 1 night, Maximum: 30 nights
- Check-in: 2:00 PM, Check-out: 12:00 PM
- Cancellation policies: Free 24h, Non-refundable, Flexible
- Blackout dates during festivals/events
- Room capacity enforcement

## 💻 Frontend (Next.js) Requirements

### 🏨 Room Details Page (`/rooms/[slug]`)

**Component Structure**:
```
/rooms/[slug]/page.tsx
├── RoomHero (image gallery with lightbox)
├── RoomInfo (title, description, amenities)
├── PricingCalendar (availability + pricing)
├── BookingCTA (opens booking modal)
└── RoomFeatures (detailed amenities, policies)
```

**Features**:
- Hero gallery with 6+ high-quality images
- Lightbox modal for image viewing
- Interactive calendar showing available dates and pricing
- Clear amenities display with icons
- "Book Now" CTA that opens booking overlay
- Breadcrumb navigation
- SEO optimization with proper meta tags

### 📅 Booking Flow (Modal Overlays)

**Step 1: Date & Guest Selection**
- Date picker with unavailable dates disabled
- Guest count selector (adults/children)
- Real-time price calculation
- Room type selection if multiple available

**Step 2: Guest Details & Hold**
- Guest information form
- Special requests textarea
- Promo code input with validation
- Create booking hold (15-minute countdown timer)
- Price breakdown display

**Step 3: Confirmation & Payment**
- Booking summary review
- Terms & conditions checkbox
- Payment method selection
- Integration with payment gateway stub
- Booking confirmation with reference number

**Design Requirements**:
- Use existing EURO HOTEL theme (navy #0B1D3A, gold #C9A227)
- Responsive design for mobile/tablet
- Loading states and error handling
- Progress indicator for multi-step flow

### 💳 Payment Page Integration

**Payment UI Components**:
- Payment method selection (Cards, UPI, Net Banking, Wallets)
- Secure payment form (using provider's SDK)
- Order summary with breakdown
- Success/failure handling with proper redirects
- Receipt generation and email

**Security**:
- No sensitive payment data stored locally
- Proper token handling for payment sessions
- SSL/HTTPS enforcement
- PCI compliance notes

## 🚀 Deployment & Operations

### 📋 Required Environment Variables

**Backend (.env)**:
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/euro_hotel?retryWrites=true&w=majority
MONGODB_DB_NAME=euro_hotel

# Authentication (from existing auth system)
JWT_SECRET_KEY=your-jwt-secret
JWT_REFRESH_SECRET_KEY=your-refresh-secret

# Payment Gateway (choose one)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Email/SMS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=eurohotel83@gmail.com
SMTP_PASSWORD=your-app-password
SMS_PROVIDER_API_KEY=xxxxx

# Application
FRONTEND_URL=https://eurohotel.com
BACKEND_URL=https://api.eurohotel.com
HOLD_EXPIRY_MINUTES=15
DEFAULT_CURRENCY=INR

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=INFO

# File Storage
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=euro-hotel-images
AWS_REGION=ap-south-1
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://api.eurohotel.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_SITE_URL=https://eurohotel.com
```

### 🛠️ Production Setup Checklist

**Database Setup**:
- [ ] MongoDB Atlas cluster with replica set enabled
- [ ] Database indexes created for performance
- [ ] Backup strategy configured
- [ ] Connection pooling optimized

**Payment Gateway**:
- [ ] Choose provider (Razorpay recommended for India)
- [ ] Complete KYC and business verification
- [ ] Configure webhook endpoints
- [ ] Test payment flows in sandbox
- [ ] Set up refund policies

**Security & Compliance**:
- [ ] SSL certificates installed
- [ ] HTTPS redirect configured
- [ ] CORS origins properly set
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] PCI compliance review

**Monitoring & Alerts**:
- [ ] Sentry error tracking
- [ ] Application performance monitoring
- [ ] Database monitoring
- [ ] Payment failure alerts
- [ ] Booking confirmation emails

**Infrastructure**:
- [ ] Load balancer configuration
- [ ] Auto-scaling setup
- [ ] CDN for static assets
- [ ] Redis for session management
- [ ] Background job processing

## 🧪 Testing Requirements

**Unit Tests**:
- Pricing calculation logic
- Availability checking
- Booking state transitions
- Payment webhook handling

**Integration Tests**:
- End-to-end booking flow
- Payment gateway integration
- Email/SMS notifications
- Admin operations

**Load Testing**:
- Concurrent booking scenarios
- Payment processing under load
- Database performance
- API response times

## 📊 Admin Dashboard Requirements

**Booking Management**:
- Real-time booking dashboard
- Booking status updates
- Guest check-in/check-out
- Payment status tracking

**Revenue Analytics**:
- Daily/monthly revenue reports
- Occupancy rate tracking
- Room type performance
- Seasonal trend analysis

**Inventory Management**:
- Room availability calendar
- Seasonal pricing updates
- Promo code management
- Blackout date configuration

## 🚨 Agent Behavior Instructions

**DO NOT**:
- Generate mockups or screenshots
- Create demo/fake data beyond minimal seeds
- Hardcode theme colors (read from existing config)
- Integrate real payment providers without confirmation
- Build admin UI (provide hooks/components only)

**DO**:
- Build production-ready code with proper error handling
- Implement proper concurrency and race condition handling
- Provide comprehensive API documentation
- Include security best practices
- Create detailed deployment instructions
- Build reusable React components

**CLARIFICATION NEEDED**:
Before implementing, please confirm:
1. **Payment Provider**: Razorpay, Stripe, or PayU for Indian market?
2. **Tax Configuration**: GST rates and service charge percentages?
3. **Cancellation Policy**: Free cancellation hours and refund percentages?
4. **Room Categories**: Specific room types and their pricing tiers?
5. **Seasonal Periods**: Peak/off-peak date ranges for 2024-2025?

## 🎯 Final Deliverable Acceptance Criteria

1. **Backend**: Secure, documented API with payment stubs passing integration tests
2. **Frontend**: Room details page and booking flow working end-to-end
3. **Concurrency**: Proper handling of simultaneous bookings with hold mechanism
4. **Security**: Production-grade security measures implemented
5. **Documentation**: Clear setup instructions and API documentation
6. **Testing**: Comprehensive test suite with >80% coverage
7. **Theme Consistency**: Perfect integration with existing EURO HOTEL design

**Build it like it will process real money from day one. No shortcuts on reliability, security, or user experience.**