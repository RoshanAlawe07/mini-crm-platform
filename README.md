# Mini CRM Platform

A modern, full-stack CRM platform built with React.js, Node.js, and Express.js.

## Architecture

- **Frontend**: React.js with Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Caching & Queues**: Redis
- **Authentication**: JWT
- **File Upload**: Multer with Sharp for image processing

## Project Structure

```
mini-crm-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── workers/         # Background job workers
│   │   ├── queues/          # Queue definitions
│   │   ├── routes/          # API routes
│   │   ├── prisma/          # Database schema and migrations
│   │   └── index.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and configurations
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── architecture.png     # System architecture diagram
│   └── ERD.png             # Database entity relationship diagram
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-crm-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd ../backend
   cp env.example .env
   # Edit .env with your database and other configuration
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database
   npm run prisma:push
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Joi
- **Queue**: Bull (Redis)
- **Email**: Nodemailer
- **File Upload**: Multer + Sharp

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons, Lucide React
- **Forms**: React Hook Form + Zod
- **State Management**: React Query
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## Features

- **Customer Management**: Complete CRUD operations for customers with pagination and filtering
- **Order Management**: Create, track, and manage orders with automatic customer spend updates
- **User Authentication**: JWT-based authentication system
- **Campaign Management**: Create and manage marketing campaigns
- **Segment Management**: Dynamic customer segmentation with rule-based filtering
- **File Upload**: Handle file uploads with image processing
- **Email Integration**: Send emails and notifications
- **Background Jobs**: Queue system for heavy operations
- **Real-time Updates**: Automatic data refresh after operations

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation with Joi
- Password hashing with bcrypt
- JWT token authentication
- File upload validation

## API Documentation

The API documentation will be available at `/api/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.