# Euro Hotel Website - Frontend

A luxury hotel website frontend built with Next.js 14, featuring modern design, smooth animations, and responsive layouts. Ready for FastAPI backend integration.

## 🌟 Features

- **Modern Design**: Elegant, responsive UI with smooth animations using Framer Motion
- **Fully Responsive**: Optimized for all device sizes and touch interactions
- **Interactive Booking Form**: Complete booking flow with room selection and pricing
- **Contact System**: Professional contact form ready for backend integration
- **Room Showcase**: Beautiful room gallery with detailed information
- **Heritage Pages**: Showcase of hotel's history and luxury amenities
- **Clean Architecture**: Well-organized components and pages

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build**: Turbopack for fast development

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd hotel-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Access application
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
hotel-website/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── contact/           # Contact page
│   │   ├── events/            # Events page
│   │   ├── heritage/          # Heritage page
│   │   ├── rooms/             # Rooms showcase page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   └── components/            # React components
│       ├── Header.tsx         # Navigation header
│       ├── Footer.tsx         # Site footer
│       ├── HeroSection.tsx    # Hero section
│       ├── BookingForm.tsx    # Booking form
│       ├── HeritageSection.tsx # Heritage showcase
│       └── ...
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

## 🎨 Key Components

### **Header Component**
- Responsive navigation with mobile menu
- Smooth animations and transitions
- "BOOK NOW" and "Contact Us" buttons
- Mobile-friendly hamburger menu

### **BookingForm Component**
- Interactive room selection
- Date picker with validation
- Guest selection
- Price calculation
- Ready for FastAPI integration

### **Rooms Page**
- Beautiful room showcase
- Interactive "RESERVE NOW" buttons
- Room details and pricing
- Seamless navigation to booking form

### **Contact Page**
- Professional contact form
- Hotel information display
- Location and contact details
- Form validation and submission ready

## 🔗 FastAPI Integration Ready

The frontend is prepared for FastAPI backend integration:

### **Booking Form Data Structure**
```javascript
{
  roomType: 'deluxe' | 'royal' | 'executive' | 'presidential',
  checkIn: 'YYYY-MM-DD',
  checkOut: 'YYYY-MM-DD',
  guests: number,
  totalAmount: number,
  nights: number
}
```

### **Contact Form Data Structure**
```javascript
{
  name: string,
  email: string,
  phone: string,
  message: string
}
```

### **Integration Points**
- Replace `console.log()` calls with actual API endpoints
- Update form submission handlers in:
  - `src/components/BookingForm.tsx` (line ~60)
  - `src/app/contact/page.tsx` (line ~30)

## 📱 Responsive Design Features

- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Adaptive Layout**: Responsive grid system
- **Cross-Browser**: Compatible with all modern browsers
- **Performance**: Optimized images and code splitting

## 🎯 Pages Overview

### **Home Page (`/`)**
- Hero section with call-to-action
- Booking form integration
- Heritage showcase
- Room highlights

### **Rooms Page (`/rooms`)**
- Complete room showcase
- Interactive booking buttons
- Room details and pricing
- Direct booking integration

### **Heritage Page (`/heritage`)**
- Hotel history and legacy
- Luxury amenities showcase
- Cultural significance

### **Events Page (`/events`)**
- Event spaces and facilities
- Booking information
- Venue details

### **Contact Page (`/contact`)**
- Contact form
- Hotel information
- Location details
- Business hours

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## 🎨 Customization

### **Colors & Branding**
- Update `tailwind.config.ts` for color scheme
- Modify `src/app/globals.css` for custom styles
- Replace logo images in `public/` directory

### **Content Updates**
- Update hotel information in components
- Modify room details in `src/app/rooms/page.tsx`
- Update contact information in `src/app/contact/page.tsx`

### **Styling**
- All styles use Tailwind CSS
- Custom components in `globals.css`
- Responsive breakpoints configured
- Animation variants in components

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📊 Performance Features

- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and images
- **Caching**: Proper cache headers
- **Compression**: Automatic compression

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create GitHub issue for bugs
- Check documentation for common solutions
- Review component code for customization examples

---

**Ready for FastAPI Backend Integration** 🚀

The frontend is completely functional and ready to be connected to your FastAPI backend. Simply replace the console.log statements in the form handlers with actual API calls to your FastAPI endpoints.