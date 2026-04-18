# Palugada Store

A modern e-commerce web store built with Next.js, React, and Tailwind CSS.

## Features

- 🛒 Shopping cart management with Zustand state management
- 🔍 Product search and filtering
- ⭐ Product reviews system
- 💝 Favorites/Wishlist functionality
- 📱 Responsive design with Tailwind CSS
- 🛍️ Product categorization and sorting
- 🎨 Modern UI components with Lucide React icons
- 📦 Optimized delivery tracking

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: Zustand
- **UI Components**: Custom React components + Lucide React icons
- **Icons**: Lucide React
- **Utilities**: clsx for conditional styling

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable React components
├── lib/                 # Utilities, types, and constants
└── store/              # Zustand store hooks
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Features Breakdown

### Cart Management
- Add/remove products from cart
- Update quantities
- Persistent cart state

### Product Browsing
- Product grid with filtering and sorting
- Product detail pages
- Category navigation

### User Features
- Search functionality
- Favorites/wishlist
- Product reviews
- Delivery information

## License

MIT - Feel free to use this project for personal or commercial purposes.
