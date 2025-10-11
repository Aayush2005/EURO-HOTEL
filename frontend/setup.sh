#!/bin/bash

echo "🏰 Euro Hotel Setup Script"
echo "=========================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created! Please update it with your credentials."
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your database and OAuth credentials"
echo "2. Set up your PostgreSQL database (see DATABASE_SETUP.md)"
echo "3. Run 'npx prisma db push' to create database tables"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed setup instructions, see DATABASE_SETUP.md"