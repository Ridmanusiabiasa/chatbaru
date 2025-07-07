# RidChat AI Application

## Overview

This is a full-stack AI chat application built with React (frontend) and Express.js (backend). The application provides a chat interface for users to interact with AI, along with a hidden admin dashboard for managing API keys and monitoring usage statistics.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Database Schema
- **Users**: Admin authentication with username/password
- **API Keys**: Management of external AI service API keys with usage tracking
- **Chat Messages**: Storage of conversation history with token counting
- **Usage Stats**: Detailed analytics for API usage and costs

### Frontend Components
- **Chat Interface**: Real-time messaging with AI responses
- **Admin Dashboard**: Login, API key management, and usage analytics
- **Sidebar Navigation**: Clean navigation between chat and admin sections
- **UI Library**: Comprehensive component library using shadcn/ui

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation (designed for easy database migration)
- **Route Handlers**: RESTful API endpoints for chat, admin operations, and analytics
- **Middleware**: Request logging, error handling, and development tooling

## Data Flow

1. **Chat Flow**: User sends message → Backend processes with AI service → Response stored and returned
2. **Admin Flow**: Login authentication → API key CRUD operations → Usage statistics retrieval
3. **Analytics Flow**: Real-time token usage tracking → Aggregated statistics display

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing solution
- **axios**: HTTP client for API requests

### Database & ORM
- **drizzle-orm**: Type-safe database toolkit
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-kit**: Database migrations and management

### UI & Styling
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution engine
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: TSX with auto-reload
- **Database**: In-memory storage for development

### Production Options

#### Option 1: Replit Deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles backend to `dist/index.js`
- **Server**: Single Node.js process serving both API and static files
- **Database**: In-memory storage (resets on restart)

#### Option 2: Netlify Deployment (Serverless)
- **Frontend**: Static files served by Netlify CDN from `dist/public`
- **Backend**: Express.js converted to serverless functions via `serverless-http`
- **API**: Runs as AWS Lambda functions through Netlify Functions
- **Database**: In-memory storage (resets on cold starts)
- **Configuration**: Uses `netlify.toml` and `functions/api.js`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

## Recent Changes
- July 07, 2025 - Added model selection feature (GPT-4o-mini, GPT-4o, GPT-4.1, GPT-4.1-nano)
- July 07, 2025 - Implemented ChatGPT-like dark theme throughout the application
- July 07, 2025 - Redesigned chat interface with modern message layout and typing indicators
- July 07, 2025 - Updated admin dashboard with dark theme consistency
- July 07, 2025 - Hidden admin dashboard from main navigation (accessible via /secret-admin-panel)
- July 07, 2025 - Added proper markdown rendering with syntax highlighting for code blocks
- July 07, 2025 - Changed avatars from square to circular design
- July 07, 2025 - Updated admin password to custom value (082254730892)
- July 07, 2025 - Removed default login information from admin login page
- July 07, 2025 - Prepared application for Netlify deployment with serverless functions

## User Preferences

Preferred communication style: Simple, everyday language.
UI Theme: Dark theme similar to ChatGPT
Model Selection: User can choose between multiple GPT models (GPT-4o-mini, GPT-4o, GPT-4.1, GPT-4.1-nano)